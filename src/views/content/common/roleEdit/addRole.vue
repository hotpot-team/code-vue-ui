<template>
    <div class="cardContainer">
        <Card dis-hover class="cardItem">
            <h3 slot="title">
                <span>访问控制</span>
                <Button @click="saveRoleFunc" type="info" class="saveBtn">保存</Button>
            </h3>
            <el-tree ref="elTree" :data="menuTree" node-key="id" show-checkbox :default-checked-keys="checkKeys" default-expand-all :check-strictly="true" @check="menuCheck"></el-tree>
        </Card>
        <Card dis-hover class="cardItem">
            <h3 slot="title">角色人员</h3>
            <Tabs type="card" class="too" :animated="false">
                <TabPane label="人员" name="person" class="tab-pane">
                    <div class="people">
                        <div class="people-button">
                            <Button type="error" style="margin-left: 8px" @click="personDelete('personTable')">
                                <Icon type="trash-a"></Icon>
                                删除
                            </Button>
                            <person-input type="info" :org="false" :team="false" @on-selection-data="addPerson">
                                <Icon type="plus-round"></Icon>
                                添加
                            </person-input>
                        </div>
                        <Table border :columns="peopleCol" :data="personData" ref="personTable"></Table>
                    </div>
                </TabPane>
                <TabPane label="组织" name="company" class="tab-pane">
                    <div class="people">
                        <div class="people-button">
                            <Button type="error" style="margin-left: 8px" @click="personDelete('companyTable')">
                                <Icon type="trash-a"></Icon>
                                删除
                            </Button>
                            <person-input type="info" :person="false" :team="false" @on-selection-data="addOrg">
                                <Icon type="plus-round"></Icon>
                                添加
                            </person-input>
                        </div>
                        <Table border :columns="companyCol" :data="orgData" ref="companyTable"></Table>
                    </div>
                </TabPane>
            </Tabs>
        </Card>
    </div>
</template>
<script>
    //import Util from '../../../../libs/util';
    import TreeUtil from '../../../../treeUtil';
    //import Axios from 'axios';
    export default {
        data() {
            return {
                menuTree: [],
                checkKeys:[], //默认选中
                peopleCol:[{
                    type: 'selection',
                    width: 60,
                    align: 'center'
                },{
                    title: '登录名',
                    render:(h, param)=>{
                        return h('span',{}, param.row.hotpotUser.userName);
                    }
                },{
                    title: '昵称',
                    render:(h, param)=>{
                        return h('span',{}, param.row.hotpotUser.name);
                    }
                },{
                    title: '组织',
                    render:(h, param)=>{
                        return h('span',{}, param.row.hotpotOrganization.orgFullName);
                    }
                }],
                personData:[],
                companyCol:[{
                    type: 'selection',
                    width: 60,
                    align: 'center'
                },{
                    title: '组织',
                    key: 'orgFullName'
                },{
                    title: '组织名',
                    key: 'orgName'
                },{
                    title: '描述',
                    key: 'description'
                }],
                orgData:[],
                nodeMap:{},
                orgModel: false
            };
        },
        created(){
            let _this = this;
            this.nodeMap = {};
            this.$http.get('/roleMag/' + this.$route.query.roleId + '/functions').then((res)=>{
                let arryFunc = res.data.map((item)=>{
                    if (item.enabled === 'Y')
                        _this.checkKeys.push(item.id);
                    _this.nodeMap[item.id] = item;
                    return {
                        label: item.functionName,
                        id: item.id,
                        parentId: item.parentId
                    };
                });
                this.menuTree = TreeUtil.transformToTreeFormat(arryFunc);
            });
            this.userTableInit();
            this.orgTableInit();
        },
        methods: {
            saveRoleFunc(){
                this.$http.put('/roleMag/' + this.$route.query.roleId + '/functions', this.$refs.elTree.getCheckedKeys()).then((res)=>{
                    if (res.status === 200)
                        this.$Message.success('保存成功!');
                });
            },
            userTableInit(){
                this.$http.get('/roleMag/' + this.$route.query.roleId + '/users').then((res)=>{
                    this.personData = res.data;
                });
            },
            orgTableInit(){
                this.$http.get('/roleMag/' + this.$route.query.roleId + '/orgs').then((res)=>{
                    this.orgData = res.data;
                });
            },
            //复选框点击监听
            menuCheck(node, isChecked){
                // 如果勾选
                if (isChecked.checkedKeys.indexOf(node.id) > -1) {
                    // 勾选父节点
                    this.parentCheck(node);
                    // 勾选子节点
                    this.childCheck(node.children);
                }
                // 取消勾选
                if (isChecked.checkedKeys.indexOf(node.id) < 0 &&  node.children instanceof Array) {
                    // 取消所有子节点勾选
                    this.cancelChecked(node.children);
                }
            },
            parentCheck(node){
                if (this.nodeMap[node.parentId]) {
                    // 父节点勾选
                    this.$refs.elTree.setChecked(node.parentId, true);
                    // 递归父节点
                    this.parentCheck(this.nodeMap[node.parentId]);
                }
            },
            childCheck(childList){
                // 遍历所有子节点
                if (childList && childList.length > 0) {
                    for (let i = 0; i < childList.length; i++) {
                        this.$refs.elTree.setChecked(childList[i].id, true);
                        // 递归子节点
                        this.childCheck(childList[i].children);
                    }
                }
            },
            cancelChecked(list) {
                for (let i = 0; i < list.length; i++) {
                    // 子节点取消选中
                    this.$refs.elTree.setChecked(list[i].id, false);
                    if (list[i].children instanceof Array && list[i].children.length > 0) {
                        this.cancelChecked(list[i].children);
                    }
                }
            },
            addPerson(data){
                let map = new Map();
                this.personData.forEach((item)=>{
                    map.set(item.hotpotUser.id, item);
                });
                let arr = [];
                data.personList.forEach((item)=>{
                    if (!map.has(item.hotpotUser.id)) {
                        arr.push(item.hotpotUser.id);
                    }
                });
                this.$http.put('/roleMag/'+this.$route.query.roleId + '/partys/0',arr).then((res)=>{
                    if (res.status === 200) {
                        this.userTableInit();
                        this.$Message.success('添加成功!');
                    }
                });
            },
            personDelete(ref){
                let arr = [];
                arr = this.$refs[ref].getSelection().map((item)=>{
                    if (ref === 'personTable'){
                        return item.hotpotUser.id;
                    } else {
                        return item.id;
                    }
                });
                this.$http.post('/roleMag/'+this.$route.query.roleId + '/partys/delete',arr).then((res)=>{
                    if (res.status === 200) {
                        if (ref === 'personTable') {
                            this.userTableInit();
                        } else {
                            this.orgTableInit();
                        }
                        this.$Message.info('删除成功!');
                    }
                });
            },
            addOrg(data){
                let map = new Map();
                this.orgData.forEach((item)=>{
                    map.set(item.id, item);
                });
                let arr = [];
                data.orgList.forEach((item)=>{
                    if (!map.has(item.id)) {
                        arr.push(item.id);
                    }
                });
                this.$http.put('/roleMag/'+this.$route.query.roleId + '/partys/1',arr).then((res)=>{
                    if (res.status === 200) {
                        this.orgTableInit();
                        this.$Message.success('添加成功!');
                    }
                });
            }
        }
    };
</script>
<style lang="scss" scoped>
    .cardContainer {
        @include compatibleFlex;
        flex-flow: row nowrap;
        padding: 16px;
        @include flex-justify;

        .saveBtn{
            position: absolute;
            right: 16px;
            top: 6px;
        }
    }
    .cardItem:nth-child(1) {
        width: 30%;
    }
    .cardItem:nth-child(2) {
        width: 69%;
    }
    .formButtons {
        @include compatibleFlex;
        flex-flow: row nowrap;
        @include flex-justify('center');
        button {
            margin: 0 6px;
        }
    }
    .icon-modal-style {
        .ivu-modal-body {
            height: 400px;
            overflow: auto;
        }
    }
    .icon-item {
        margin: 8px;
        i {
            font-size: 24px;
            &:hover {
                color: #2d8cf0;
                cursor: pointer;
            }

        }
    }
</style>
<style lang="scss">
    .cardContainer{
        .too{
            .ivu-tabs-bar{
                margin: 0;
            }
            .people-button {
                @include compatibleFlex;
                @include flex-direction('row-reverse');
                margin-bottom: 16px;
            }
            .tab-pane{
                border: 1px solid #dddee1;
                padding: 16px;
                border-top: none;
            }
        }
    }

    .el-checkbox__inner{
        width: 14px;
        height: 14px;
        border: 1px solid #dddee1;
        border-radius: 2px;
    }
    .el-checkbox__inner:after{
        content: "";
        display: table;
        width: 4px;
        height: 8px;
        position: absolute;
        top: 1px;
        left: 4px;
        border: 2px solid #fff;
        border-top: 0;
        border-left: 0;
        transition: all .2s ease-in-out;
        box-sizing: border-box;
    }
    .el-tree-node__expand-icon{
        color: #495060;
    }
</style>
<style lang="scss" scoped>
    .person-select-content {
        display: flex;
        justify-content: space-between;
        .left-content, .right-content {
            height: 100%;
            display: inline-block;
            width: 248px;
            .person-list {
                height: 100%;
                &.left {
                    margin-top: 8px;
                    height: calc(100% - 38px);
                    .person-page {
                        margin-top: 4px;
                        display: flex;
                        justify-content: space-between;
                        line-height: 24px;
                    }
                    .person-search {
                        padding: 4px 4px;
                        border: 1px solid #dddee1;
                        border-top: none;
                    }
                }
            }
            .result-list {
                border: 1px solid #dddee1;
                margin-top: 72px;
                padding: 4px;
                overflow: auto;
                ul {
                    li {
                        padding: 0 8px 2px 8px;
                        white-space:nowrap;
                        &.active {
                            background-color: #ebf7ff;
                        }
                        &:hover {
                            cursor: pointer;
                        }
                        i{
                            font-size: 16px;
                            vertical-align: text-bottom;
                            margin-right: 3px;
                            color: #5cadff;
                        }
                    }
                }
            }
        }
        .control {
            display: flex;
            flex-direction: column;
            margin: auto 0;
            .control-btn {
                margin-bottom: 8px;
            }
        }
    }
</style>
<style lang="scss">
    .person-select-content{
        .person-list{
            .ivu-tabs-bar{
                margin: 0;
                .ivu-tabs-nav-container{
                    height: auto;
                    .ivu-tabs-tab{
                        font-size: 14px;
                        padding: 4px 10px;
                    }
                }
            }
            .ivu-table-wrapper{
                border-top: none;
                .ivu-table-small{
                    td{
                        height: 26px;
                        border: none;
                        min-width: auto;
                        .ivu-table-cell{
                            padding: 0;
                        }
                        &:last-child{
                            .ivu-table-cell{
                                padding-right: 10px;
                            }
                        }
                        &:first-child{
                            .ivu-table-cell{
                                padding-left: 10px;
                                text-overflow: clip;
                            }
                        }
                    }
                }
            }

            .el-tree{
                border: 1px solid #dddee1;
                border-top: none;
                height: 100%;
                overflow: auto;
                .el-tree-node__content{
                    height: 26px;
                    line-height: 26px;
                    font-size: 14px;

                    .el-checkbox{
                        .el-checkbox__input{
                            vertical-align: middle;
                        }
                    }
                }
            }
        }
        .el-loading-spinner .circular {
            height: 24px;
            width: 24px;
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
        margin-left: 8px;
        border: 5px solid transparent;
        -webkit-transform-origin: 25% 50%;
        transform-origin: 25% 50%;
        border-left-color: #495060;
    }
    .el-tree-node__expand-icon:hover{
        border-left-color: #495060;
    }
</style>
<template>
    <div class="person-select">
        <Input v-if="single && person" v-model="currentValue" icon="ios-person-outline" @on-focus="showModel = true" :readonly="true"></Input>
        <Input v-else v-model="currentValue" @on-focus="showModel = true" :readonly="true"></Input>
        <Modal
                v-model="showModel"
                title="人员选择"
                :width="600"
                @on-ok="completeSelect"
                :transfer="false">
            <div class="person-select-content" :style="single?'height:403px': 'height:435px'">
                <div class="left-content">
                    <div>
                        <Select v-model="orgId">
                            <Option v-for="item in companys" :key="item.organizationId" :value="item.organizationId"
                                    :label="item.organizationName"></Option>
                        </Select>
                    </div>
                    <div class="person-list left">
                        <Tabs type="card" :animated="false" v-model="actTab">
                            <TabPane label="人员" name="personTab" v-if="person">
                                <div class="person-search">
                                    <Input v-model="keyWords" @on-enter="currentPage=0;searchPerson(0, 10)">
                                    <Button slot="append" icon="ios-search" @click="currentPage=0;searchPerson(0, 10)"></Button>
                                    </Input>
                                </div>
                                <div class="person-search" style="border-bottom: none" v-if="!single">
                                    <Button size="small" @click="selectAll('personTable',true)">全选</Button>
                                    <Button size="small" @click="selectAll('personTable',false)">反选</Button>
                                </div>
                                <Table ref="personTable" :data="rightData" :columns="rightColumns" :height="262" :show-header="false" size="small" :highlight-row="single"></Table>
                                <div class="person-page">
                                    <span>共{{personTotal}}条 / 第{{currentPage+1}}页</span>
                                    <div>
                                        <Button size="small" :disabled="currentPage == 0" icon="ios-skipbackward" @click="currentPage=0;searchPerson(0, 10)"></Button>
                                        <Button size="small" :disabled="currentPage == 0" icon="arrow-left-b"  @click="currentPage = currentPage-1;searchPerson(currentPage, 10)"></Button>
                                        <Button size="small" :disabled="currentPage == Math.ceil(personTotal/10) - 1" icon="arrow-right-b" @click="currentPage = currentPage+1;searchPerson(currentPage, 10)"></Button>
                                        <Button size="small" :disabled="currentPage == Math.ceil(personTotal/10) - 1" icon="ios-skipforward" @click="currentPage = (Math.ceil(personTotal/10) - 1);searchPerson(currentPage, 10)"></Button>
                                    </div>
                                </div>
                            </TabPane>
                            <TabPane label="部门" name="depTab" v-if="department">
                                <div :style="single?'height:331px': 'height:363px'">
                                    <el-tree :data="depTree" :props="defaultProps" v-loading="treeLoading" :show-checkbox="!single" :check-strictly="true" :load="loadDepNode" lazy ref="depElTree" :highlight-current="single"  @current-change="depCurrentChange"></el-tree>
                                </div>
                            </TabPane>
                            <TabPane label="群组" name="teamTab" v-if="team">
                                <div class="person-search">
                                    <Input v-model="teamSearch" @on-keyup="filterTeam">
                                    <Button slot="append" icon="ios-search" @click=""></Button>
                                    </Input>
                                </div>
                                <div class="person-search" style="border-bottom: none" v-if="!single">
                                    <Button size="small" @click="selectAll('teamTable',true)">全选</Button>
                                    <Button size="small" @click="selectAll('teamTable',false)">反选</Button>
                                </div>
                                <Table ref="teamTable" :data="filterTeamList" :columns="teamColumns" :height="290" :show-header="false" size="small" :highlight-row="single"></Table>
                            </TabPane>
                        </Tabs>
                    </div>
                </div>
                <div class="control">
                    <Button size="small" class="control-btn" @click="resultSelect">选择</Button>
                    <Button size="small" class="control-btn" @click="resultRemove" v-if="!single">删除</Button>
                    <Button size="small" class="control-btn" @click="resultClear">清空</Button>
                </div>
                <div class="right-content">
                    <div class="result-list" :style="single?'height:331px': 'height:363px'">
                        <ul>
                            <li v-for="user in result.personList" :class="user.checkTemp? 'active': ''" @click="user.checkTemp = !user.checkTemp"><Icon type="ios-person"></Icon>{{user.userFullName}}</li>
                            <li v-for="dep in result.departmentList" :class="dep.checkTemp? 'active': ''" @click="dep.checkTemp = !dep.checkTemp"><Icon type="ios-flag"></Icon>{{dep.fullDepartmentName}}</li>
                            <li v-for="team in result.teamList" :class="team.checkTemp? 'active': ''"  @click="team.checkTemp = !team.checkTemp"><Icon type="ios-people"></Icon></Icon>{{team.teamName}}</li>
                        </ul>
                    </div>
                </div>
            </div>
        </Modal>
    </div>
</template>
<script>
    import Util from '../../../libs/util';

    export default {
        props: {
            value: {
                type: [String, Number],
                default: ''
            },
            person:{
                type: Boolean, //人员选择
                default: true
            },
            department:{
                type: Boolean, //部门选择
                default: true
            },
            team:{
                type: Boolean,//组织选择
                default: true
            },
            single: {
                type:Boolean,//是否单选
                default: false
            }
        },
        created() {
            if (!this.single) {
                this.rightColumns.splice(0,0, {
                    type: 'selection',
                    width: 30,
                    align: 'center'
                });
                this.teamColumns.splice(0,0, {
                    type: 'selection',
                    width: 30,
                    align: 'center'
                });
            }
            this.initCompany();
        },
        data() {
            return {
                currentValue: this.value,
                currentDep: {},
                showModel: false,
                actTab: this.person?'personTab' : this.department? 'depTab': this.team? 'teamTab': '',
                companys: [],
                orgId: '',
                keyWords: '',
                personTotal: 0,
                currentPage: 0,
                rightData: [],
                depTree: [],
                treeLoading: false,
                defaultProps: {
                    children: 'children',
                    label: 'departmentName',
                    isLeaf: function (data, node) {
                        return !data.hasChildren;
                    }
                },
                teamList: [],
                filterTeamList:[],
                teamSearch: '',
                teamCheckGroup:[],
                rightColumns: [{
                    key: 'userDesc',
                    ellipsis: true,
                    render: (h, params) => {
                        let userInfo = JSON.parse(this.base64.decode(params.row.userDesc));
                        let depFull = userInfo.departmentName;
                        return h('span',userInfo.userName + " /" + depFull.replace(/_/g, '/'));
                    }
                }],
                teamColumns: [{
                    title: '团队名称',
                    ellipsis: true,
                    key: 'teamName'
                }],
                result:{
                    personList:[],
                    departmentList:[],
                    teamList:[]
                }
            };
        },
        methods: {
            depCurrentChange(data){
                this.currentDep = Object.assign({}, this.currentDep, data);
            },
            initCompany() {
                Util.$http.get('/rescenter-rest/ResCenterApi/getOrganizationList', {
                    params: {
                        identityToken: this.getToken(),
                        pageIndex: 0,
                        pageSize: 0
                    }
                }).then((response) => {
                    if (response.data.result === '1') {
                        this.companys = response.data.data.organizationList;
                        //this.orgId = this.companys[0].organizationId;
                        this.orgId = '8f4ddf6d-507a-4835-8db5-84e1480823f0';
                    }
                });
            },
            //获取所有部门
            departmentInit(organizationId){
                this.treeLoading = true;
                Util.$http.get('/rescenter-rest/ResCenterApi/getDepartmentListByOrgID', {
                    params:{
                        identityToken: this.getToken(),
                        organizationId: organizationId,
                        allChild: false,
                        pageIndex: 0,
                        pageSize: 0
                    }
                }).then((response) => {
                    if (response.data.result === '1') {
                        this.depTree = response.data.data.departmentList;
                        this.treeLoading = false;
                    }
                }).catch(function(e) {
                    this.treeLoading = false;
                });
            },
            loadDepNode(node, resolve) {
                if (node.data.hasChildren) {
                    Util.$http.get('/rescenter-rest/ResCenterApi/getChildDepartmentList', {
                        params:{
                            identityToken: this.getToken(),
                            departmentID: node.data.departmentId,
                            allChild: false,
                            pageIndex: 0,
                            pageSize: 0
                        }
                    }).then((response) => {
                        if (response.data.result === '1') {
                            resolve(response.data.data.departmentList);
                        }
                    });
                } else {
                    resolve([]);
                }
            },
            //人员选择 查询
            searchPerson(pageIndex, pageSize) {
                Util.$http.get('/rescenter-rest/ResCenterApi/getUserListBySearch', {
                    params: {
                        identityToken: this.getToken(),
                        keyWords: this.keyWords,
                        organizationID: this.orgId,
//                        departmentID: this.addPersonSearch.departmentId,
                        allChild: false,
                        pageIndex: pageIndex,
                        pageSize: pageSize
                    }
                }).then((response) => {
                    if (response.data.result === '1') {
                        this.rightData = response.data.data.userList;
                        this.personTotal = response.data.data.recordCount;
                    }
                });
            },
            //团队查询
            searchTeam() {
                Util.$http.get('/rescenter-rest/ResCenterApi/getTeamListByOrgID',{
                    params:{
                        identityToken: this.getToken(),
                        organizationId: this.orgId,
                        allChild: false,
                        pageIndex: 0,
                        pageSize: 0
                    }
                }).then((response)=>{
                    if (response.data.result === '1') {
                        this.teamList = response.data.data.teamList;
                        this.filterTeamList = response.data.data.teamList;
                    }
                });
            },
            //团队筛选
            filterTeam(){
                this.filterTeamList = this.teamList.filter((item)=>{
                    return item.teamName.indexOf(this.teamSearch) > -1;
                });
            },
            selectAll(r, status){
                if (status) {
                    this.$refs[r].selectAll(status);
                } else {
                    this.$refs[r].rebuildData.forEach((data) => {
                        if(this.$refs[r].objData[data._index]._isDisabled){
                            this.$refs[r].objData[data._index]._isChecked = false;
                        }else{
                            this.$refs[r].objData[data._index]._isChecked = !this.$refs[r].objData[data._index]._isChecked;
                        }
                    });
                }
            },
            resultClear(){
                this.result ={
                    personList: [],
                    departmentList: [],
                    teamList: []
                };
            },
            resultRemove(){
                for (let key in this.result) {
                    this.result[key].forEach((item, index)=>{
                        if (item.checkTemp) {
                            this.result[key].splice(index, 1);
                        }
                    });
                }
            },
            resultSelect(){
                if (this.single) {
                    this.resultClear();
                    if (this.actTab === 'personTab'){
                        Object.values(this.$refs.personTable.objData).forEach((obj)=>{
                            if (obj._isHighlight) {
                                obj = Object.assign({}, obj, {
                                    valueTemp: obj.userFullName
                                });
                                this.result.personList.push(obj);
                            }
                        });
                    } else if (this.actTab === 'depTab') {
                        let dep = this.currentDep;
                        if (dep) {
                            dep = Object.assign({}, dep, {
                                fullDepartmentName: JSON.parse(dep.departmentDesc).fullDepartmentName.replace(/_/g, '/'),
                                valueTemp: dep.departmentName
                            });
                        }
                        this.result.departmentList.push(dep);
                    } else if (this.actTab === 'teamTab') {
                        Object.values(this.$refs.teamTable.objData).forEach((obj)=>{
                            if (obj._isHighlight) {
                                obj = Object.assign({}, obj, {
                                    valueTemp: obj.teamName
                                });
                                this.result.teamList.push(obj);
                            }
                        });
                    }
                } else {
                    let map = new Map();
                    if (this.actTab === 'personTab') {
                        this.result.personList.forEach((user)=>{
                            map.set(user.userId, user);
                        });

                        this.$refs.personTable.getSelection().forEach((value)=>{
                            if (!map.has(value.userId)) {
                                let userInfo = JSON.parse(this.base64.decode(value.userDesc));
                                value = Object.assign({}, value, {
                                    checkTemp: false,
                                    valueTemp: value.userFullName
                                });
                                this.result.personList.push(value);
                            }
                        });
                    } else if (this.actTab === 'depTab') {
                        this.result.departmentList.forEach((dep)=>{
                            map.set(dep.departmentId, dep);
                        });
                        this.$refs.depElTree.getCheckedNodes().forEach((dep)=>{
                            if (!map.has(dep.departmentId)) {
                                dep = Object.assign({}, dep, {
                                    fullDepartmentName: JSON.parse(dep.departmentDesc).fullDepartmentName.replace(/_/g, '/'),
                                    checkTemp: false,
                                    valueTemp: dep.departmentName
                                });
                                this.result.departmentList.push(dep);
                            }
                        });
                    } else if (this.actTab === 'teamTab') {
                        this.result.teamList.forEach((team)=>{
                            map.set(team.teamID, team);
                        });
                        this.$refs.teamTable.getSelection().forEach((team)=>{
                            if (!map.has(team.teamID)) {
                                team = Object.assign({}, team, {
                                    checkTemp: false,
                                    valueTemp: team.teamName
                                });
                                this.result.teamList.push(team);
                            }
                        });
                    }
                }
            },
            transFormToTreeFormat(depList) {
                let i,
                    key= 'departmentId',
                    parentKey= 'parentId',
                    childKey= 'children';
                if (!depList) return [];

                if (depList instanceof  Array) {
                    let r = [];
                    let tmpMap = {};
                    for (i = 0; i < depList.length; i++) {
                        tmpMap[depList[i][key]] = depList[i];
                    }
                    for (i = 0; i <  depList.length; i++) {
                        if (tmpMap[depList[i][parentKey]] && depList[i][key] !== depList[i][parentKey]) {
                            if (!tmpMap[depList[i][parentKey]][childKey]) {
                                tmpMap[depList[i][parentKey]][childKey] = [];
                            }
                            tmpMap[depList[i][parentKey]][childKey].push(depList[i]);
                        } else {
                            r.push(depList[i])
                        }
                    }
                    return r;
                } else {
                    return [depList];
                }
            },
            getToken() {
                let loginInfo = JSON.parse(localStorage.getItem('loginInfo'));
                return loginInfo.authToken;
            },
            completeSelect(){
                this.showModel = false;
                let val = '';
                this.currentValue= '';
                for (let key in this.result) {
                    this.result[key].forEach((item)=>{
                        val += item.valueTemp + ',';
                    });
                }
                if (val !== '') {
                    this.currentValue = val.substr(0, val.length - 1);
                }
                this.$emit('input', this.currentValue);
                this.$emit('getJsonData', this.result);
            }
        },
        watch:{
            value (val) {
                this.currentValue = val;
            },
            orgId: function (val, old) {
                if (this.person) {
                    this.searchPerson(0, 10);
                }
                if (this.department) {
                    this.departmentInit(val);
                }
                if (this.team) {
                    this.searchTeam();
                }
            }
        }
    };
</script>
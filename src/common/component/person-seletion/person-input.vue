<style lang="scss" scoped>
    .person-select-content {
        @include compatibleFlex;
        @include flex-justify;
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
                        @include compatibleFlex;
                        @include flex-justify;
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
                margin-top: 40px;
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
            @include compatibleFlex;
            @include flex-direction(column);
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
                width: 100%;
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
</style>
<template>
    <div class="person-select">
        <div v-if="type === 'input'">
            <Input v-if="single && person" v-model="currentValue" icon="ios-person-outline" @on-focus="initData" :readonly="true"></Input>
            <Input v-else v-model="currentValue" @on-focus="initData" :readonly="true"></Input>
        </div>
        <div v-else>
            <Button :type="type" :shape="shape" :size="size" :loading="loading" :icon="icon" :disabled="disabled" :long="long"  @click="initData"><slot></slot></Button>
        </div>
        <Modal
                v-model="showModel"
                title="人员选择"
                :width="600"
                @on-ok="completeSelect"
                :transfer="true">
            <div class="person-select-content" :style="single?'height:383px': 'height:415px'">
                <div class="left-content">
                    <div class="person-list left">
                        <Tabs type="card" :animated="false" v-model="actTab">
                            <TabPane label="人员" name="personTab" v-if="person">
                                <div class="person-search">
                                    <Input v-model="keyWords" @on-enter="currentPage=1;searchPerson(1, 10)">
                                    <Button slot="append" icon="ios-search" @click="currentPage=1;searchPerson(1, 10)"></Button>
                                    </Input>
                                </div>
                                <div class="person-search" style="border-bottom: none" v-if="!single">
                                    <Button size="small" @click="selectAll('personTable',true)">全选</Button>
                                    <Button size="small" @click="selectAll('personTable',false)">反选</Button>
                                </div>
                                <Table ref="personTable" :data="rightData" :columns="rightColumns" :showHeader="false" :height="262" size="small" :highlight-row="single"></Table>
                                <div class="person-page">
                                    <span>共{{personTotal}}条 / 第{{currentPage}}页</span>
                                    <div>
                                        <Button size="small" :disabled="currentPage == 1" icon="ios-skipbackward" @click="currentPage = 1;searchPerson(1, 10)"></Button>
                                        <Button size="small" :disabled="currentPage == 1" icon="arrow-left-b"  @click="currentPage = currentPage - 1;searchPerson(currentPage, 10)"></Button>
                                        <Button size="small" :disabled="currentPage == Math.floor(personTotal/10)+1" icon="arrow-right-b" @click="currentPage = currentPage+1;searchPerson(currentPage, 10)"></Button>
                                        <Button size="small" :disabled="currentPage == Math.floor(personTotal/10)+1" icon="ios-skipforward" @click="currentPage = (Math.floor(personTotal/10) + 1);searchPerson(currentPage, 10)"></Button>
                                    </div>
                                </div>
                            </TabPane>
                            <TabPane label="组织" name="depTab" v-if="org">
                                <div :style="single?'height:331px': 'height:363px'">
                                    <el-tree :default-expand-all="true" :data="depTree" :props="defaultProps" v-loading="treeLoading" :show-checkbox="!single" :check-strictly="true" ref="depElTree" :highlight-current="single"  @current-change="depCurrentChange"></el-tree>
                                </div>
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
                            <li v-for="user in result.personList" :class="user.checkTemp? 'active': ''" @click="user.checkTemp = !user.checkTemp"><Icon type="ios-person"></Icon>{{user.hotpotUser.name}}</li>
                            <li v-for="dep in result.orgList" :class="dep.checkTemp? 'active': ''" @click="dep.checkTemp = !dep.checkTemp"><Icon type="ios-flag"></Icon>{{dep.orgFullName}}</li>
                        </ul>
                    </div>
                </div>
            </div>
        </Modal>
    </div>
</template>
<script>
    //import Util from '../../../libs/util';
    import TreeUtil from '../../../treeUtil';
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
            org:{
                type: Boolean, //部门选择
                default: true
            },
            single: {
                type:Boolean,//是否单选
                default: false
            },
            type: {
                type: String,
                default: 'input'
            },
            shape: {
                type: String
            },
            size: {
                type: String
            },
            loading: Boolean,
            disabled: Boolean,
            icon: String,
            long: {
                type: Boolean,
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
            }
        },
        data() {
            return {
                currentValue: this.value,
                currentDep: {},
                showModel: false,
                actTab: this.person?'personTab' : this.org? 'depTab': '',
                keyWords: '',
                personTotal: 0,
                currentPage: 1,
                rightData: [],
                depTree: [],
                treeLoading: false,
                defaultProps: {
                    children: 'children',
                    label: 'orgName'
                },
                rightColumns: [{
                    key: 'name',
                    ellipsis: true,
                    render: (h, params) => {
                        return h('span',params.row.hotpotUser.name + ''  +  params.row.hotpotOrganization.orgFullName);
                    }
                }],
                result:{
                    personList:[],
                    orgList:[]
                }
            };
        },
        methods: {
            initData(){
                this.keyWords = '';
                this.currentPage = 1;
                this.personTotal = 0;
                this.showModel = true;
                if (this.person) {
                    this.searchPerson(1, 10);
                }
                if (this.org) {
                    this.orgInit();
                }
                this.result = {
                    personList:[],
                    orgList:[]
                };
            },
            depCurrentChange(data){
                this.currentDep = Object.assign({}, this.currentDep, data);
            },
            //获取所有部门
            orgInit(){
                this.treeLoading = true;
                this.$http.post('/orgMag/list', {
                    pageParms: {
                        pageIndex: 0,
                        pageSize: 0
                    }
                }).then((response) => {
                    this.depTree = TreeUtil.transformToTreeFormat(response.data.data);
                    this.treeLoading = false;
                }).catch(function() {
                    this.treeLoading = false;
                });
            },
            //人员选择 查询
            searchPerson(pageIndex, pageSize) {
                this.$http.post('/security/users', {
                    collection: {
                        filters: [
                            {
                                field: 'hotpotUser.name',
                                operator: 'LIKE',
                                value: this.keyWords
                            }
                        ]
                    },
                    orders: [
                        {
                            fieldName: 'hotpotUser.createdAt',
                            orderType: 'DESC'
                        }
                    ],
                    pageParms: {
                        pageIndex: pageIndex,
                        pageSize: pageSize
                    }
                }).then((response) => {
                    this.rightData = response.data.data;
                    this.personTotal = response.data.totalElements;
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
                    orgList: []
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
                                obj.valueTemp = obj.hotpotUser.name;
                                this.result.personList.push(obj);
                            }
                        });
                    } else if (this.actTab === 'depTab') {
                        let dep = this.currentDep;
                        dep.valueTemp = dep.orgName;
                        this.result.orgList.push(dep);
                    }
                } else {
                    let map = new Map();
                    if (this.actTab === 'personTab') {
                        this.result.personList.forEach((user)=>{
                            map.set(user.hotpotUser.id, user);
                        });

                        this.$refs.personTable.getSelection().forEach((value)=>{
                            if (!map.has(value.hotpotUser.id)) {
                                value.checkTemp = false;
                                value.valueTemp = value.hotpotUser.name;
                                this.result.personList.push(value);
                            }
                        });
                    } else if (this.actTab === 'depTab') {
                        this.result.orgList.forEach((dep)=>{
                            map.set(dep.id, dep);
                        });
                        this.$refs.depElTree.getCheckedNodes().forEach((dep)=>{
                            if (!map.has(dep.id)) {
                                dep.checkTemp = false;
                                dep.valueTemp = dep.orgName;
                                this.result.orgList.push(dep);
                            }
                        });
                    }
                }
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
                this.$emit('on-selection-data', JSON.parse(JSON.stringify(this.result)));
                this.result = {
                    personList:[],
                    orgList:[]
                };
            }
        },
        watch:{
            value (val) {
                this.currentValue = val;
            }
        }
    };
</script>
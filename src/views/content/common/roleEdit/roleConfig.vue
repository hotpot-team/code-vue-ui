<template>
    <div class="role-config" style="padding: 16px">
        <Modal
            v-model="stats.rolemodal"
            :mask-closable="false"
            :title="stats.isRoleAdding? '新增角色': '修改角色'">
            <Form ref="roleModalValid"  :model="roleModalForm"  :label-width="80" :rules="rolerules">
                <FormItem label="角色名" prop="roleName" >
                    <Input v-model="roleModalForm.roleName" style="width: 85%"></Input>
                </FormItem>
                <FormItem label="描述">
                    <Input v-model="roleModalForm.description" style="width: 85%"></Input>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="ghost" @click="stats.rolemodal = false">取消</Button>
                <Button type="primary" @click="roleModalOK" >确定</Button>
            </div>
        </Modal>
        <Form :model="roleSearchItem" inline>
            <FormItem label="角色名">
                <Input v-model="roleSearchItem.roleName" style="width: 180px" @on-enter="getRoleData"></Input>
            </FormItem>
            <FormItem label="创建时间" class="roleSearchItem-css">
                <DatePicker  v-model="roleSearchItem.beginAt" type="datetime"></DatePicker>~
                <DatePicker v-model="roleSearchItem.endAt" type="datetime"></DatePicker>
            </FormItem>
            <FormItem>
                <Button type="info" @click="search">查 询</Button>
            </FormItem>
            <FormItem>
                <Button class="add-btn" type="primary" @click="roleAdd">新 增</Button>
            </FormItem>
            <FormItem>
                <Button type="ghost" @click="resultClear">清 空</Button>
            </FormItem>
        </Form>
        <Table class="table-css" highlight-row ref="selection" :columns="roleCol" :data="roleData"></Table>
        <div class="roldPageStyle">
            <Page :total="searchParam.pageParms.totalElem" show-total show-sizer
                  :current="searchParam.pageParms.pageIndex" @on-change="pageChange" @on-page-size-change="pageSizeChange"></Page>
        </div>
    </div>
</template>
<script type="text/ecmascript-6">
    export default {
        data(){
            return {
                //定义input
                roleSearchItem:{
                    roleName:'',
                    beginAt: '',
                    endAt: ''
                },
                //
                stats: {
                    rolemodal:false,
                    isRoleAdding: false,
                    roleFormInit: {
                        delFlag: '0',
                        description: '',
                        id: '',
                        roleName: ''
                    }
                },
                roleModalForm:{},
                rolerules: {
                    roleName:[
                        {required: true,message: '角色名不能为空!'},
                        {pattern:/^[^\s]+$/,message: '不能输入空格', trigger: 'blur'}]
                },
                //角色表格
                roleCol: [
                    {
                        title: '角色名',
                        key: 'roleName'
                    },
                    {
                        title: '描述',
                        key: 'description'
                    },
                    {
                        title:'创建时间',
                        key:'createdAt',
                        sortable: true
                    },
                    {
                        title:'创建人',
                        key:'createdBy'
                    },
                    {
                        title: '操作',
                        key: 'id',
                        render: (h, params) => {
                            return h('div',[
                                h('Button',{
                                    props:{
                                        type: 'primary',
                                        size: 'small'
                                    },
                                    style:{
                                        marginRight: '5px',
                                    },
                                    on:{
                                        click:()=>{
                                            this.roleModify(params.row);
                                        }
                                    }

                                },'修改'),
                                h('Button', {
                                    props: {
                                        type: 'error',
                                        size: 'small'
                                    },
                                    style:{
                                        marginRight: '5px',
                                    },
                                    on: {
                                        click: () => {
                                            this.rolename = params.row.roleName;
                                            this.deleteCfm(params.row.id);
                                        }
                                    }
                                }, '删除'),
                                h('Button', {
                                    props: {
                                        type: 'info',
                                        size: 'small'
                                    },
                                    on: {
                                        click: () => {
                                            this.roleManage(params.row.id);
                                        }
                                    }
                                }, '管理')
                            ]);
                        }
                    },
                ],
                searchParam: {
                    collection: {
                        filters: []
                    },
                    orders: [
                        {
                            fieldName: 'createdAt',
                            orderType: 'DESC'
                        }
                    ],
                    pageParms: {
                        pageIndex: 1,
                        pageSize: 10,
                        totalElem: 0
                    }
                },
                roleData: [] //表数据
            };
        },
        created(){
            //获取所有角色
            this.getRoleData();
        },
        methods: {
            getRoleData() {
                this.searchParam.collection.filters = [];
                this.searchParam.collection.filters.push({
                    field: 'roleName',
                    operator: 'LIKE',
                    value: this.roleSearchItem.roleName
                });
                if (this.roleSearchItem.beginAt){
                    this.searchParam.collection.filters.push({
                        field: 'createdAt',
                        operator: 'GTE',
                        value: this.roleSearchItem.beginAt.dateFormat('yyyy-MM-dd hh:mm:ss')
                    });
                }
                if (this.roleSearchItem.endAt){
                    this.searchParam.collection.filters.push({
                        field: 'createdAt',
                        operator: 'LTE',
                        value: this.roleSearchItem.endAt.dateFormat('yyyy-MM-dd hh:mm:ss')
                    });
                }
                this.$http.post('/roleMag/roles',this.searchParam).then((response) => {
                    this.roleData = response.data.data;
                    this.searchParam.pageParms.totalElem = response.data.totalElements;
                });
            },
            //清空
            search () {
                this.searchParam.pageParms.pageIndex = 1;
                this.searchParam.pageParms.pageSize = 10;
                this.getRoleData();
            },
            resultClear(){
                this.roleSearchItem.roleName = '';
                this.roleSearchItem.beginAt = '';
                this.roleSearchItem.endAt = '';
                this.search();
            },
            roleAdd () {
                this.stats.rolemodal = true;
                this.stats.isRoleAdding = true;
                this.roleModalForm = Object.assign({},this.stats.roleFormInit);
                this.$refs.roleModalValid.resetFields();
            },
            //新增及修改角色信息
            roleModify(row){
                this.stats.rolemodal = true;
                this.stats.isRoleAdding = false;
                this.roleModalForm = Object.assign({}, row);
            },
            roleModalOK(){
                this.$refs.roleModalValid.validate((valid) => {
                    if (valid) {
                        let req = Object.assign({}, this.roleModalForm);
                        if (this.stats.isRoleAdding){
                            this.$http.post('/roleMag/role', req).then(()=> {
                                this.stats.rolemodal = false;
                                this.search();
                                this.$Message.info('添加成功');
                            });
                        } else {
                            this.$http.put('/roleMag/role/' + req.id, req).then(()=> {
                                this.stats.rolemodal = false;
                                this.search();
                                this.$Message.info('修改成功');
                            });
                        }
                    } else {
                        this.$Message.error('请确认表单填写正确');
                    }
                });
            },
            deleteRole (id) {
                if (id) {
                    this.$http.delete('/roleMag/role/'+id).then((res) => {
                        if (res.status == 200) {
                            this.$Message.info('删除成功');
                            this.search();
                        }
                    });
                } else {
                    this.$Message.warning('删除失败');
                }
            },
            deleteCfm(id) {
                if (id) {
                    this.$Modal.confirm({
                        title: '角色名:' + this.rolename,
                        content: '<p>确认删除该角色？</p>',
                        onOk: () => {
                            this.deleteRole(id);
                        },
                        onCancel: () => {
                            this.$Message.info('删除已取消');
                        }
                    });
                } else {
                    this.$Message.warning('请选择角色');
                }
            },
            roleManage(id){
                this.$router.push({path:'/main/roleConfig/editRole', query: {roleId: id}});
            },
            pageChange (index) {
                this.searchParam.pageParms.pageIndex = index;
                this.getRoleData();
            },
            pageSizeChange (size) {
                this.searchParam.pageParms.pageSize = size;
                this.getRoleData();
            }
        }
    };
</script>
<style lang="scss">
    div.role-config{
        .ivu-form.ivu-form-inline{
            .ivu-form-item{
                margin-right: 16px;
                margin-bottom: 16px;
                .ivu-form-item-content{
                    display: inline-block;
                }
            }
        }
    }
    .roldPageStyle {
        margin: 16px 0;
        text-align: right;
    }
</style>
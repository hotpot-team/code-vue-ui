<template>
    <div style="padding: 16px" class="person-mag">
        <Form ref="searchValidate" :model="formParam" inline>
            <FormItem label="昵称" prop="name">
                <Input type="text" v-model="formParam.name" style="min-width: 187px"/>
            </FormItem>
            <FormItem label="创建时间" prop="minDate">
                <DatePicker type="datetime" v-model="formParam.minDate"></DatePicker>~
                <DatePicker type="datetime" v-model="formParam.maxDate"></DatePicker>
            </FormItem>
            <FormItem prop="maxDate"></FormItem>
            <FormItem>
                <Button type="info" @click="search">查 询</Button>
            </FormItem>
            <FormItem>
                <Button class="add-btn" type="primary" @click="addPerson">新 增</Button>
            </FormItem>
            <FormItem>
                <Button type="ghost" @click="clearSearchForm">清 空</Button>
            </FormItem>
        </Form>
        <Table :data="personData" :columns="columns"></Table>
        <div class="pageStyle">
            <Page :total="searchParam.pageParms.totalElem" show-total show-sizer
                  :current="searchParam.pageParms.pageIndex" @on-change="pageChange" @on-page-size-change="pageSizeChange"></Page>
        </div>

        <Modal :title="modalStats.isAdding?'新增人员':'信息修改'" v-model="modalStats.isShowModal" :transfer="false">
            <Form ref="formValid" :model="modalStats.formData" :rules="modalFormRule">
                <FormItem label="登录名" :label-width="100" prop="userName">
                    <Input style="width: 85%" v-model="modalStats.formData.userName"></Input>
                </FormItem>
                <FormItem label="昵称" :label-width="100" prop="name">
                    <Input style="width: 85%" v-model="modalStats.formData.name"></Input>
                </FormItem>
                <FormItem label="所属组织" :label-width="100" prop="orgName">
                    <person-input :person="false" :single="true" style="width: 85%; display: inline-block" v-model="modalStats.formData.orgName" @on-selection-data="parentOrgSel"></person-input>
                </FormItem>
                <FormItem label="密码" :label-width="100" prop="password">
                    <Input style="width: 85%" type="password" v-model="modalStats.formData.password"></Input>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="error" @click="modalStats.isShowModal = false">取消</Button>
                <Button type="primary" @click="addPersonOk">确定</Button>
            </div>
        </Modal>
    </div>
</template>
<script>
    export default {
        data() {
            return {
                personData:[],
                formParam: {
                    name: '',
                    dateMax: '',
                    dateMin: ''
                },
                modalStats: {
                    isAdding: false,
                    isShowModal: false,
                    formDataOri: {
                        delFlag: '0',
                        id: '',
                        name: '',
                        orgId: '',
                        orgName: '',
                        password: '',
                        userName: ''
                    },
                    formData: {}
                },
                columns:[
                    {
                        title: '昵称',
                        render:(h, params)=>{
                            return h('span',{}, params.row.hotpotUser.name);
                        }
                    },
                    {
                        title: '登录名',
                        render:(h, params)=>{
                            return h('span',{}, params.row.hotpotUser.userName);
                        }
                    },
                    {
                        title: '组织',
                        render:(h, params)=>{
                            return h('span',{}, params.row.hotpotOrganization.orgFullName);
                        }
                    },
                    {
                        title: '创建时间',
                        render:(h, params)=>{
                            return h('span',{}, params.row.hotpotUser.createdAt);
                        }
                    },
                    {
                        title: '操作',
                        align: 'center',
                        render: (h, params)=> {
                            return h('span',[
                                h('Button',{
                                    props: {
                                        type: 'primary',
                                        size: 'small'
                                    },
                                    style: {
                                        margin: '0 3px'
                                    },
                                    on: {
                                        click: () => {
                                            this.modifyPerson(params.row);
                                        }
                                    }
                                },'修改'),
                                h('Button',{
                                    props: {
                                        type: 'error',
                                        size: 'small'
                                    },
                                    style: {
                                        margin: '0 3px'
                                    },
                                    on: {
                                        click: () => {
                                            this.deletePerson(params.row);
                                        }
                                    }
                                },'删除'),
//                                h('Button',{
//                                    props: {
//                                        type: 'info',
//                                        size: 'small'
//                                    },
//                                    style: {
//                                        margin: '0 3px'
//                                    },
//                                    on: {
//                                        click: () => {
//                                            this.resetPasswd(params.row);
//                                        }
//                                    }
//                                },'密码重置')
                            ]);
                        }
                    }
                ],
                searchParam: {
                    collection: {
                        filters: []
                    },
                    orders: [
                        {
                            fieldName: 'hotpotUser.createdAt',
                            orderType: 'DESC'
                        }
                    ],
                    pageParms: {
                        pageIndex: 1,
                        pageSize: 10,
                        totalElem: 0
                    }
                },
                modalFormRule: {
                    userName: {required: true, message: '用户名不能为空', trigger: 'blur'},
                    name: {required: true, message: '昵称不能为空', trigger: 'blur'},
                    orgName: {required: true, message: '所属组织不能为空', trigger: 'change'},
                    password: [
                        { required: true, message: '密码不能为空', trigger: 'blur' },
                        { type: 'string', min: 8, message: '密码至少8位', trigger: 'blur' }
                    ]
                },
            };
        },
        methods:{
            searchPerson() {
                this.searchParam.collection.filters = [];
                this.searchParam.collection.filters.push({
                    field: 'hotpotUser.name',
                    operator: 'LIKE',
                    value: this.formParam.name
                });
                if (this.formParam.minDate && this.formParam.minDate !== ''){
                    this.searchParam.collection.filters.push({
                        field: 'hotpotUser.createdAt',
                        operator: 'GTE',
                        value: this.formParam.minDate.dateFormat('yyyy-MM-dd hh:mm:ss')
                    });
                }
                if (this.formParam.maxDate && this.formParam.maxDate !== ''){
                    this.searchParam.collection.filters.push({
                        field: 'hotpotUser.createdAt',
                        operator: 'LTE',
                        value: this.formParam.maxDate.dateFormat('yyyy-MM-dd hh:mm:ss')
                    });
                }
                this.$http.post('/security/users', this.searchParam).then((response) => {
                    this.personData = response.data.data;
                    this.searchParam.pageParms.totalElem = response.data.totalElements;
                });
            },
            search(){
                this.searchParam.pageParms.pageIndex = 1;
                this.searchParam.pageParms.pageSize = 10;
                this.searchPerson();
            },
            clearSearchForm() {
                this.$refs['searchValidate'].resetFields();
            },
            addPerson() {
                this.modalStats.isAdding = true;
                this.modalStats.isShowModal = true;
                this.modalStats.formData = Object.assign({}, this.modalStats.formDataOri);
                this.$refs['formValid'].resetFields();
            },
            parentOrgSel (org) {
                this.modalStats.formData.orgId = (org.orgList.length ===1)?org.orgList[0].id:'';
            },
            addPersonOk () {
                this.$refs['formValid'].validate((valid) => {
                    if (valid) {
                        if (this.modalStats.isAdding){
                            this.$http.post('/security/user', this.modalStats.formData).then(()=>{
                                this.$Message.success('创建用户成功');
                                this.search();
                                this.modalStats.isShowModal = false;
                            });
                        } else {
                            this.$http.put('/security/user/' + this.modalStats.formData.id, this.modalStats.formData).then(()=> {
                                this.$Message.success('信息修改成功');
                                this.search();
                                this.modalStats.isShowModal = false;
                            }).catch(()=>{
                                this.$Message.error('操作失败');
                            });
                        }
                    } else {
                        this.$Message.error('表单不完整');
                    }
                });
            },
            modifyPerson(row) {
                this.modalStats.isAdding = false;
                this.modalStats.isShowModal = true;
                this.modalStats.formData = Object.assign({},row.hotpotUser);
                this.modalStats.formData.orgName = row.hotpotOrganization.orgName;
                this.modalStats.formData.orgId = row.hotpotOrganization.orgId;
            },
            deletePerson (row) {
                this.$Modal.confirm({
                    title: '删除确认',
                    content: '<p>确认删除 '+ row.hotpotUser.name +' 吗？</p>',
                    onOk: () => {
                        this.$http.delete('/security/user/' + row.hotpotUser.id).then(()=> {
                            this.search();
                            this.$Message.info('删除成功');
                        });
                    },
                    onCancel: () => {
                        this.$Message.info('已取消');
                    }
                });
            },
            resetPasswd(row) {
                this.$Modal.confirm({
                    title: '密码重置',
                    content: '<p>确认重置 '+ row.hotpotUser.name +' 密码吗？</p>',
                    onOk: () => {
                        this.$http.delete('/security/user/' + row.hotpotUser.id).then(()=> {
                            this.search();
                            this.$Message.info('密码重置成功');
                        });
                    },
                    onCancel: () => {
                        this.$Message.info('已取消');
                    }
                });
            },
            pageChange (index) {
                this.searchParam.pageParms.pageIndex = index;
                this.searchPerson();
            },
            pageSizeChange (size) {
                this.searchParam.pageParms.pageSize = size;
                this.searchPerson();
            }
        },
        created() {
            this.search();
        }
    };
</script>
<style lang="scss">
    div.person-mag{
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
    .pageStyle {
        margin: 16px 0;
        text-align: right;
    }
</style>
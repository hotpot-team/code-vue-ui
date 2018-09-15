<template>
    <div style="margin: 0 16px;">
        <div class="dicTitlebox">
            <div class="dicTitleitem">
                <span>code</span>
                <Input v-model="searchItem.code" style="width: 200px"></Input>
            </div>
            <div class="dicTitleitem">
                <span>描述</span>
                <Input v-model="searchItem.name" style="width: 200px"></Input>
            </div>
            <Button class="dicTitleitem" type="info" @click="search">查询</Button>
            <Button class="dicTitleitem" type="primary" @click="typeAdd">新增</Button>
            <Button class="dicTitleitem" type="ghost" @click="clearTable">清空</Button>
        </div>
        <Table style="margin-top: 16px" stripe :columns="dictCol" :data="dictdata"></Table>
        <Modal v-model="typeModal" :title="(modify===1?'新增':'编辑') + 'type模型'" >
            <div>
                <Form ref="typeFormVal" :model="typeForm" :rules="typeRules" :label-width="80">
                    <FormItem label="code:" prop="code"><Input v-model="typeForm.code" style="width: 300px;"></Input></FormItem>
                    <FormItem label="描述:" prop="name"><Input v-model="typeForm.name" style="width: 300px;"></Input></FormItem>
                </Form>
            </div>
            <div slot="footer">
                <Button type="error" @click="typeModal = false">取消</Button>
                <Button type="primary" @click="typeCommit">确定</Button>
            </div>
        </Modal>
        <Modal v-model="valueModal" :title="(modify===1?'新增':'编辑') + 'value模型'">
            <Form ref="valueFormVal" :model="valueForm" :rules="valueRules" :label-width="80">
                <FormItem label="value:" prop="value"><Input v-model="valueForm.value" style="width: 300px;"></Input></FormItem>
                <FormItem label="name:" prop="name"><Input v-model="valueForm.name" style="width: 300px;"></Input></FormItem>
                <FormItem label="sort:" prop="sort"><Input v-model="valueForm.sort" style="width: 300px;" type="text" number></Input></FormItem>
            </Form>
            <div slot="footer">
                <Button type="error" @click="valueModal = false">取消</Button>
                <Button type="primary" @click="valueCommit">确定</Button>
            </div>
        </Modal>
    </div>
</template>
<script>
    export default {
        created: function() {
            this.getDictList();
        },
        data () {
            const validatePort = (rule, value, callback) => {
                if (!value && value!== 0) {
                    return callback(new Error('sort不能为空！'));
                }
                // 模拟异步验证效果
                setTimeout(() => {
                    if (!Number.isInteger(value)) {
                        callback(new Error('请输入自然数！'));
                    } else {
                        if (value < 0) {
                            callback(new Error('sort大于等于0！'));
                        } else {
                            callback();
                        }
                    }
                });
            };
            return {
                searchItem: {
                    code: '',
                    name: '',
                },
                modify: 1,//1-新增，2-编辑
                typeModal: false,
                valueModal: false,
                versionNum: 1111111111,
                dictCol: [
                    {
                        type: 'expand',
                        width: 50,
                        render: (h, params) => {
                            return h('Table', { //行展开时表格
                                props: {
                                    columns: [
                                        {
                                            title: 'value',
                                            key: 'value'
                                        },
                                        {
                                            title: 'name',
                                            key: 'name'
                                        },
                                        {
                                            title: 'sort',
                                            key: 'sort',
                                            sortable: true
                                        },
                                        {
                                            title: '操作',
                                            key: 'action',
                                            width: 250,
                                            align: 'center',
                                            render: (h, variable) => {
                                                return h('div', [
                                                    h('Button', {
                                                        props: {
                                                            type: 'primary',
                                                            size: 'small'
                                                        },
                                                        style: {
                                                            marginRight: '5px'
                                                        },
                                                        on: {
                                                            click: () => {
                                                                this.valueEdit(variable.row);
                                                            }
                                                        }
                                                    }, '修改'),
                                                    h('Button', {
                                                        props: {
                                                            type: 'error',
                                                            size: 'small'
                                                        },
                                                        on: {
                                                            click: () => {
                                                                this.valueDel(variable.row);
                                                            }
                                                        }
                                                    }, '删除')
                                                ]);
                                            }
                                        },
                                    ],
                                    data: params.row.value || this.expandTables[params.row.code] // 初始时的接口返回了展开内容，即value；查询时不会返回展开内容，需要调用接口获取展开内容
                                }
                            });
                        }
                    },
                    {
                        title: 'code',
                        key: 'code'
                    },
                    {
                        title: '描述',
                        key: 'name'
                    },
                    {
                        title: '创建时间',
                        key: 'createdAt',
                        sortable: true
                    },
                    {
                        title: '操作',
                        key: 'action',
                        width: 250,
                        align: 'center',
                        render: (h, params) => {
                            return h('div', [
                                h('Button', {
                                    props: {
                                        size: 'small'
                                    },
                                    style: {
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.valueAdd(params.row);
                                        }
                                    }
                                }, '新增'),
                                h('Button', {
                                    props: {
                                        type: 'primary',
                                        size: 'small'
                                    },
                                    style: {
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.typeEdit(params.row);
                                        }
                                    }
                                }, '修改'),
                                h('Button', {
                                    props: {
                                        type: 'error',
                                        size: 'small'
                                    },
                                    on: {
                                        click: () => {
                                            this.typeDel(params.row);
                                        }
                                    }
                                }, '删除')
                            ]);
                        }
                    }
                ],
                dictdata:[],
                expandTables:{},
                typeForm: {},
                typeRules: {
                    code: [
                        {required: true, message: 'code不能为空', trigger: 'blur',},
                        {pattern:/^[^\s]+$/,message: '不能输入空格', trigger: 'blur'}],
                    name: [
                        {required: true, message: '描述不能为空', trigger: 'blur' },
                        {pattern:/^[^\s]+$/,message: '不能输入空格', trigger: 'blur'}]
                },
                valueForm: {},
                valueRules: {
                    value: [
                        {required: true, message: 'value不能为空', trigger: 'blur' },
                        {pattern:/^[^\s]+$/,message: '不能输入空格', trigger: 'blur'}],
                    name: [
                        {required: true, message: 'name不能为空', trigger: 'blur' },
                        {pattern:/^[^\s]+$/,message: '不能输入空格', trigger: 'blur'}],
                    sort: [
                        {validator: validatePort, trigger: 'blur',required: true}]
                },
            };
        },
        methods: {
            getDictList(){
                this.$http.post('/api/dict/dict_type/dict_values/all?version='+this.versionNum).then((res)=>{
                    this.dictdata = res.data.dictTypeAndValue;
                    this.versionNum = res.data.version;
                });
            },
            expandRow (row) {
                this.$http.post('/api/dict/dict_type/'+row.code+'/dict_values/pages',{
                    'orders': [
                        {
                            'fieldName': 'createdAt',
                            'orderType': 'desc'
                        }
                    ],
                    'pageParms': {
                        'autoRecordCount': true,
                        'pageIndex': 0,
                        'pageSize': 0,
                        'recordCount': 0
                    }
                }).then((res)=>{
                    this.expandTables[row.code] = res.data.data;
                });
            },
            search () {
                //查询
                let req = {
                    'collection': {
                        'filters':[
                            {
                                'field': 'code',
                                'operator': 'LIKE',
                                'value':  this.searchItem.code
                            },
                            {
                                'field': 'name',
                                'operator': 'LIKE',
                                'value':  this.searchItem.name
                            }
                        ]
                    },
                    'orders': [
                        {
                            'fieldName': 'createdAt',
                            'orderType': 'ASC'
                        }
                    ],
                    'pageParms': {
                        'autoRecordCount': true,
                        'pageIndex': 0,
                        'pageSize': 0,
                        'recordCount': 0
                    }
                };
                this.$http.post('/api/dict/dict_type/pages',req).then((res)=> {
                    this.dictdata = res.data.data;
                    this.dictdata.map((item) => {//获取每一行 的展开内容
                        this.expandRow(item);
                    });
                });
            },
            clearTable () {
                this.searchItem = {
                    code: '',
                    value: ''
                };
            },
            typeAdd () { //新增type
                let typeVoid = {
                    code : '',
                    name : ''
                };
                this.handleReset('typeFormVal');
                this.typeForm = typeVoid;
                this.modify = 1;
                this.typeModal = true;
            },
            typeEdit (row) {
                this.typeForm = Object.assign({},row);
                this.modify = 2;
                this.typeModal = true;
                this.handleReset('typeFormVal');
            },
            typeCommit(){
                this.$refs['typeFormVal'].validate((valid) => {
                    if(valid){
                        if (this.modify === 1){
                            this.$http.post('/api/dict/dict_type',{
                                'code':this.typeForm.code,
                                'name':this.typeForm.name
                            }).then((res)=>{
                                if(res.data.message !='操作成功'){
                                    this.$Message.error('模型'+ res.data.message);
                                }else {
                                    this.$Message.success('成功新建type模型');
                                }
                                this.typeModal = false;
                                this.search();
                            });
                        } else {
                            this.$http.put('/api/dict/dict_type/'+this.typeForm.id,{
                                'code': this.typeForm.code,
                                'id': this.typeForm.id,
                                'name': this.typeForm.name
                            }).then((res)=>{
                                if(res.data.message !='操作成功'){
                                    this.$Message.error(res.data.message);
                                }else {
                                    this.$Message.success('成功修改type模型');
                                }
                                this.typeModal = false;
                                this.search();
                            });
                        }
                    }
                });
            },
            typeDel (row) {
                this.$http.delete('/api/dict/dict_type/'+row.id).then(()=>{
                    this.search();
                    this.$Message.success('成功删除该type');
                });
            },
            valueAdd (row) {
                let valueVoid = {
                    dictCode: row.code,
                    value : '',
                    name : '',
                    sort : null,
                };
                this.handleReset('valueFormVal');
                this.valueForm = valueVoid;
                this.modify = 1;
                this.valueModal = true;
            },
            valueEdit (row) {
                this.valueForm = Object.assign({},row);
                this.modify = 2;
                this.valueModal = true;
                this.handleReset('valueFormVal');
            },
            valueCommit() {
                this.$refs['valueFormVal'].validate((valid) => {
                    if (valid) {
                        if (this.modify === 1){
                            this.$http.post('/api/dict/dict_type/' + this.valueForm.dictCode + '/dict_values', {
                                'value': this.valueForm.value,
                                'name': this.valueForm.name,
                                'sort': this.valueForm.sort
                            }).then(()=> {
                                this.valueModal = false;
                                this.$Message.success('成功新建value模型');
                                this.search();
                            });
                        } else {
                            this.$http.put('/api/dict/dict_type/' + this.valueForm.dictCode + '/dict_values/' + this.valueForm.id, {
                                'value': this.valueForm.value,
                                'name': this.valueForm.name,
                                'sort': this.valueForm.sort
                            }).then(()=> {
                                this.valueModal = false;
                                this.$Message.success('成功修改value模型');
                                this.search();
                            });
                        }
                    }
                });
            },
            valueDel (row) {
                this.$http.delete('/api/dict/dict_type/'+row.dictCode+'/dict_values/'+row.id).then(()=>{
                    this.search();
                    this.$Message.success('成功删除该value');
                });
            },
            handleReset (name) {
                this.$refs[name].resetFields();
            }
        },
    };
</script>
<style lang="scss" scoped>
    .dicTitlebox {
        @include compatibleFlex;
        margin-top: 16px;
    }
    .dicTitleitem {
        margin-right: 16px;
    }
    .dicTitleitem span {
        display: inline-block;
        width: 30px;
        font-size: 13px;
    }
</style>
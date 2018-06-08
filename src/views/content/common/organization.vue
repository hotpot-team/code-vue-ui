<template>
    <div class="orgContainer">
        <div class="topline">
            <Button type="info" @click="orgAdd">新增组织</Button>
        </div>
        <Table :columns="orgColumn" :data="orgData"></Table>
        <Modal v-model="stats.isShowModal" :title="stats.isNewOrg?'新增组织':'修改信息'" @on-ok="orgModalOK">
            <Form ref="formValid" :model="modalForm" :rules="formRule">
                <FormItem label="组织名称" :label-width="100" prop="orgName">
                    <Input style="width: 85%" v-model="modalForm.orgName"></Input>
                </FormItem>
                <FormItem label="组织排序" :label-width="100" prop="sort">
                    <Input style="width: 85%" v-model="modalForm.sort" :number="true"></Input>
                </FormItem>
                <FormItem label="上级组织" :label-width="100" v-if="stats.isNewOrg">
                    <person-input :person="false" :single="true" style="width: 85%; display: inline-block" v-model="modalForm.parentName" @on-selection-data="parentOrgSel"></person-input>
                </FormItem>
                <FormItem label="组织描述" :label-width="100">
                    <Input style="width: 85%" type="textarea" v-model="modalForm.description"></Input>
                </FormItem>
            </Form>
        </Modal>
    </div>
</template>
<script>
    import treeUtil from '../../../treeUtil';
    export default {
        data () {
            return {
                stats: {
                    originData: [],
                    expandRows: new Set(), //展开的行的名称会放在这里,
                    isShowModal: false,
                    isNewOrg: false,
                    modalFormOri: {
                        delFlag: '0',
                        description: '',
                        orgFullId: '',
                        orgFullName: '',
                        orgName: '',
                        parentId: '0',
                        parentName: '',
                        sort: ''
                    }
                },
                orgData:[],
                orgColumn: [
                    {
                        title: '组织名称',
                        key: 'orgName',
                        render: (h, params) => {
                            let level = params.row.orgFullId.split('/').length - 1;
                            if (params.row.children && params.row.children.length > 0){
                                return h('span',{
                                    style: {
                                        display: 'inline-block',
                                        width: '100%',
                                        color: '#495060',
                                        fontSize: '13px',
                                        marginLeft: 24 * level + 'px'
                                    }
                                },[
                                    h('span',{
                                        class: {
                                            itemIcon: true
                                        },
                                        on: {
                                            click: ()=> {
                                                let isExpand = !params.row.isExpand;
                                                this.expandRow(isExpand, params.index);
                                            }
                                        }
                                    },[
                                        h('Icon',{
                                            style: {
                                                marginRight: '6px',
                                            },
                                            props:{
                                                type:params.row.isExpand? 'ios-minus-outline' :'ios-plus-outline'
                                            }
                                        })
                                    ]),
                                    h('span', params.row.orgName)
                                ]);
                            } else {
                                return h('span',{
                                    style: {
                                        display: 'inline-block',
                                        width: '100%',
                                        color: '#495060',
                                        fontSize: '13px',
                                        marginLeft: 24 * level + 'px'
                                    }
                                },[
                                    h('span',{
                                        style:{
                                            display: 'inline-block',
                                            width: '18px',
                                            color: '#495060'
                                        }
                                    }),
                                    h('span', params.row.orgName)
                                ]);
                            }
                        }
                    },
                    {
                        title: '操作',
                        align: 'center',
                        render: (h, params) => {
                            return h('div',{
                                style: {
                                    width: '100%'
                                }
                            },[
                                h('Button',{
                                    props: {
                                        type: 'info',
                                        size: 'small'
                                    },
                                    style: {
                                        margin: '0 6px'
                                    },
                                    on: {
                                        click: () => {this.orgModify(params.row);}
                                    }
                                },'修改'),
                                h('Button',{
                                    props: {
                                        type: 'error',
                                        size: 'small'
                                    },
                                    style: {
                                        margin: '0 6px'
                                    },
                                    on: {
                                        click: () => {this.orgDelete(params.row);}
                                    }
                                },'删除'),
                            ]);
                        }
                    }
                ],
                modalForm: {},
                formRule: {
                    orgName: { required: true, message: '组织名称不能为空', trigger: 'blur' },
                    sort: [
                        {type: 'number', required: true, message: '排序不能为空', trigger: 'blur' },
                        { type: 'number', message: '必须为数字', trigger: 'change' }
                    ]
                },
            };
        },
        methods: {
            getOrgData () {
                this.$http.post('/orgMag/list', {}).then((res)=>{
                    for (let i=0; i<res.data.data.length; i++){
                        res.data.data[i].isExpand = false;
                    }
                    this.stats.originData = JSON.parse(JSON.stringify(res.data.data));
                    let displayData = JSON.parse(JSON.stringify(this.stats.originData));
                    for (let i=0; i<displayData.length; i++){
                        if (this.stats.expandRows.has(displayData[i].id)){
                            displayData[i].isExpand = true;
                        } else {
                            displayData[i].isExpand = false;
                        }
                    }
                    this.orgData = this.trans2Expand(treeUtil.transformToTreeFormat(displayData));
//                    this.orgData = this.trans2Expand(treeUtil.transformToTreeFormat(JSON.parse(JSON.stringify(res.data.data))));
                });
            },
            orgAdd () {
                this.stats.isShowModal = true;
                this.stats.isNewOrg = true;
                this.modalForm = Object.assign({},this.stats.modalFormOri);
                this.$refs.formValid.resetFields();
            },
            orgModify(row) {
                this.stats.isShowModal = true;
                this.stats.isNewOrg = false;
                this.$refs.formValid.resetFields();
                this.modalForm = Object.assign({},row);
            },
            parentOrgSel (parent) {
                if (parent.orgList.length) {
                    this.modalForm.orgFullId = parent.orgList[0].orgFullId;
                    this.modalForm.parentId = parent.orgList[0].id;
                    this.modalForm.orgFullName = parent.orgList[0].orgFullName + '/' + this.modalForm.orgName;
                } else {
                    this.modalForm.orgFullId = '';
                    this.modalForm.parentId = '0';
                    this.modalForm.orgFullName = this.modalForm.orgName;
                }
            },
            orgModalOK () {
                this.$refs.formValid.validate((valid) => {
                    if (valid) {
                        if (this.stats.isNewOrg) {
                            let req = Object.assign({},this.modalForm);
                            req.orgFullName = this.modalForm.orgFullName || this.modalForm.orgName;
                            this.$http.post('/orgMag/org', req).then(()=> {
                                this.getOrgData();
                                this.$Message.success('新增成功');
                            });
                        } else {
                            let req = {
                                id: this.modalForm.id,
                                orgName: this.modalForm.orgName,
                                sort: this.modalForm.sort,
                                description: this.modalForm.description
                            };
                            this.$http.put('/orgMag/org/' + this.modalForm.id, req).then(()=> {
                                this.getOrgData();
                                this.$Message.success('修改成功');
                            });
                        }
                    } else {
                        this.$Message.error('表单不完整');
                    }
                });
            },

            orgDelete(row) {
                if (row.children && row.children.length){
                    this.$Message.error('未删除子组织');
                } else {
                    this.$Modal.confirm({
                        title: '删除确认',
                        content: '<p>确认删除 '+ row.orgName +' 吗？</p>',
                        onOk: () => {
                            this.$http.delete('/orgMag/org/' + row.id).then(()=> {
                                this.getOrgData();
                                this.$Message.info('删除成功');
                            }).catch((err)=> {
                                if(err.response) this.$Message.error(err.response.data.message);
                            });
                        },
                        onCancel: () => {
                            this.$Message.info('已取消');
                        }
                    });

                }
            },
            expandRow (isExpand, index) {
                if (isExpand) {
                    this.stats.expandRows.add(this.orgData[index].id);
                } else {
                    this.stats.expandRows.delete(this.orgData[index].id);
                }
                let displayData = JSON.parse(JSON.stringify(this.stats.originData));
                for (let i=0; i<displayData.length; i++){
                    if (this.stats.expandRows.has(displayData[i].id)){
                        displayData[i].isExpand = true;
                    } else {
                        displayData[i].isExpand = false;
                    }
                }
                this.orgData = this.trans2Expand(treeUtil.transformToTreeFormat(displayData));
            },
            trans2Expand(arr){
                if (!arr) return [];
                let  r = [];
                if (Object.prototype.toString.apply(arr) === '[object Array]') {
                    for (let i=0, l=arr.length; i<l; i++) {
                        r.push(arr[i]);
                        if (arr[i].children && arr[i].isExpand)
                            r = r.concat(this.trans2Expand(arr[i].children));
                    }
                } else {
                    r.push(arr);
                    if (arr.children && arr.isExpand)
                        r = r.concat(this.trans2Expand(arr.children));
                }
                return r;
            }
        },
        components: {},
        created () {
            this.getOrgData();
        }
    };
</script>
<style lang="scss" scoped>
    .orgContainer {
        padding: 16px;
    }
    .topline {
        margin: 0 0 16px;
    }
</style>
<style lang="scss">
    .itemIcon {
        display: inline-block;
        width: 18px;
        color: #495060;
        &:hover{
            cursor: pointer;
        }
    }
</style>
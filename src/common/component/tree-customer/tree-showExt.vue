<template>
    <div class="tree-ext-show">
        <Card dis-hover class="cardItem">
            <h3 slot="title">目标列表</h3>
            <div slot="extra" class="ext-btn-style">
                <Button v-if="config.tabConfigData.isAdd" type="info" @click="addForm">新 增</Button>
                <Button v-if="config.tabConfigData.isModify" type="primary" @click="modifyForm">修 改</Button>
                <Button v-if="config.tabConfigData.isDelete" type="error" @click="deleteForm">删 除</Button>
            </div>

            <el-tree :data="treeData" :highlight-current="true" default-expand-all node-key="id" ref="elTree" :expand-on-click-node="false" @current-change="currentChange">
                <div slot-scope="{node, data}">
                    <span>{{data[showName]}}</span>
                </div>
            </el-tree>
        </Card>

        <Modal v-model="modelShow" :title="modelTitle" @on-ok="" width="600" ok-text="" @on-cancel="" :transfer="true">
            <form-show :config="config" ref="childForm" v-if="modelShow" :treeData="arrayData" :treeConfig="treeConfig"></form-show>
            <div slot="footer">
                <Button type="ghost" @click="cancelModel">取消</Button>
                <Button type="primary" @click="handleSubmit()">提交</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import treeUtil from '../../../treeUtil';
    import FormShow from '../form-customer/form-showExt.vue';
    export default {
        data(){
            return {
                searchParams: {
                    collection: {
                        filters: []
                    },
                    orders:[],
                    pageParms: {
                        pageIndex: 0,
                        pageSize: 0,
                        recordCount: 0
                    }
                },
                treeData: [],
                arrayData: [],
                showName: '',
                modelShow: false, //表单弹窗
                modelTitle: '', //表单弹窗名称
                requestFlag: '', //add 新增, update 更新
                tableName: '',
                treeConfig: {
                    parentId: '',
                    label: '',
                    value: '',
                    defaultValue: '0'
                }
            };
        },
        components:{
            FormShow
        },
        props:{
            config:{
                type:Object
            }
        },
        created(){
            //表名
            this.tableName = this.config.tableMappingName.toLowerCase().replace(/_(\w)/g, ($0,$1) => $1.toUpperCase());
            this.initData(this.searchParams);
            if (this.config.tabConfigData.tableColumns) {
                let col = this.config.tabConfigData.tableColumns;
                let keys = Object.keys(col);
                for (let i in keys) {
                    if (!col[keys[i]].jsonSchemaLink) {
                        this.showName = col[keys[i]].name;
                        break;
                    }
                }
            }
            this.treeConfig.parentId = this.config.tabConfigData.treeParent.name || 'parentId';
            this.treeConfig.label = this.showName;
            this.treeConfig.value = 'id';
        },
        methods:{
            initData(params){
                this.$http.post(this.config.pathmag.page.uri, params).then((response) => {
                    if (response.status === 200) {
                        this.treeData = [];
                        this.arrayData = response.data.data;
                        let list = treeUtil.transformToTreeFormat(response.data.data, {
                            key: 'id',
                            parentId: this.config.tabConfigData.treeParent.name || 'parentId'
                        });
                        list.forEach((item)=>{
                            this.treeData.push(item);
                        });
                    }
                    this.$nextTick(()=>{
                        this.$refs['elTree'].setCurrentKey(this.treeData[0].id);
                        this.currentChange(this.treeData[0]);
                    })
                });
            },
            // 关闭表单弹窗
            cancelModel() {
                this.modelShow = false;
                this.$refs['childForm'].clearData();
            },
            // 打开弹窗
            addForm(){
                this.modelShow = true;
                this.modelTitle = '新增详情';
                this.requestFlag = 'add';
                this.$nextTick(()=>{
                    this.$refs['childForm'].clearData();
                });
            },
            handleSubmit() {
                if (this.requestFlag === 'update') {
                    this.$refs['childForm'].updateData().then((data)=> {
                        if (data === 200) {
                            this.initData(this.searchParams);
                            this.modelShow = false;
                        }
                    });
                } else if (this.requestFlag === 'add') {
                    this.$refs['childForm'].insertData().then((data)=> {
                        if (data === 200) {
                            this.initData(this.searchParams);
                            this.modelShow = false;
                        }
                    });
                }
            },
            modifyForm(){
                let data = this.$refs['elTree'].getCurrentNode();
                if (!data) {
                    this.$Message.warning('请选中节点！');
                    return false;
                }
                this.modelShow = true;
                this.modelTitle = '数据详情';
                this.requestFlag = 'update';
                this.$nextTick(()=>{
                    this.$refs['childForm'].clearData();
                    this.$refs['childForm'].getData(data);
                });
            },
            deleteForm() {
                let data = this.$refs['elTree'].getCurrentNode();
                if (!data) {
                    this.$Message.warning('请选中节点！');
                    return false;
                }
                this.$Modal.confirm({
                    title: '删除确认',
                    content: '<p>确认要执行删除操作吗？</p>',
                    onOk: () => {
                        let deleteUrl = this.editUrl(data, this.config.pathmag.delete.uri);
                        this.$http[this.config.pathmag.delete.method.toLowerCase()](deleteUrl).then((response) => {
                            if (response.status === 200) {
                                this.initData(this.searchParams);
                                this.$Message.info('删除成功');
                            }
                        }).catch(() => {
                            this.$Message.error('删除失败');
                        });
                    },
                    onCancel: () => {
                        this.$Message.info('已取消');
                    }
                });
            },
            editUrl(data, url, ignore) {
                //正则匹配出所有{}
                let arrayParam = url.match(new RegExp('(\\w+?)(?=})', 'g'));
                if (arrayParam && arrayParam.length > 0) {
                    for (let i=0; i < arrayParam.length; i++) {
                        let param = arrayParam[i].replace(this.tableName, '').replace(/( |^)[A-Z]/g, (L) => L.toLowerCase());
                        if (data.hasOwnProperty(param)) {
                            let re = new RegExp('\{' + arrayParam[i] + '\}');
                            url = url.replace(re, data[param]);
                        }
                    }
                }
                let check = url.match(new RegExp('(\\w+?)(?=})', 'g'));
                if (!ignore && check && check.length > 0) {
                    this.$Message.info('请配置正确的详情参数');
                    return;
                }
                return url;
            },
            currentChange(data, node){
                Object.values(this.config.tabConfigData.tableColumns).forEach((item)=>{
                   if (item.tableConfig) {
                       let tempConfig = JSON.parse(JSON.stringify(item.tableConfig));
                       for (let key in tempConfig.pathmag) {
                           tempConfig.pathmag[key].uri = this.editUrl(data, tempConfig.pathmag[key].uri, true);
                       }
                       this.$emit('oneToMany', tempConfig);
                   }
                });
            }
        }
    };
</script>

<style scoped lang="scss">
    .tree-ext-show{
        .ext-btn-style {
            /*position: absolute;
            right: 0;
            top: -8px;*/
            margin-top: -8px;
            @include compatibleFlex;
            @include flex-justify('flex-start');
            button {
                margin-right: 4px;
            }
        }
    }
</style>
<style>
    .tree-ext-show .el-tree--highlight-current .el-tree-node.is-current>.el-tree-node__content{
        background-color: transparent;
        color: #2d8cf0;
    }
</style>
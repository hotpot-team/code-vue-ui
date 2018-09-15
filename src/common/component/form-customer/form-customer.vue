<style lang="scss" scoped>
    .url-header {
        @include compatibleFlex
        @include flex-direction(row);
        margin-bottom: 16px;

        label {
            line-height: 32px;
            padding-right: 16px;
        }

        .url-input {
            width: 360px;
            margin-right: 32px;
        }
    }

    .config {
        margin-bottom: 16px;
        .config-btn{
            margin-right: 16px;
        }
        .separator{
            margin: 0 16px;
            color: #e9eaec;
        }
    }

    .click-disabled {
        pointer-events: none;
        cursor: default;
        opacity: 1;
    }

    .config-table{
        @include compatibleFlex;
        @include flex-direction(row);
        .table-style{
            margin-right: 16px;
            width: calc(100% - 380px);
            min-width: 600px;
        }
        .config-style{
            width: 380px;
            border-left: 1px solid #dddee1;
            .config-title{
                font-size: 14px;
                text-align: center;
                margin:0 0 16px;
            }
        }
    }

    .btn-config{
        @include compatibleFlex;
        @include flex-justify;
        margin-top: 16px;
        .btn-config-item{
            margin-right: 16px;
        }
    }
</style>
<template>
    <div>
        <div class="url-header">
            <label>新增数据地址:</label>
            <div class="url-input" v-if="pathmag.create">
                <Input v-model="pathmag.create.uri">
                <Select v-model="pathmag.create.method" slot="append" style="width: 90px">
                    <Option v-for="item in methods" :value="item" :key="item">{{item}}</Option>
                </Select>
                </Input>
            </div>
            <label>详情数据地址:</label>
            <div class="url-input" v-if="pathmag.detail">
                <Input v-model="pathmag.detail.uri">
                <Select v-model="pathmag.detail.method" slot="append" style="width: 90px">
                    <Option v-for="item in methods" :value="item" :key="item">{{item}}</Option>
                </Select>
                </Input>
            </div>
            <label>修改数据地址:</label>
            <div class="url-input" v-if="pathmag.update">
                <Input v-model="pathmag.update.uri">
                <Select v-model="pathmag.update.method" slot="append" style="width: 90px">
                    <Option v-for="item in methods" :value="item" :key="item">{{item}}</Option>
                </Select>
                </Input>
            </div>
        </div>
        <div class="config">
            <Button class="config-btn" type="info" @click="save">保存配置</Button>
            <Button class="config-btn" @click="preview">预览表单</Button>
            <Button v-if="!noBtn" class="config-btn" type="success" @click="buttonShow = true">自定义按钮</Button>
        </div>

        <div class="config-table">
            <div class="table-style">
                <my-table ref="configMyTable" :columns="columns" :data="formData" @reloadTable="reloadTable" :highlight-row="true" @on-row-click="rowClick"></my-table>
            </div>
            <div class="config-style">
                <div class="config-title">表单配置</div>
                <form-check ref="formColumnValidate" :column="formData[currentIndex]" :columnList="formData"></form-check>
            </div>
        </div>
        <Modal v-model="isPreModal" :title="configMenuName" @on-ok="isPreModal = false" width="600" ok-text="确认" cancel-text="" :transfer="true">
            <div v-if="isPreModal" class="click-disabled">
                <form-show :config="showConfig" ref="showForm" :show="true"></form-show>
            </div>
        </Modal>

        <Modal v-model="buttonShow" title="自定义按钮" @on-ok="saveBtnConfig()" @on-cancel="cancelBtnConfig()" ok-text="确认" cancel-text="取消" :transfer="true">
            <Button @click="addButton()">新增</Button>
            <div v-for="(btn ,index) in buttonConfigs" :key="index" class="btn-config">
                <Button :type="btn.btnType" class="btn-config-item">{{btn.btnName}}</Button>
                <Select v-model="btn.btnId" class="btn-config-item" @on-change="btnConfigChange($event, index)">
                    <Option v-for="(item, index) in buttons" :value="item.id" :label="item.functionName" :key="index"></Option>
                </Select>
                <Button class="btn-config-item" @click="buttonConfigs.splice(index, 1)">删除</Button>
            </div>
        </Modal>
    </div>
</template>
<script>
    import MyTable from '../table/table.vue';
    import FormCheck from './form-check.vue';
    import FormShow from './form-showExt.vue';
    export default {
        data() {
            return {
                methods: ['GET', 'POST', 'PUT', 'DELETE'],
                pathmag: {},
                columns: [
                    {
                        title: '显示',
                        key: 'isShow',
                        width: 100,
                        align: 'center',
                        render: (h, params) => {
                            return h('Checkbox', {
                                props: {
                                    value: params.row.isShow,
                                    disabled:params.row._disabled?true:false
                                },
                                on: {
                                    'on-change': () => {
                                        this.$set(this.formData[params.index], 'isShow', !this.formData[params.index].isShow);
                                    }
                                }
                            });
                        }
                    },{
                        title: '字段名称',
                        key: 'description'
                    },{
                        title: '字段类型',
                        key: 'type'
                    },{
                        title: '字段键值',
                        key: 'name'
                    },{
                        title: '验证',
                        key: 'isValidate',
                        render: (h, params) => {
                            return h('Checkbox', {
                                props: {
                                    value: params.row.isValidate,
                                    disabled:(params.row._disabled?true:false) || !this.formData[params.index].isShow
                                },
                                on: {
                                    'on-change': () => {
                                        this.$set(this.formData[params.index], 'isValidate', !this.formData[params.index].isValidate);
                                    }
                                }
                            });
                        }
                    }
                ], //表头
                formData: [],
                currentIndex: 0,
                isPreModal: false, //预览窗口，false-隐藏，true-显示
                buttons: [],
                buttonShow: false,
                buttonConfigs:[]
            };
        },
        created() {
            // 所有可自定义按钮
            if (this.$store.getters.getMenuById(this.menuId) && this.$store.getters.getMenuById(this.menuId).children) {
                this.buttons = this.$store.getters.getMenuById(this.menuId).children;
            }

            this.pathmag = Object.assign({}, this.pathmag, {
                create: this.schemaData.crudmappings.create || {uri: '', method: 'POST'},
                detail: this.schemaData.crudmappings.detail || {uri: '', method: 'GET'},
                update: this.schemaData.crudmappings.update || {uri: '', method: 'PUT'}
            });

            //属性初始化
            let columsData = []; //初始化用
            let sortData = []; //排序用
            columsData = Object.values(JSON.parse(JSON.stringify(this.schemaData.properties))).sort((a, b)=>{
                return a.sortNo - b.sortNo;
            });

            //如果有配置
            if (this.config && this.config.formConfigData) {
                this.pathmag = Object.assign({}, this.pathmag, this.config.pathmag);
            }

            if (this.config && this.config.formBtnConfigs) {
                this.buttonConfigs = JSON.parse(JSON.stringify(this.config.formBtnConfigs));
            }

            //载入属性配置
            for (let i=0; i < columsData.length; i++) {
                // 排除关联
                if (!columsData[i].relationType) {
                    if (!columsData[i].description || columsData[i].description === '') {
                        columsData[i].description = columsData[i].name;
                    }
                    this.$set(columsData[i], 'title', columsData[i].description);
                    this.$set(columsData[i], 'ruleValidate', {});
                    if (columsData[i].required) {
                        this.$set(columsData[i], 'isShow', true);
                        this.$set(columsData[i], 'isValidate', true);
                        this.$set(columsData[i], '_disabled', true);
                    }

                    if (this.config && this.config.formConfigData && this.config.formConfigData[columsData[i].name]) {
                        columsData[i] = Object.assign({},columsData[i], this.config.formConfigData[columsData[i].name]);
                        this.$set(columsData[i], 'isShow', true);
                        this.$set(columsData[i], '_highlight', false);
                        sortData.push(columsData[i]);
                    } else {
                        this.$set(columsData[i], '_highlight', false);
                        this.formData.push(columsData[i]);
                    }
                }
            }
            //排序之后添加
            if (sortData.length > 0) {
                sortData.sort((a, b)=> {
                    return a.sortIndex - b.sortIndex;
                });
                sortData.forEach((p)=>{
                    this.formData.splice(p.sortIndex, 0, p);
                });
            }
            // 默认选中行
            this.formData[this.currentIndex]._highlight = true;
        },
        computed: {
            showConfig: function () {
                let formConfigData = {};
                this.formData.forEach((p, index)=>{
                    if (p.isShow) {
                        p.sortIndex = index;
                        if (p.isValidate) {
                            this.$refs.formColumnValidate.saveRule(p);
                        }
                        this.$refs.formColumnValidate.isPersonInput(p);
                        formConfigData[p.name] = p;
                    }
                });
                return {'formConfigData': formConfigData, 'formBtnConfigs' : this.buttonConfigs};
            }
        },
        props: ['config', 'schemaData', 'configMenuName', 'menuId', 'noBtn'],
        components: {
            'my-table': MyTable,
            'form-check': FormCheck,
            'form-show': FormShow
        },
        methods: {
            reloadTable(oldIndex, newIndex) {
                let temp = this.formData[oldIndex];
                this.formData.splice(oldIndex, 1);
                this.formData.splice(newIndex, 0, temp);
                if (this.formData[newIndex]._highlight) {
                    this.currentIndex = newIndex;
                }
            },
            // 表格选中切换
            rowClick(row, index) {
                this.formData.forEach((p)=>{
                    p._highlight = false;
                });
                this.formData[index]._highlight = true;
                this.currentIndex = index;
            },
            save() {
                let formConfigData = {};
                this.formData.forEach((p, index)=>{
                    if (p.isShow) {
                        p.sortIndex = index;
                        this.$refs.formColumnValidate.isPersonInput(p);

                        let temp = JSON.parse(JSON.stringify(p));
                        if (temp.isValidate) {
                            this.$refs.formColumnValidate.saveRule(temp);
                        }
                        formConfigData[p.name] = p;
                    }
                });
                this.$emit('saveConfig', {
                    formConfigData : formConfigData,
                    formBtnConfigs: this.showConfig.formBtnConfigs,
                    pathmag: {
                        create: this.pathmag.create,
                        detail: this.pathmag.detail,
                        update: this.pathmag.update
                    }
                });
            },
            preview () {
                this.isPreModal = true;
            },
            addButton(){
                this.buttonConfigs.push({
                    btnName: this.buttons[0].functionName,
                    btnConfig: JSON.parse(this.buttons[0].url),
                    btnType: 'ghost',
                    btnId: this.buttons[0].id
                });
            },
            //保存自定义按钮
            saveBtnConfig(){
                this.showConfig.formBtnConfigs = JSON.parse(JSON.stringify(this.buttonConfigs));
                this.config.formBtnConfigs = JSON.parse(JSON.stringify(this.buttonConfigs));
                this.buttonShow = false;
            },
            cancelBtnConfig(){
                if (this.config && this.config.formBtnConfigs) {
                    this.buttonConfigs = JSON.parse(JSON.stringify(this.config.formBtnConfigs));
                } else {
                    this.buttonConfigs = [];
                }
                this.buttonShow = false;
            },
            btnConfigChange(id, index){
                this.buttons.forEach((b)=>{
                    if (b.id === id) {
                        this.buttonConfigs[index].btnName = b.functionName;
                        this.buttonConfigs[index].btnConfig = JSON.parse(b.url);
                    }
                });
            }
        }
    };
</script>

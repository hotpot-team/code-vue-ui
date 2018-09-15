<style lang="scss" scoped>
    .url-header {
        @include compatibleFlex;
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
            margin: 0 16px 0 0;
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
                margin:16px 0;
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
            <label>获取和查询数据地址:</label>
            <div class="url-input" v-if="pathmag.page">
                <Input v-model="pathmag.page.uri">
                <Select v-model="pathmag.page.method" slot="append" style="width: 90px">
                    <Option v-for="item in methods" :value="item" :key="item">{{item}}</Option>
                </Select>
                </Input>
            </div>
            <label>删除数据地址:</label>
            <div class="url-input" v-if="pathmag.delete">
                <Input v-model="pathmag.delete.uri">
                <Select v-model="pathmag.delete.method" slot="append" style="width: 90px">
                    <Option v-for="item in methods" :value="item" :key="item">{{item}}</Option>
                </Select>
                </Input>
            </div>
            <label v-if="pathmag.import_excel">导入数据地址:</label>
            <div class="url-input" v-if="pathmag.import_excel">
                <Input v-model="pathmag.import_excel.uri">
                <Select v-model="pathmag.import_excel.method" slot="append" style="width: 90px">
                    <Option v-for="item in methods" :value="item" :key="item">{{item}}</Option>
                </Select>
                </Input>
            </div>
        </div>

        <div class="config">
            <Button class="config-btn" type="info" @click="save(false)">保存配置</Button>
            <Button class="config-btn" @click="save(true)">预览页面</Button>
            <Checkbox v-model="checkBoxs.isAdd">可新增</Checkbox>
            <Checkbox v-model="checkBoxs.isModify">可修改</Checkbox>
            <Checkbox v-model="checkBoxs.isDelete">可删除</Checkbox>
            <Checkbox v-if="!showType || showType ==='table'" v-model="checkBoxs.isPage">分页</Checkbox>
            <Button  v-if="!noBtn" class="config-btn" type="success" style="margin-left: 16px" @click="buttonShow = true">按钮</Button>
            <Button  v-if="!noBtn" class="config-btn" type="warning" @click="buttonRowShow = true">行按钮</Button>
            <span v-if="pathmag.import_excel">
                <span class="separator">|</span>
                <Checkbox v-model="checkBoxs.isImport">导入Excel数据</Checkbox>
                <Checkbox v-model="importExcelConfig.isVersion">自动生成版本号(version)</Checkbox>
                <span style="margin-right: 8px">导出Excel名称:</span><Input style="width:200px" v-model="importExcelConfig.excelHeader" placeholder="请输入"></Input>
            </span>
        </div>

        <div class="config-table">
            <div class="table-style" :style="(showType && showType === 'tree')?'width:100%':''">
                <my-table ref="configMyTable" :columns="columns" :data="data" @reloadTable="reloadTable" :highlight-row="true" @on-row-click="rowClick"></my-table>
            </div>
            <div class="config-style" v-if="!showType || showType === 'table'">
                <div class="config-title">查询配置</div>
                <Form v-if="data.length > 0" ref="propertyExt" :label-width="80">
                    <FormItem label="展示名" prop="title">
                        <Input v-model="data[currentIndex].title" :disabled="schemaData.relations && schemaData.relations[data[currentIndex].name] && !schemaData.relations[data[currentIndex].name].master"></Input>
                    </FormItem>
                    <FormItem label="格式化" prop="title">
                        <Input v-model="data[currentIndex].renderFormat" :disabled="data[currentIndex].type==='object' || data[currentIndex].type==='array' || data[currentIndex].dictName != null"></Input>
                    </FormItem>
                    <FormItem label="查询方式">
                        <RadioGroup v-model="data[currentIndex].searchModel" on-change="radioChange">
                            <Radio label="LIKE" :disabled="data[currentIndex].type==='object' || data[currentIndex].type==='array'">
                                <span>LIKE(模糊匹配)</span>
                            </Radio>
                            <Radio label="EQ" :disabled="data[currentIndex].type==='object' || data[currentIndex].type==='array'">
                                <span>EQ(等于)</span>
                            </Radio>
                            <Radio label="GTE" :disabled="data[currentIndex].type==='object' || data[currentIndex].type==='array'">
                                <span>GTE(大于等于)</span>
                            </Radio>
                            <Radio label="LTE" :disabled="data[currentIndex].type==='object' || data[currentIndex].type==='array'">
                                <span>LTE(小于等于)</span>
                            </Radio>
                            <Radio label="RANGE" :disabled="data[currentIndex].type==='object' || data[currentIndex].type==='array'">
                                <span>RANGE(区间选择)</span>
                            </Radio>
                        </RadioGroup>
                    </FormItem>
                    <FormItem label="人员选择器">
                        <CheckboxGroup v-model="data[currentIndex].personInput">
                            <Checkbox label="single" :disabled="data[currentIndex].type==='object' || data[currentIndex].type==='array'"><span>单选</span></Checkbox>
                            <Checkbox label="person" :disabled="data[currentIndex].type==='object' || data[currentIndex].type==='array'"><span>人员</span></Checkbox>
                            <Checkbox label="org" :disabled="data[currentIndex].type==='object' || data[currentIndex].type==='array'"><span>组织</span></Checkbox>
                            <Checkbox v-if="showTeam" label="team" :disabled="data[currentIndex].type==='object' || data[currentIndex].type==='array'"><span>群组</span></Checkbox>
                        </CheckboxGroup>
                    </FormItem>
                    <FormItem>
                        <Tooltip slot="label" placement="top">
                            附件ID
                            <div slot="content">指定该字段为附件的名称，选择对应的附件id</div>
                        </Tooltip>
                        <Select v-model="data[currentIndex].fileId" :disabled="isDisabled" clearable>
                            <Option v-for="item in data" :value="item.name" :key="item.name">{{item.name}}</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="字典">
                        <Select v-model="data[currentIndex].dictName" :disabled="isDisabled" clearable>
                            <Option v-for="item in dictstroage" :value="item.code" :key="item.id">{{item.name}}</Option>
                        </Select>
                    </FormItem>
                </Form>
            </div>
        </div>

        <Modal v-model="modalShow" :title="configMenuName" @on-ok="modalShow = false" width="1000" ok-text="确认" cancel-text="" :transfer="true">
            <div v-if="modalShow" class="click-disabled">
                <table-show :config="showConfig" ref="showForm" :show="true"></table-show>
            </div>
        </Modal>

        <Modal v-model="buttonShow" title="自定义按钮" @on-ok="saveBtnConfig(false)" @on-cancel="cancelBtnConfig(false)" ok-text="确认" cancel-text="取消" :transfer="true">
            <Button @click="addButton(false)">新增</Button>
            <div v-for="(btn ,index) in buttonConfigs" :key="index" class="btn-config">
                <Button :type="btn.btnType" class="btn-config-item">{{btn.btnName}}</Button>
                <Select v-model="btn.btnId" class="btn-config-item" @on-change="btnConfigChange($event, index, false)">
                    <Option v-for="(item, index) in buttons" :value="item.id" :label="item.functionName" :key="index"></Option>
                </Select>
                <Button class="btn-config-item" @click="buttonConfigs.splice(index, 1)">删除</Button>
            </div>
        </Modal>

        <Modal v-model="buttonRowShow" title="自定义行按钮" @on-ok="saveBtnConfig(true)" @on-cancel="cancelBtnConfig(true)" ok-text="确认" cancel-text="取消" :transfer="true">
            <Button @click="addButton(true)">新增</Button>
            <div v-for="(btn ,index) in rowButtonConfigs" :key="index" class="btn-config">
                <Button :type="btn.btnType" class="btn-config-item">{{btn.btnName}}</Button>
                <Select v-model="btn.btnId" class="btn-config-item" @on-change="btnConfigChange($event, index, true)">
                    <Option v-for="(item, index) in buttons" :value="item.id" :label="item.functionName" :key="index"></Option>
                </Select>
                <Button class="btn-config-item" @click="rowButtonConfigs.splice(index, 1)">删除</Button>
            </div>
        </Modal>
    </div>
</template>
<script>
    import MyTable from '../table/table.vue';
    import Util from '../../../libs/util';
    import TableShow from './table-showExt.vue';
    import FormItem from '../form-item-ext/form-item';
    import { mapGetters } from 'vuex';
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
                                    disabled:params.row.relationType?true:false
                                },
                                on: {
                                    'on-change': () => {
                                        this.$set(this.data[params.index], 'isShow', !this.data[params.index].isShow);
                                        if (this.showType && this.showType === 'tree') {
                                            this.data.forEach((item, index) => {
                                                if (index !== params.index && item.isShow) {
                                                    delete item['isShow'];
                                                }
                                            });
                                        }
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
                        title: '表关系',
                        key: 'relationType',
                        render: (h, params) => {
                            if (params.row.relationType && this.schemaData.relations && this.schemaData.relations[params.row.name].master) {
                                return h('Button',{
                                    on:{'click':()=>{
                                        this.relationConfig(params.row);
                                    }}
                                },params.row.relationType);
                            } else {
                                return '';
                            }
                        }
                    },{
                        title: '查询',
                        key: 'isSearch',
                        render: (h, params) => {
                            return h('Checkbox', {
                                props: {
                                    value: params.row.isSearch,
                                    disabled:params.row.relationType?true:false
                                },
                                on: {
                                    'on-change': () => {
                                        this.$set(this.data[params.index], 'isSearch', !this.data[params.index].isSearch);
                                    }
                                }
                            });
                        }
                    },{
                        title: '可排序',
                        key: 'isOrder',
                        render: (h, params) => {
                            return h('Checkbox', {
                                props: {
                                    value: params.row.isOrder,
                                    disabled: !this.data[params.index].isShow
                                },
                                on: {
                                    'on-change': () => {
                                        this.$set(this.data[params.index], 'isOrder', !this.data[params.index].isOrder);
                                    }
                                }
                            });
                        }
                    }, {
                        title: '父节点',
                        key: 'isParent',
                        render: (h, params) => {
                            return h('Checkbox', {
                                props: {
                                    value: params.row.isParent
                                },
                                on: {
                                    'on-change': () => {
                                        this.$set(this.data[params.index], 'isParent', !this.data[params.index].isParent);
                                        this.data.forEach((item, index) => {
                                            if (index !== params.index && item.isParent) {
                                                delete item['isParent'];
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    }
                ], //表头
                data: [],
                checkBoxs: {isAdd: false, isModify: false, isDelete: false, isPage: false, isImport: false}, //页面配置checkbox
                importExcelConfig: {isVersion: false, excelHeader: ''}, // excel导入配置,
                currentIndex: 0,
                modalShow: false,
                buttonShow: false,
                buttonRowShow: false,
                buttons: [],
                buttonConfigs:[],
                rowButtonConfigs:[],
                showTeam: false,
            };
        },
        created() {
            if (Util.personInput.props.team) {
                this.showTeam = true;
            }

            // 控制列表与树形配置
            if (this.showType && this.showType === 'tree') {
                this.columns.splice(this.columns.length - 3, 2)
            } else {
                this.columns.splice(this.columns.length - 1, 1)
            }

            // 所有可自定义按钮
            if (this.$store.getters.getMenuById(this.menuId) && this.$store.getters.getMenuById(this.menuId).children) {
                this.buttons = this.$store.getters.getMenuById(this.menuId).children;
            }

            this.pathmag = Object.assign({}, this.pathmag, {
                page: this.schemaData.crudmappings.page || {uri: '', method: 'POST'},
                delete: this.schemaData.crudmappings.delete || {uri: '', method: 'DELETE'},
                import_excel: this.schemaData.crudmappings.import_excel
            });
            this.importExcelConfig.excelHeader = this.configMenuName;

            //属性初始化
            let columsData = []; //初始化用
            let sortData = []; //排序用
            columsData = Object.values(JSON.parse(JSON.stringify(this.schemaData.properties))).sort((a, b)=>{
                return a.sortNo - b.sortNo;
            });

            //如果有配置
            if (this.config && this.config.tabConfigData) {
                this.pathmag = Object.assign({}, this.pathmag, this.config.pathmag);
                this.importExcelConfig = Object.assign({}, this.importExcelConfig, this.config.tabConfigData.importExcelConfig);
                this.checkBoxs.isAdd = this.config.tabConfigData.isAdd;
                this.checkBoxs.isModify = this.config.tabConfigData.isModify;
                this.checkBoxs.isDelete = this.config.tabConfigData.isDelete;
                this.checkBoxs.isPage = this.config.tabConfigData.isPage;
                this.checkBoxs.isImport = this.config.tabConfigData.isImport;
                if (this.config.tableBtnConfigs) {
                    this.buttonConfigs = JSON.parse(JSON.stringify(this.config.tableBtnConfigs));
                }
                if (this.config.tableRowBtnConfigs) {
                    this.rowButtonConfigs = JSON.parse(JSON.stringify(this.config.tableRowBtnConfigs));
                }
            }

            //载入属性配置
            for (let i=0; i < columsData.length; i++) {
                if (!columsData[i].description || columsData[i].description === '') {
                    columsData[i].description = columsData[i].name;
                }
                this.$set(columsData[i], 'title', columsData[i].description);
                this.$set(columsData[i], 'searchModel', 'LIKE');
                this.$set(columsData[i], 'personInput', []);

                if (!columsData[i].renderFormat) {
                    this.$set(columsData[i], 'renderFormat', '');
                    if (columsData[i].format && columsData[i].format === 'date-time') {
                        columsData[i].renderFormat = columsData[i].pattern;
                    }
                }

                //载入树形父节点配置
                if (this.showType === 'tree' &&  this.config && this.config.tabConfigData && this.config.tabConfigData.treeParent) {
                    if (columsData[i].name === this.config.tabConfigData.treeParent.name) {
                        this.$set(columsData[i], 'isParent', true);
                    }
                }

                if (this.config && this.config.tabConfigData && this.config.tabConfigData.tableColumns && this.config.tabConfigData.tableColumns[columsData[i].name]) {
                    columsData[i] = Object.assign({},columsData[i], this.config.tabConfigData.tableColumns[columsData[i].name]);
                    this.$set(columsData[i], '_highlight', false);
                    sortData.push(columsData[i]);
                } else {
                    this.$set(columsData[i], '_highlight', false);
                    this.data.push(columsData[i]);
                }
            }

            //排序之后添加
            if (sortData.length > 0) {
                sortData.sort((a, b)=> {
                    return a.sortIndex - b.sortIndex;
                });
                sortData.forEach((p)=>{
                    this.data.splice(p.sortIndex, 0, p);
                });
            }
            // 默认选中行
            this.data[this.currentIndex]._highlight = true;
        },
        props: ['menuId', 'config', 'schemaData', 'configMenuName', 'noBtn', 'showType'],
        components: {
            FormItem,
            'my-table': MyTable,
            'table-show': TableShow
        },
        computed: {
            isDisabled: function(){
              return this.data[this.currentIndex].type==='object' || this.data[this.currentIndex].type==='array';
            },
            showConfig:function () {
                let tabConfigData = Object.assign({}, this.checkBoxs);
                tabConfigData.importExcelConfig = this.importExcelConfig;
                tabConfigData.action = [];
                if (tabConfigData.isModify) {
                    tabConfigData.action.push({
                        text: '修改',
                        type:'primary'
                    });
                }
                if (tabConfigData.isDelete) {
                    tabConfigData.action.push({
                        text: '删除',
                        type:'error'
                    });
                }
                let tableBtnConfigs = JSON.parse(JSON.stringify(this.buttonConfigs));
                let tableRowBtnConfigs = JSON.parse(JSON.stringify(this.rowButtonConfigs));
                this.data.forEach((p, index) => {
                    if (p.isShow || p.tableConfig) {
                        p.sortIndex = index;
                        if (!tabConfigData.tableColumns) {
                            tabConfigData.tableColumns = {};
                        }
                        tabConfigData.tableColumns[p.name] = p;
                    }
                    if (p.isSearch) {
                        if (!tabConfigData.searchForm) {
                            tabConfigData.searchForm = {};
                        }
                        if (p.personInput && p.personInput.length === 0) {
                            delete p['personInput'];
                        }
                        tabConfigData.searchForm[p.name] = p;
                    }
                    if (p.isParent) {
                        tabConfigData.treeParent = p;
                    }
                });
                return {
                    tableMappingName: this.schemaData.tableName,
                    tabConfigData: tabConfigData,
                    tableBtnConfigs: tableBtnConfigs,
                    tableRowBtnConfigs: tableRowBtnConfigs
                };
            },
            ...mapGetters([
                'dictstroage'
            ])
        },
        methods: {
            reloadTable(oldIndex, newIndex) {
                let temp = this.data[oldIndex];
                this.data.splice(oldIndex, 1);
                this.data.splice(newIndex, 0, temp);
                if (this.data[newIndex]._highlight) {
                    this.currentIndex = newIndex;
                }
            },
            // 表格选中切换
            rowClick(row, index) {
                this.data.forEach((p)=>{
                    p._highlight = false;
                });
                this.data[index]._highlight = true;
                this.currentIndex = index;
            },
            //关联配置
            relationConfig(row){
                let schemaData = JSON.parse(JSON.stringify(row));
                schemaData.crudmappings = JSON.parse(JSON.stringify(this.schemaData.relationMappings[row.name]));
                schemaData.tableName = this.schemaData.relations[row.name].slaveTable;
                this.$emit('addRelationTab', row, schemaData);
            },
            save(show) {
                if (show) {
                    this.modalShow = true;
                } else {
                    this.$emit('saveConfig', {
                        tabConfigData : this.showConfig.tabConfigData,
                        tableBtnConfigs: this.showConfig.tableBtnConfigs,
                        tableRowBtnConfigs: this.showConfig.tableRowBtnConfigs,
                        pathmag: {
                            page: this.pathmag.page,
                            delete: this.pathmag.delete,
                            import_excel: this.pathmag.import_excel
                        }
                    });
                }
            },
            addButton(row){
                if (this.buttons.length < 1) {
                    this.$Message.warning('请先在菜单管理中添加按钮！');
                    return;
                }

                if (row) {
                    this.rowButtonConfigs.push({
                        btnName: this.buttons[0].functionName,
                        btnConfig: JSON.parse(this.buttons[0].url),
                        btnType: 'ghost',
                        btnId: this.buttons[0].id
                    });
                } else {
                    this.buttonConfigs.push({
                        btnName: this.buttons[0].functionName,
                        btnConfig: JSON.parse(this.buttons[0].url),
                        btnType: 'ghost',
                        btnId: this.buttons[0].id
                    });
                }
            },
            //保存自定义按钮
            saveBtnConfig(row){
                if (row) {
                    this.showConfig.tableRowBtnConfigs = JSON.parse(JSON.stringify(this.rowButtonConfigs));
                    this.buttonRowShow = false;
                } else {
                    this.showConfig.tableBtnConfigs = JSON.parse(JSON.stringify(this.buttonConfigs));
                    this.buttonShow = false;
                }
            },
            cancelBtnConfig(row){
                if (row) {
                    if (this.config.tableRowBtnConfigs) {
                        this.rowButtonConfigs = JSON.parse(JSON.stringify(this.config.tableRowBtnConfigs));
                    } else {
                        this.rowButtonConfigs = [];
                    }
                    this.buttonRowShow = false;
                } else {
                    if (this.config.tableBtnConfigs) {
                        this.buttonConfigs = JSON.parse(JSON.stringify(this.config.tableBtnConfigs));
                    } else {
                        this.buttonConfigs = [];
                    }
                    this.buttonShow = false;
                }
            },
            btnConfigChange(id, index, row){
                this.buttons.forEach((b)=>{
                    if (b.id === id) {
                        if (row) {
                            this.rowButtonConfigs[index].btnName = b.functionName;
                            this.rowButtonConfigs[index].btnConfig = JSON.parse(b.url);
                        } else {
                            this.buttonConfigs[index].btnName = b.functionName;
                            this.buttonConfigs[index].btnConfig = JSON.parse(b.url);
                        }
                    }
                });
            }
        }
    };
</script>

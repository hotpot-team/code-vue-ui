<style lang="scss" scoped>
    .expert-config{
        padding: 16px;

        .expert-title{
            margin-bottom: 16px;
            font-size: 14px;
            color: #464c5b;
        }

        .config{
            margin-bottom: 16px;
            .config-btn{
                margin-right: 16px;
            }
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
    }
    .click-disabled {
        pointer-events: none;
        cursor: default;
        opacity: 1;
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
    <div class="expert-config">
        <div class="expert-title">{{configMenuName}}</div>
        <Form ref="formInline" inline v-if="pathmag.page" :label-width="100" label-position="left">
            <FormItem label="选择关联关系">
                <Select v-model="currentUri" style="width: 800px" @on-change="pathChnage">
                    <Option :value="value.uri" v-for="(value, key) in jsonSchema.crudmappings" :key="key" :label="value.uri">
                        <div style="@include compatibleFlex;@include flex-justify;">
                            <span>{{value.uri}}</span>
                            <span>{{value.description}}</span>
                        </div>
                    </Option>
                </Select>
            </FormItem>
        </Form>
        <div class="config">
            <Button class="config-btn" type="info" @click="save">保存配置</Button>
            <Button class="config-btn" @click="modalShow = true">预览表格</Button>
            <Checkbox v-model="isPage">分页</Checkbox>
            <Button  class="config-btn" type="success" style="margin-left: 16px" @click="buttonShow = true">按钮</Button>
            <Button  class="config-btn" type="warning" @click="buttonRowShow = true">行按钮</Button>
        </div>
        <div class="config-table">
            <div class="table-style">
                <my-table ref="configMyTable" :columns="columns" :data="data" @reloadTable="reloadTable" :highlight-row="true" @on-row-click="rowClick"></my-table>
            </div>
            <div class="config-style">
                <div class="config-title">查询配置</div>
                <Form v-if="data.length > 0" ref="propertyExt" :label-width="80">
                    <FormItem label="展示名" prop="title">
                        <Input v-model="data[currentIndex].title" :disabled="data[currentIndex].type==='object'"></Input>
                    </FormItem>
                    <FormItem label="Radio">
                        <RadioGroup v-model="data[currentIndex].searchModel" on-change="radioChange">
                            <Radio label="LIKE" :disabled="data[currentIndex].type==='object'">
                                <span>LIKE(模糊匹配)</span>
                            </Radio>
                            <Radio label="EQ" :disabled="data[currentIndex].type==='object'">
                                <span>EQ(等于)</span>
                            </Radio>
                            <Radio label="GTE" :disabled="data[currentIndex].type==='object'">
                                <span>GTE(大于等于)</span>
                            </Radio>
                            <Radio label="LTE" :disabled="data[currentIndex].type==='object'">
                                <span>LTE(小于等于)</span>
                            </Radio>
                            <Radio label="RANGE" :disabled="data[currentIndex].type==='object'">
                                <span>RANGE(区间选择)</span>
                            </Radio>
                        </RadioGroup>
                    </FormItem>
                </Form>
            </div>
        </div>

        <Modal v-model="modalShow" :title="configMenuName" @on-ok="modalShow = false" width="1000" ok-text="确认" cancel-text="" :transfer="true">
            <div class="click-disabled" v-if="modalShow">
                <expert-table :showConfig="showConfig" ref="showForm" :show="true"></expert-table>
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
    import {mapGetters} from 'vuex';
    import MyTable from '../../../../common/component/table/table.vue';
    import ExpertTable from '../expertTable.vue';
    import Util from '../../../../libs/util';
    export default {
        data(){
            return {
                config: null, //配置
                configMenuId: this.$route.query.menuId, // 菜单Id
                configMenuName: this.$route.query.menuName, // 菜单名称
                configMenuPath: this.$route.query.menuPath, // 菜单JsonSchema url ''
                jsonSchema: null,
                modalShow: false,
                pathmag: {},
                currentUri: '',
                currentIndex: 0,
                isPage: false,
                columns:[{
                    title: '显示',
                    key: 'isShow',
                    width: 100,
                    render: (h, params) => {
                        return h('Checkbox', {
                            props: {
                                value: params.row.isShow,
                                disabled:params.row.relationMappedAttr?true:false
                            },
                            on: {
                                'on-change': () => {
                                    this.$set(this.data[params.index], 'isShow', !this.data[params.index].isShow);
                                }
                            }
                        });
                    }
                },
                    {
                        title: '表描述',
                        key: 'tableName'

                    },{
                        title: '字段键值',
                        key: 'name'
                    },
                    {
                        title: '字段名称',
                        key: 'description'
                    },
                    {
                        title: '字段类型',
                        key: 'type'
                    },
                    {
                        title: '可查询',
                        width: 100,
                        key: 'isSearch',
                        render: (h, params) => {
                            return h('Checkbox', {
                                props: {
                                    value: params.row.isSearch,
                                    disabled:params.row.relationMappedAttr?true:false
                                },
                                on: {
                                    'on-change': () => {
                                        this.$set(this.data[params.index], 'isSearch', !this.data[params.index].isSearch);
                                    }
                                }
                            });
                        }
                    },
                    {
                        title: '可排序',
                        width: 100,
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
                    }],
                data:[],
                buttonShow: false,
                buttonRowShow: false,
                buttons: [],
                buttonConfigs:[],
                rowButtonConfigs:[]
            }
        },
        computed: {
            ...mapGetters([
                'uiConfigData',
                'uiVersion'
            ]),
            showConfig:function () {
                let tabConfigData = Object.assign({}, {isPage: this.isPage});

                let tableBtnConfigs = JSON.parse(JSON.stringify(this.buttonConfigs));
                let tableRowBtnConfigs = JSON.parse(JSON.stringify(this.rowButtonConfigs));

                this.data.forEach((p, index) => {
                    if (p.isShow) {
                        p.sortIndex = index;
                        if (!tabConfigData.tableColumns) {
                            tabConfigData.tableColumns = {};
                        }
                        tabConfigData.tableColumns[p.tableName + '.' + p.name] = p;
                    }
                    if (p.isSearch) {
                        if (!tabConfigData.searchForm) {
                            tabConfigData.searchForm = {};
                        }
                        tabConfigData.searchForm[p.tableName + '.' + p.name] = p;
                    }
                });
                let config = {
                    configName: this.configMenuName,
                    id: this.configMenuId,
                    pathmag: this.pathmag,
                    tabConfigData: tabConfigData,
                    tableBtnConfigs: tableBtnConfigs,
                    tableRowBtnConfigs: tableRowBtnConfigs
                };
                return config;
            }
        },
        components: {
            MyTable,
            ExpertTable
        },
        created(){
            this.$store.dispatch('getConfig', this.uiVersion).then(() => {
                this.config = this.uiConfigData[this.configMenuId];
                this.$http.get(this.configMenuPath, {
                    headers: {Accept: 'application/schema+json'},
                }).then((res) => {
                    this.jsonSchema = res.data.jsonSchema;
                    this.initData();
                });
            });
        },
        methods:{
            initData(){
                let relations = Object.values(this.jsonSchema.crudmappings);
                this.$set(this.pathmag, 'page', JSON.parse(JSON.stringify(relations[0])));
                this.currentUri = relations[0].uri;

                // 所有可自定义按钮
                if (this.$store.getters.getMenuById(this.configMenuId) && this.$store.getters.getMenuById(this.configMenuId).children) {
                    this.buttons = this.$store.getters.getMenuById(this.configMenuId).children;
                }

                if (this.config) {
                    relations.forEach((p)=>{
                        if (this.config.pathmag.page.uri === p.uri) {
                            this.pathmag.page = p;
                            this.currentUri = p.uri;
                        }
                    });
                    this.isPage = this.config.tabConfigData.isPage;

                    if (this.config.tableBtnConfigs) {
                        this.buttonConfigs = JSON.parse(JSON.stringify(this.config.tableBtnConfigs));
                    }
                    if (this.config.tableRowBtnConfigs) {
                        this.rowButtonConfigs = JSON.parse(JSON.stringify(this.config.tableRowBtnConfigs));
                    }
                }

                //属性初始化
                let columsData = []; //初始化用
                let sortData = []; //排序用
                for (let key in this.jsonSchema.properties) {
                    if (this.jsonSchema.properties[key].properties) {
                        Object.values(this.jsonSchema.properties[key].properties).sort((a, b)=>{
                            return a.sortNo - b.sortNo;
                        }).forEach((item)=>{
                            item.tableName = key;
                            if (!item.relationType) {
                                columsData.push(item);
                            }
                        });
                    } else if (this.jsonSchema.properties[key].$ref) {
                        let _self = this;
                        let ref = '_self.' + this.jsonSchema.properties[key].$ref;
                        Object.values(eval(ref)).sort((a, b)=>{
                            return a.sortNo - b.sortNo;
                        }).forEach((item)=>{
                            item.tableName = key;
                            if (!item.relationType) {
                                columsData.push(item);
                            }
                        });
                    }
                }

                //载入属性配置
                for (let i=0; i < columsData.length; i++) {
                    if (!columsData[i].description || columsData[i].description === '') {
                        columsData[i].description = columsData[i].name;
                    }
                    this.$set(columsData[i], 'title', columsData[i].description);
                    this.$set(columsData[i], 'searchModel', 'LIKE');
                    let pro = columsData[i].tableName + '.' + columsData[i].name;
                    if (this.config && this.config.tabConfigData && this.config.tabConfigData.tableColumns[pro] && this.config.tabConfigData.tableColumns[pro].tableName === columsData[i].tableName) {
                        columsData[i] = Object.assign({},columsData[i], this.config.tabConfigData.tableColumns[pro]);
                        this.$set(columsData[i], '_highlight', false);
                        sortData.push(columsData[i]);
                    } else {
                        this.$set(columsData[i], '_highlight', false);
                        this.data.push(columsData[i])
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
            pathChnage(val){
                let relations = Object.values(this.jsonSchema.crudmappings);
                relations.forEach((p)=>{
                    if (val === p.uri) {
                        this.pathmag.page = p;
                    }
                });
            },
            save(){
                let tempData = {};
                for (let key in this.showConfig) {
                    if (Util.serializable.indexOf(key) > -1) {
                        tempData[key] = JSON.stringify(this.showConfig[key]);
                    } else {
                        tempData[key] = this.showConfig[key];
                    }
                }
                this.$store.dispatch('saveConfig',  JSON.stringify(tempData)).then(() => {
                    this.$Message.success('数据保存成功!');
                });
            },
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
    }
</script>
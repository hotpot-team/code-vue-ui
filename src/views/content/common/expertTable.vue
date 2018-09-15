<style lang="scss">
    div.expert-table{
        margin: 16px;
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
</style>
<style lang="scss" scoped>
    div.expert-table{
        padding: 16px;
        .page{
            text-align: right;
            margin-top: 16px;
        }
        .add-btn{
        }
    }
</style>
<template>
    <div class="expert-table">
        <Form ref="searchValidate" :model="formParam" inline>
            <Form-MItem v-if="searchForm.length > 0" v-for="(col, index) in searchForm" :key="index" :label="col.title || col.name" :prop="col.tableName + '.' + col.name" :labelTitle="col.tableName">
                <div v-if="col.searchModel == 'RANGE'">
                    <div v-if="col.format == 'date-time'">
                        <DatePicker type="datetime" :format="col.pattern" :ref="col.tableName + '-' + col.name + '-min'"></DatePicker>
                        <DatePicker type="datetime" :format="col.pattern" :ref="col.tableName + '-' + col.name + '-max'"></DatePicker>
                    </div>
                    <div v-else>
                        <Input type="text" :ref="col.tableName + '-' + col.name + '-min'" style="width: 45%"></Input>
                        <Input type="text" :ref="col.tableName + '-' + col.name + '-max'"  style="width: 45%"></Input>
                    </div>
                </div>
                <div v-else>
                    <Select v-if="col.dictName && dictList[col.tableName + '.' + col.name]" v-model="formParam[col.tableName][col.name]" style="min-width: 187px">
                        <Option v-for="opt in dictList[col.tableName + '.' + col.name]" :value="opt.value" :key="opt.value">{{ opt.name }}</Option>
                    </Select>
                    <DatePicker v-else-if="col.format == 'date-time'" type="datetime" :format="col.pattern" v-model="formParam[col.tableName][col.name]"></DatePicker>
                    <Input v-else type="text" v-model="formParam[col.tableName][col.name]" style="min-width: 187px"></Input>
                </div>
            </Form-MItem>
            <FormItem v-if="searchForm.length > 0">
                <Button type="info" @click="search">查 询</Button>
            </FormItem>
            <FormItem v-if="searchForm.length > 0">
                <Button type="ghost" @click="clearSearchForm">清 空</Button>
            </FormItem>
            <FormItem v-if="config.tableBtnConfigs && config.tableBtnConfigs.length>0" v-for="(btn, index) in config.tableBtnConfigs" :key="btn.btnId">
                <div :id="'btnFrom-'+btn.btnId"></div>
            </FormItem>
        </Form>
        <Table :columns="tableColumns" :data="tableData" @on-sort-change="tableSort"></Table>
        <div class="page" v-if="config && config.tabConfigData && config.tabConfigData.isPage">
            <Page :total="searchParams.pageParms.recordCount" :current="searchParams.pageParms.pageIndex" @on-change="pageChange" @on-page-size-change="pageSizeChange" show-sizer show-total placement="top" ></Page>
        </div>
    </div>
</template>
<script type="text/ecmascript-6">
    import { mapState, mapGetters } from 'vuex';
    import FormItemExt from '../../../common/component/form-item-ext/form-item.vue';
    import Vue from 'vue';
    export default {
        data() {
            return {
                configMenuId: this.$route.query.menuId, // 菜单id
                searchForm:{}, //查询表单配置,由父组件传入
                formParam:{}, //查询表单
                config:{},
                tableColumns: [], //表头
                tableData: [],
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
                }
            }
        },
        props:['menuId','showConfig', 'show' ],
        created(){
            if(this.showConfig) {
                this.config = JSON.parse(JSON.stringify(this.showConfig));
                this.initTable(this.config);
                this.$nextTick(()=>{
                    this.initTableBtn()
                });
            } else {
                this.configMenuId = this.configMenuId?this.configMenuId: this.menuId;
                this.$store.dispatch('getConfig', this.uiVersion).then(()=>{
                    this.config = this.uiConfigData[this.configMenuId];
                    if (this.config) {
                        this.initTable(this.config);
                        this.$nextTick(()=>{
                            this.initTableBtn()
                        });
                    } else {
                        this.$Message.warning('请去配置页面配置！');
                    }
                });
            }
        },
        components: {
            'Form-MItem': FormItemExt,
        },
        computed: {
            ...mapGetters([
                'uiConfigData',
                'uiVersion'
            ])
        },
        watch: {
            '$route' (to) {
                this.configMenuId = to.query.menuId;
            },
            configMenuId: function(val, oldVal){
                this.config = {};
                this.$nextTick(()=>{
                    this.config = this.uiConfigData[val];
                    if (this.config) {
                        this.initTable(this.config);
                    } else {
                        this.$Message.warning('请去配置页面配置！');
                    }
                });
            }
        },
        methods: {
            //初始化
            initTable(config){
                this.searchForm = {};
                this.formParam = {};
                this.tableColumns = [];
                this.tableData = [];
                // 获取字典
                let code = this.$store.getters.dictstroage;
                // 构建查询表单
                if (config.tabConfigData.searchForm) {
                    this.searchForm = Object.values(config.tabConfigData.searchForm).sort((a, b) => {
                        return a.sortIndex - b.sortIndex;
                    });
                    this.searchForm.forEach((obj, index) => {
                        if (!this.formParam[obj.tableName]) {
                            this.$set(this.formParam, obj.tableName, {});
                        }
                        this.$set(this.formParam[obj.tableName], obj.name, '');
                        //获取对应字典
                        if (obj.dictName) {
                            let result = code.filter((item) => {
                                return item.code === obj.dictName;
                            });
                            if (result.length > 0) {
                                this.$set(this.dictList, obj.tableName + '.' + obj.name, result[0].value);
                            }
                        }
                    });
                }
                //构建Table
                if (config.tabConfigData.tableColumns) {
                    let arr = Object.values(config.tabConfigData.tableColumns).sort((a, b) => {
                        return a.sortIndex - b.sortIndex;
                    });
                    arr.forEach((obj, index, array)=>{
                        if (obj.isShow) {
                            let dictValues = null;
                            // 是否是字典
                            if (obj.dictName) {
                                let result = code.filter((item) => {
                                    return item.code === obj.dictName;
                                });
                                if (result.length > 0) {
                                    dictValues = result[0].value;
                                }
                            }
                            this.tableColumns.push({
                                title: obj.title ? obj.title : obj.name,
                                key: obj.name,
                                name: obj.tableName + "." + obj.name,
                                sortable: obj.isOrder,
                                render: (h, params) => { //如果是字典，获取对应的值
                                    if (obj.dictName && dictValues && params.row[obj.tableName]) {
                                        for (let i = 0; i < dictValues.length; i++) {
                                            if (dictValues[i].value == params.row[obj.tableName][obj.name]) {
                                                return h('span',dictValues[i].name);
                                            }
                                        }
                                    }
                                    return h('span',params.row[obj.tableName]? params.row[obj.tableName][obj.name] : '');
                                },
                                renderHeader: (h, param) => { //如果是字典，获取对应的值
                                    return h('span',{
                                        attrs: {
                                            title: obj.tableName + '表'
                                        },
                                    }, obj.title? obj.title :obj.name);
                                }
                            });
                        }
                    });
                }
                //是否分页
                if (config.tabConfigData.isPage) {
                    this.searchParams.pageParms.pageSize = 10;
                }
                this.initAction();
                //预览
                if (this.show) {
                    this.initSearchParams();
                    this.tableData.push({},{},{})
                } else {
                    this.search();
                }
            },
            tableSort(column){
                this.searchParams.orders = [];
                if (column.order !== 'normal') {
                    this.searchParams.orders.push({
                        fieldName: column.column.name,
                        orderType: column.order
                    });
                }
                this.searchPost(this.searchParams);
            },
            search(){
                this.initSearchParams();
                this.editSearchParams();
                this.searchPost(this.searchParams);
            },
            initSearchParams(){ //初始化查询参数
                this.searchParams.collection.filters = [];
                this.searchParams.orders = [];
                if (this.config.tabConfigData.isPage)
                    this.searchParams.pageParms.pageIndex = 1;
                else
                    this.searchParams.pageParms.pageIndex = 0;
            },
            editSearchParams(){
                if (this.searchForm && Object.keys(this.searchForm).length > 0) {
                    this.searchForm.forEach((obj, index) => {
                        if (obj.searchModel === 'RANGE') {
                            if (obj.format === 'date-time' && this.$refs[obj.tableName + '-' + obj.name + '-min'] && this.$refs[obj.tableName + '-' + obj.name + '-min'][0].internalValue && this.$refs[obj.tableName + '-' + obj.name + '-min'][0].internalValue[0]) {
                                this.searchParams.collection.filters.push({
                                    field: obj.tableName + '.' + obj.name,
                                    operator: 'GTE',
                                    value: this.editSearchValue(obj, this.$refs[obj.tableName + '-' + obj.name + '-min'][0].internalValue[0])
                                });
                            } else if (this.$refs[obj.tableName + '-' + obj.name + '-min'] && this.$refs[obj.tableName + '-' + obj.name + '-min'][0].currentValue){
                                this.searchParams.collection.filters.push({
                                    field: obj.tableName + '.' + obj.name,
                                    operator: 'GTE',
                                    value: this.editSearchValue(obj, this.$refs[obj.tableName + '-' + obj.name + '-min'][0].currentValue)
                                });
                            }
                            if (obj.format === 'date-time' && this.$refs[obj.tableName + '-' + obj.name + '-max'] && this.$refs[obj.tableName + '-' + obj.name + '-max'][0].internalValue && this.$refs[obj.tableName + '-' + obj.name + '-max'][0].internalValue[0]) {
                                this.searchParams.collection.filters.push({
                                    field: obj.tableName + '.' + obj.name,
                                    operator: 'LTE',
                                    value: this.editSearchValue(obj, this.$refs[obj.tableName + '-' + obj.name + '-max'][0].internalValue[0])
                                });
                            } else if (this.$refs[obj.tableName + '-' + obj.name + '-max'] && this.$refs[obj.tableName + '-' + obj.name + '-max'][0].currentValue){
                                this.searchParams.collection.filters.push({
                                    field: obj.tableName + '.' + obj.name,
                                    operator: 'LTE',
                                    value: this.editSearchValue(obj, this.$refs[obj.tableName + '-' + obj.name + '-max'][0].currentValue)
                                });
                            }

                        } else {
                            if (this.formParam[obj.tableName][obj.name]) {
                                this.searchParams.collection.filters.push({
                                    field: obj.tableName + '.' + obj.name,
                                    operator: obj.searchModel,
                                    value: this.editSearchValue(obj, this.formParam[obj.tableName][obj.name])
                                });
                            }
                        }
                    });
                }
            },
            // 构建操作
            initAction(){
                let otherAction = [];
                if (this.config.tableRowBtnConfigs) {
                    this.config.tableRowBtnConfigs.forEach((btn)=>{
                        otherAction.push({
                            text: btn.btnName,
                            config: btn.btnConfig,
                            type: btn.btnType,
                            btnId: btn.btnId
                        });
                    });
                }
                if (otherAction.length > 0) {
                    let control = {
                        title: '操作', key: 'action', align: 'center', render: (h, params) => {
                            return h('div',{}, otherAction.map(item => {
                                let data = params.row;
                                let options = require ('../' + item.config.component).default;
                                let a = new Vue({
                                    extends: options,
                                    created(){
                                        this.parentData = data;
                                    }
                                });
                                let _this = this;
                                let b = h(Vue.extend(a.$options), {on:{
                                        refreshTable: function () {
                                            _this.search();
                                        }
                                    }});
                                return b;
                            }));
                        }
                    };
                    this.tableColumns.push(control);
                }
            },
            searchPost(params) {
                this.$http.post(this.config.pathmag.page.uri, params).then((response) => {
                    this.tableData = response.data.data;
                    this.searchParams.pageParms.recordCount = response.data.totalElements;
                });
            },
            pageChange(index){
                this.searchParams.pageParms.pageIndex = index;
                this.searchPost(this.searchParams);
            },
            pageSizeChange(pageSize){
                this.searchParams.pageParms.pageIndex = 1;
                this.searchParams.pageParms.pageSize = pageSize;
                this.searchPost(this.searchParams);
            },
            clearSearchForm() {
                this.$refs['searchValidate'].resetFields();
                this.searchForm.forEach((obj) => {
                    if (obj.searchModel === 'RANGE') {
                        let arr = ['-min', '-max'];
                        for (let i=0; i < arr.length; i++) {
                            if (this.$refs[obj.tableName + '-' + obj.name + arr[i]]) {
                                if (obj.format === 'date-time') {
                                    this.$refs[obj.tableName + '-' + obj.name + arr[i]][0].internalValue = [];
                                } else if ( this.$refs[obj.tableName + '-' + obj.name + arr[i]][0].currentValue){
                                    this.$refs[obj.tableName + '-' + obj.name + arr[i]][0].currentValue = '';
                                }
                            }
                        }
                    }
                });
            },
            editSearchValue(obj, value) {
                if (obj.type === 'integer') {
                    value = parseInt(value);
                }
                if (obj.format === 'date-time') {
                    value = value.dateFormat(obj.pattern);
                }
                return value;
            },
            initTableBtn(){
                let _this = this;
                if(this.config.tableBtnConfigs && this.config.tableBtnConfigs.length > 0) {
                    this.config.tableBtnConfigs.forEach((btn)=>{
                        let options = require('../' + btn.btnConfig.component).default;
                        let a = Vue.extend(options);
                        let b = new a({
                            router: this.$router,
                            store: this.$store,
                            parent: this,
                            computed: {
                                parentData(){
                                    return _this.tableData;
                                }
                            }
                        }).$on('refreshTable', function () {
                            _this.search();
                        });
                        b.$mount('#btnFrom-' + btn.btnId);
                    });
                }
            }
        }
    }
</script>

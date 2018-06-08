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
            <Form-MItem v-if="searchForm.length > 0" v-for="(col, index) in searchForm" :key="index" :label="col.title || col.name" :prop="col.name" :labelTitle="col.tableName">
                <div v-if="col.searchModel == 'RANGE'">
                    <div v-if="col.format == 'date-time'">
                        <DatePicker type="datetime" :format="col.pattern" :ref="col.name + '-min'"></DatePicker>
                        <DatePicker type="datetime" :format="col.pattern" :ref="col.name + '-max'"></DatePicker>
                    </div>
                    <div v-else>
                        <Input type="text" :ref="col.name + '-min'" style="width: 45%"></Input>
                        <Input type="text" :ref="col.name + '-max'"  style="width: 45%"></Input>
                    </div>
                </div>
                <div v-else>
                    <Select v-if="col.dictName && dictList[col.name]" v-model="formParam[col.name]" style="min-width: 187px">
                        <Option v-for="opt in dictList[col.name]" :value="opt.value" :key="opt.value">{{ opt.name }}</Option>
                    </Select>
                    <DatePicker v-else-if="col.format == 'date-time'" type="datetime" :format="col.pattern" v-model="formParam[col.name]"></DatePicker>
                    <Input v-else type="text" v-model="formParam[col.name]" style="min-width: 187px"></Input>
                </div>
            </Form-MItem>
            <FormItem v-if="searchForm.length > 0">
                <Button type="info" @click="search">查 询</Button>
            </FormItem>
            <FormItem v-if="searchForm.length > 0">
                <Button type="ghost" @click="clearSearchForm">清 空</Button>
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
    import FormItemExt from '../../../common/component/form-item-ext/form-item.vue'
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
            } else {
                this.configMenuId = this.configMenuId?this.configMenuId: this.menuId;
                this.$store.dispatch('getConfig', this.uiVersion).then(()=>{
                    this.config = this.uiConfigData[this.configMenuId];
                    if (this.config) {
                        this.initTable(this.config);
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
                        this.$set(this.formParam, obj.name, '');
                        //获取对应字典
                        if (obj.dictName) {
                            let result = code.filter((item) => {
                                return item.code === obj.dictName;
                            });
                            if (result.length > 0) {
                                this.$set(this.dictList, obj.name, result[0].value);
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
                                    if (obj.dictName && dictValues) {
                                        for (let i = 0; i < dictValues.length; i++) {
                                            if (dictValues[i].value == params.row[obj.name]) {
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
                this.searchForm.forEach((obj, index) => {
                    if (obj.searchModel === 'RANGE') {
                        if (this.$refs[obj.name + '-min'] && this.$refs[obj.name + '-min'][0].currentValue) {
                            this.searchParams.collection.filters.push({
                                field: obj.tableName + '.' + obj.name,
                                operator: 'GTE',
                                value: this.editSearchValue(obj, this.$refs[obj.name + '-min'][0].currentValue)
                            });
                        }
                        if (this.$refs[obj.name + '-max'] && this.$refs[obj.name + '-max'][0].currentValue) {
                            this.searchParams.collection.filters.push({
                                field: obj.tableName + '.' + obj.name,
                                operator: 'LTE',
                                value: this.editSearchValue(obj, this.$refs[obj.name + '-max'][0].currentValue)
                            });
                        }
                    } else {
                        if (this.formParam[obj.name]) {
                            this.searchParams.collection.filters.push({
                                field: obj.tableName + '.' + obj.name,
                                operator: obj.searchModel,
                                value: this.editSearchValue(obj, this.formParam[obj.name])
                            });
                        }
                    }
                });
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
            },
            editSearchValue(obj, value) {
                if (obj.type === 'integer') {
                    value = parseInt(value);
                }
                if (obj.format === 'date-time') {
                    value = value.dateFormat(obj.pattern);
                }
                return value;
            }
        }
    }
</script>

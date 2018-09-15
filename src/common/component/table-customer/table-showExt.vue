<style lang="scss">
    div.table-ext-show{
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
    div.table-ext-show{
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
    <div class="table-ext-show">
        <Form ref="searchValidate" :model="formParam" inline @submit.native.prevent>
            <FormItem v-if="searchForm.length > 0" v-for="(col, index) in searchForm" :key="index" :label="col.title || col.name" :prop="col.name">
                <div v-if="col.searchModel == 'RANGE'">
                    <div v-if="col.format == 'date-time'">
                        <DatePicker type="datetime" :format="col.pattern" :ref="col.name + '-min'"></DatePicker>~
                        <DatePicker type="datetime" :format="col.pattern" :ref="col.name + '-max'"></DatePicker>
                    </div>
                    <div v-else>
                        <Input type="text" :ref="col.name + '-min'" style="width: 45%"/>~
                        <Input type="text" :ref="col.name + '-max'"  style="width: 45%"/>
                    </div>
                </div>
                <div v-else>
                    <Select v-if="col.dictName && dictList[col.name]" v-model="formParam[col.name]" style="min-width: 187px">
                        <Option v-for="opt in dictList[col.name]" :value="opt.value" :key="opt.value">{{ opt.name }}</Option>
                    </Select>
                    <DatePicker v-else-if="col.format == 'date-time'" type="datetime" :format="col.pattern" v-model="formParam[col.name]"></DatePicker>
                    <person-input style="min-width: 187px" v-else-if="col.personInput && col.personInput.length > 0" :single="col.personInput.indexOf('single') > -1" :person="col.personInput.indexOf('person') > -1" :org="col.personInput.indexOf('org') > -1" :team="col.personInput.indexOf('team') > -1" v-model="formParam[col.name]"></person-input>
                    <Input v-else type="text" v-model="formParam[col.name]" style="min-width: 187px"/>
                </div>
            </FormItem>
            <FormItem v-if="searchForm.length > 0">
                <Button type="info" @click="search">查 询</Button>
            </FormItem>
            <FormItem v-if="config.tabConfigData.isAdd" >
                <Button class="add-btn" type="primary" @click="addForm">新 增</Button>
            </FormItem>
            <FormItem v-if="searchForm.length > 0">
                <Button type="ghost" @click="clearSearchForm">清 空</Button>
            </FormItem>
            <FormItem v-if="config.tabConfigData.isImport" >
                <Button :loading="downloadTemplateLoading" type="default" icon="ios-cloud-download" @click="downloadTemplate">
                    <span v-if="!downloadTemplateLoading">下载模板</span>
                    <span v-else>模板生成中...</span>
                </Button>
            </FormItem>
            <FormItem v-if="config.tabConfigData.isImport">
                <Button :loading="downloadExportLoading" type="default" icon="ios-cloud-download-outline" @click="downloadExport">
                    <span v-if="!downloadExportLoading">导出数据</span>
                    <span v-else>数据生成中...</span>
                </Button>
            </FormItem>
            <FormItem v-if="config.tabConfigData.isImport">
                <Upload style="display: inline-block;"
                        :before-upload="handleImport"
                        :show-upload-list="false"
                        :format="['xlsx','xls']"
                        :on-format-error="handleImportFormatError"
                        action="/excel/api/excel/import/save">
                    <Button type="ghost" :loading="importLoading" icon="ios-cloud-upload-outline">
                        <span v-if="!importLoading">导入数据</span>
                        <span v-else>数据导入中...</span>
                    </Button>
                </Upload>
            </FormItem>
            <FormItem v-if="config.tableBtnConfigs && config.tableBtnConfigs.length>0" v-for="(btn, index) in config.tableBtnConfigs" :key="btn.btnId">
                <div :id="'btnFrom-'+btn.btnId"></div>
            </FormItem>
        </Form>
        <Table :columns="tableColumns" :data="tableData" @on-sort-change="tableSort" ref="table-show-ref"></Table>
        <div class="page" v-if="config.tabConfigData.isPage">
            <Page :total="searchParams.pageParms.recordCount" :current="searchParams.pageParms.pageIndex" show-sizer show-total @on-change="pageChange" @on-page-size-change="pageSizeChange" placement="top" ></Page>
        </div>

        <Modal v-model="modelShow" :title="modelTitle" @on-ok="" width="600" ok-text="" @on-cancel="" :transfer="true">
            <form-show :config="config" ref="childForm" v-if="modelShow"></form-show>
            <div slot="footer">
                <Button type="ghost" @click="cancelModel">取消</Button>
                <Button type="primary" @click="handleSubmit()">提交</Button>
            </div>
        </Modal>

        <Modal v-model="childModelShow" :title="childModelTitle" @on-ok="" width="600" ok-text="" @on-cancel="" :transfer="true">
            <form-show :config="childConfig" ref="childOneForm" v-if="childModelShow"></form-show>
            <div slot="footer">
                <Button type="ghost" @click="cancelChildModel">取消</Button>
                <Button type="primary" @click="handleChildSubmit">提交</Button>
            </div>
        </Modal>

    </div>
</template>
<script type="text/ecmascript-6">
    import FormShow from '../form-customer/form-showExt.vue';
    import RoleButton from '../role-button/role-button.vue';
    import Util from '../../../libs/util';
    import Vue from 'vue';
    import fileServer from '../../../libs/fileServer';
    export default {
        data(){
            return{
                searchForm:[], //查询表单配置,由父组件传入
                formParam:{}, //查询表单
                tableColumns: [], //表头
                tableData:[], //表格数据
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
                modelShow: false,
                modelTitle: '',
                requestFlag: '', //add 新增, update 更新
                dictList: {}, //表单用 所有字典
                tableName: '', //对应的表名
                downloadTemplateLoading: false, // 导出模板按钮状态
                downloadExportLoading: false, // 导出数据模板状态
                importLoading: false, // 导入按钮加载状态
                showReportModal: false, // 导入结果报告对话框
                excelReport: {}, // 导入结果报告
                excelFile: null, // 导入Excel文件
                // one to one 用
                childModelShow: false,
                childModelTitle: '',
                childConfig: {},
                childRequestFlag: '' //add 新增, update 更新
            };
        },
        props:{
            config: {
                type: Object
            },
            excelHeader:{
                type: String
            },
            initParam: {
                type: Object
            },
            show:{
                type: Boolean,
                default: false
            },
        },
        components: {
            'form-show': FormShow,
            'role-button': RoleButton
        },
        created() {
            //表名
            this.tableName = this.config.tableMappingName.toLowerCase().replace(/_(\w)/g, ($0,$1) => $1.toUpperCase());
            // 获取字典
            let code = this.$store.getters.dictstroage;
            // 构建查询表单
            if (this.config.tabConfigData.searchForm) {
                this.searchForm = Object.values(this.config.tabConfigData.searchForm).sort((a, b) => {
                    return a.sortIndex - b.sortIndex;
                });
                this.searchForm.forEach((obj) => {
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
            if (this.config.tabConfigData.tableColumns) {
                let arr = Object.values(this.config.tabConfigData.tableColumns).sort((a, b) => {
                    return a.sortIndex - b.sortIndex;
                });
                arr.forEach((obj)=>{
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
                        let _this = this;
                        this.tableColumns.push({
                            title: obj.title ? obj.title : obj.name,
//                            key: obj.name,
                            sortable: obj.isOrder,
                            render: (h, params) => {
                                let content = h('span',params.row[obj.name]);
                                if (!params.row[obj.name]) { //先判断是否有值，没有值就为空字符串
                                    return ''
                                } else if (obj.dictName && dictValues){ //如果是字典，获取对应的值
                                    for (let i = 0; i < dictValues.length; i++) {
                                        if (dictValues[i].value == params.row[obj.name]) {
                                            content = h('span',dictValues[i].name);
                                        }
                                    }
                                } else if (obj.fileId && obj.fileId !== '') {
                                    content = h('a',{
                                        on:{
                                            click(){
                                                fileServer.downloadFile(params.row[obj.fileId], params.row[obj.name]);
                                            }
                                        }
                                    }, [params.row[obj.name]])
                                } else if (obj.renderFormat) {
                                    if (obj.format === 'date-time') {
                                        content = h('div',{}, new Date(params.row[obj.name]).dateFormat(obj.renderFormat));
                                    } else {
                                        let result = obj.renderFormat.replace('${d}', 'params.row[obj.name]');
                                        content = h('div',{}, eval(result));
                                    }
                                }
                                return content
                            }
                        });
                    }
                });
            }
            //操作
            this.initAction();
            //是否分页
            if (this.config.tabConfigData.isPage) {
                this.searchParams.pageParms.pageSize = 10;
            }
            //预览用
            if (this.show) {
                this.initSearchParams();
                this.searchParams.pageParms.recordCount = 3;
                this.tableData.push({},{},{});
            } else {
                this.search();
            }
        },
        methods:{
            search(){
                this.initSearchParams();
                this.editSearchParams();
                this.searchPost(this.searchParams);
            },
            searchPost(params) {
                this.$http.post(this.config.pathmag.page.uri, params).then((response) => {
                    this.tableData = response.data.data;
                    this.searchParams.pageParms.recordCount = response.data.totalElements;
                });
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
            pageChange(index){
                this.searchParams.pageParms.pageIndex = index;
                this.searchPost(this.searchParams);
            },
            pageSizeChange(pageSize){
                this.searchParams.pageParms.pageIndex = 1;
                this.searchParams.pageParms.pageSize = pageSize;
                this.searchPost(this.searchParams);
            },
            initSearchParams(){
                this.searchParams.collection.filters = [];
                this.searchParams.orders = [];
                if (this.config.tabConfigData.isPage)
                    this.searchParams.pageParms.pageIndex = 1;
                else
                    this.searchParams.pageParms.pageIndex = 0;
            },
            editSearchParams(){
                this.searchForm.forEach((obj) => {
                    if (obj.searchModel === 'RANGE') {
                        let arr= [{name:'-min', operator: 'GTE'},{name:'-max', operator: 'LTE'}];
                        for (let i=0; i < arr.length; i++) {
                            if (this.$refs[obj.name + arr[i].name]) {
                                if (obj.format === 'date-time' && this.$refs[obj.name + arr[i].name][0].internalValue && this.$refs[obj.name + arr[i].name][0].internalValue[0]) {
                                    this.searchParams.collection.filters.push({
                                        field: obj.name,
                                        operator: arr[i].operator,
                                        value: this.editSearchValue(obj, this.$refs[obj.name + arr[i].name][0].internalValue[0])
                                    });
                                } else if (this.$refs[obj.name + arr[i].name][0].currentValue){
                                    this.searchParams.collection.filters.push({
                                        field: obj.name,
                                        operator: arr[i].operator,
                                        value: this.editSearchValue(obj, this.$refs[obj.name + arr[i].name][0].currentValue)
                                    });
                                }
                            }
                        }
                    } else {
                        if (this.formParam[obj.name]) {
                            this.searchParams.collection.filters.push({
                                field: obj.name,
                                operator: obj.searchModel,
                                value: this.editSearchValue(obj, this.formParam[obj.name])
                            });
                        }
                    }
                });
            },
            editSearchValue(obj, value) {
                if (obj.type && obj.type === 'integer') {
                    value = parseInt(value);
                } else if (obj.type && obj.type === 'number') {
                    value = Number(value);
                } else if (obj.format && obj.format === 'date-time') {
                    value = value.dateFormat(obj.pattern);
                }
                return value;
            },
            // 构建操作
            initAction(){
                let arrAction = [];
                let otherAction = [];
                arrAction = arrAction.concat(this.config.tabConfigData.action);
                for (let key in this.config.tabConfigData.tableColumns) {
                    let obj = this.config.tabConfigData.tableColumns[key];
                    if (obj.relationType) {
                        obj.tableConfig.configName = obj.title;
                        arrAction.push({
                            text: obj.title,
                            relationType: obj.relationType,
                            config: obj.tableConfig
                        });
                    }
                }
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
                if (arrAction.length > 0 || otherAction.length > 0) {
                    let control = {
                        title: '操作', key: 'action', align: 'center', render: (h, params) => {
                            return h('div',{}, arrAction.map(item => {
                                return h('role-button', {
                                    props: {
                                        type: item.type || 'ghost', size: 'small'
                                    },
                                    style: {marginRight: '5px'},
                                    on: {
                                        click: () => {
                                            if (item.text === '修改') {
                                                this.modifyForm(params.row);
                                            } else if (item.text === '删除') {
                                                this.deleteForm(params.row);
                                            } else if (item.relationType === 'one_to_many') {
                                                let tempConfig = JSON.parse(JSON.stringify(item.config));
                                                for (let key in tempConfig.pathmag) {
                                                    tempConfig.pathmag[key].uri = this.editUrl(params.row, tempConfig.pathmag[key].uri, true);
                                                }
                                                this.$emit('oneToMany', tempConfig);
                                            } else if (item.relationType === 'one_to_one') {
                                                let tempConfig = JSON.parse(JSON.stringify(item.config));
                                                for (let key in tempConfig.pathmag) {
                                                    tempConfig.pathmag[key].uri = this.editUrl(params.row, tempConfig.pathmag[key].uri, true);
                                                }
                                                this.childModelTitle =  item.config.configName;
                                                this.childConfig = tempConfig;
                                                this.childModelShow = true;
                                                this.$nextTick(()=>{
                                                    this.$refs.childOneForm.getData(params.row).then((data)=>{
                                                        this.childRequestFlag = data? 'update': 'add';
                                                    });
                                                });
                                            }
                                        }
                                    }
                                }, item.text);
                            }).concat(otherAction.map(item => {
                                let data = params.row;
                                let options = require ('../../../views/content/' + item.config.component).default;
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
                            })));
                        }
                    };
                    this.tableColumns.push(control);
                }
            },
            cancelModel() {
                this.modelShow = false;
                this.$refs['childForm'].clearData();
            },
            cancelChildModel(){
                this.childModelShow = false;
                this.$refs['childOneForm'].clearData();
            },
            modifyForm(data){
                this.modelShow = true;
                this.modelTitle = '数据详情';
                this.requestFlag = 'update';
                this.$nextTick(()=>{
                    this.$refs['childForm'].clearData();
                    this.$refs['childForm'].getData(data);
                });
            },
            addForm(){
                this.modelShow = true;
                this.modelTitle = '新增详情';
                this.requestFlag = 'add';
                this.$nextTick(()=>{
                    this.$refs['childForm'].clearData();
                });
            },
            handleChildSubmit() {
                if (this.childRequestFlag === 'update') {
                    this.$refs['childOneForm'].updateData().then((data)=> {
                        if (data === 200) {
                            this.childModelShow = false;
                        }
                    });
                } else if (this.childRequestFlag === 'add') {
                    this.$refs['childOneForm'].insertData().then((data)=> {
                        if (data === 200) {
                            this.childModelShow = false;
                        }
                    });
                }
            },
            handleSubmit() {
                if (this.requestFlag === 'update') {
                    this.$refs['childForm'].updateData().then((data)=> {
                        if (data === 200) {
                            this.searchPost(this.searchParams);
                            this.modelShow = false;
                        }
                    });
                } else if (this.requestFlag === 'add') {
                    this.$refs['childForm'].insertData().then((data)=> {
                        if (data === 200) {
                            this.searchPost(this.searchParams);
                            this.modelShow = false;
                        }
                    });
                }
            },
            deleteForm(data) {
                this.$Modal.confirm({
                    title: '删除确认',
                    content: '<p>确认要执行删除操作吗？</p>',
                    onOk: () => {
                        let deleteUrl = this.editUrl(data, this.config.pathmag.delete.uri);
                        this.$http[this.config.pathmag.delete.method.toLowerCase()](deleteUrl).then((response) => {
                            if (response.status === 200) {
                                this.searchPost(this.searchParams);
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
            clearSearchForm() {
                this.$refs['searchValidate'].resetFields();
                this.searchForm.forEach((obj) => {
                    if (obj.searchModel === 'RANGE') {
                        let arr = ['-min', '-max'];
                        for (let i=0; i < arr.length; i++) {
                            if (this.$refs[obj.name + arr[i]]) {
                                if (obj.format === 'date-time') {
                                    this.$refs[obj.name + arr[i]][0].internalValue = [];
                                } else if ( this.$refs[obj.name + arr[i]][0].currentValue){
                                    this.$refs[obj.name + arr[i]][0].currentValue = '';
                                }
                            }
                        }
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
            // 下载导入数据模板
            downloadTemplate () {
                let excelTitle = this.config.tabConfigData.importExcelConfig.excelHeader != undefined &&
                  this.config.tabConfigData.importExcelConfig.excelHeader.length > 0 ?
                  this.config.tabConfigData.importExcelConfig.excelHeader : this.config.tableMappingName;
                let url = Util.url + Util.baseUrl + '/api/common/excel/template/download';
                let fileName = excelTitle + '_导入模板.xlsx';
                let reqData = {
                    'excelTitle': [],
                    'tableName': this.config.tableMappingName,
                    'excelHeader': excelTitle + '数据'
                };
                let i = 0;
                for (let key in this.config.formConfigData) {
                    let excelTitleObj = {};
                    excelTitleObj.fieldName = this.config.formConfigData[key].mappingName;
                    excelTitleObj.fieldDESC = this.config.formConfigData[key].description || this.config.formConfigData[key].mappingName;
                    excelTitleObj.order = i;
                    excelTitleObj.type = this.config.formConfigData[key].type;
                    reqData.excelTitle.push(excelTitleObj);
                    i++;
                }
                this.downloadTemplateLoading = true;
                this.download(url, fileName, reqData, 'template');
            },
            // 下载文件
            download(url, fileName, reqData, btnModel){
                let xhr = new XMLHttpRequest(), compVue = this;
                xhr.open('POST', url, true);
                xhr.setRequestHeader('AUTH_TOKEN', this.$store.getters.loginInfo.authToken);
                xhr.setRequestHeader('CURRENT_USER', this.$store.getters.loginInfo.loginId);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.responseType = 'blob';
                xhr.onload = function () {
                    if (this.status === 200) {
                        let blob = this.response;
                        if (navigator.appVersion.toString().indexOf('.NET') > 0) {
                            window.navigator.msSaveBlob(blob, fileName);
                        } else {
                            let body = document.body;
                            let a = document.createElement('a');
                            a.download = fileName;
                            a.href = URL.createObjectURL(blob);
                            body.appendChild(a);
                            a.click();
                            body.removeChild(a);
                        }
                    } else {
                        compVue.$Message.error('文件下载失败');
                    }
                    switch (btnModel) {
                        case 'export':
                            compVue.downloadExportLoading = false;
                            break;
                        case 'template':
                            compVue.downloadTemplateLoading = false;
                            break;
                        default:
                            break;
                    }
                };
                xhr.send(JSON.stringify(reqData));
            },
            // 下载数据
            downloadExport () {
                let excelTitle = this.config.tabConfigData.importExcelConfig.excelHeader != undefined &&
                  this.config.tabConfigData.importExcelConfig.excelHeader.length > 0 ?
                  this.config.tabConfigData.importExcelConfig.excelHeader : this.config.tableMappingName;
                let url = Util.url + Util.baseUrl + '/api/common/excel/export/download';
                let fileName = excelTitle + '_数据导出.xlsx';
                let searchp = [];
                if (this.initParam) {
                    for (let key in this.initParam.export) {
                        let searchparam = {};
                        searchparam.field = key;
                        searchparam.operator = 'EQ';
                        searchparam.value = this.initParam.export[key];
                        searchp.push(searchparam);
                    }
                }
                let reqData = {
                    'excelTitle': [],
                    'tableName': this.config.tableMappingName,
                    'excelHeader': excelTitle + '数据',
                    'pageDTO': {
                        'collection': {
                            'filters': searchp
                        },
                        'orders': [],
                        'pageParms': {
                            'autoRecordCount': true,
                            'pageIndex': 0,
                            'pageSize': 0,
                            'recordCount': 0
                        }
                    }
                };
                let i = 0;
                for (let key in this.config.tabConfigData.tableColumns) {
                    if (this.config.tabConfigData.tableColumns[key].type === 'array' || this.config.tabConfigData.tableColumns[key].type === 'object') {
                        continue;
                    }
                    let excelTitleObj = {};
                    excelTitleObj.fieldName = this.config.tabConfigData.tableColumns[key].mappingName;
                    excelTitleObj.fieldDESC = this.config.tabConfigData.tableColumns[key].description || this.config.tabConfigData.tableColumns[key].mappingName;
                    excelTitleObj.order = i;
                    excelTitleObj.type = this.config.tabConfigData.tableColumns[key].type;
                    excelTitleObj.pattern = this.config.tabConfigData.tableColumns[key].pattern;
                    reqData.excelTitle.push(excelTitleObj);
                    i++;
                }
                this.downloadExportLoading = true;
                this.download(url, fileName, reqData, 'export');
            },
            // 处理没有选择Excel文件的情况
            handleImportFormatError(){
                this.$Message.error('请选择Excel文件');
            },
            // 导入文件
            handleImport(file) {
                this.excelFile = file;
                if (file.type.indexOf('openxmlformats') > 0 || file.type.indexOf('ms-excel') > 0) {
                    // 判断是否有配置正确的导入接口
                    if (!this.config.pathmag.import_excel || this.config.pathmag.import_excel.uri.length === 0) {
                        this.$Message.error('请前往配置页面配置的导入Excel地址');
                    } else {
                        this.$Modal.confirm({
                            title: '导入数据',
                            content: '确定文件 ' + this.excelFile.name + ' 的数据么？',
                            onOk: () => {
                                this.importLoading = true;
                                this.$Message.info('开始导入数据');
                                let formdata = new FormData();
                                formdata.append('file', this.excelFile);
                                formdata.append('tableName', this.config.tableMappingName);
                                formdata.append('version', this.config.tabConfigData.importExcelConfig.isVersion);
                                if (this.initParam) {
                                    for (let key in this.initParam.search) {
                                        formdata.append('extParams[' + key + ']', this.initParam.search[key]);
                                    }
                                }
                                // 生成excel对应参数数组
//                                let i = 0, excelTitleArr = [];
                                let i =0;
                                for (let key in this.config.formConfigData) {
                                    formdata.append('excelTitle[' + i + '].fieldName', this.config.formConfigData[key].mappingName);
                                    formdata.append('excelTitle[' + i + '].attrName', this.config.formConfigData[key].name);
                                    formdata.append('excelTitle[' + i + '].fieldDESC', this.config.formConfigData[key].description);
                                    formdata.append('excelTitle[' + i + '].type', this.config.formConfigData[key].type);
                                    formdata.append('excelTitle[' + i + '].order', i);
                                    i++;
                                }
                                // 添加请求头
                                let config = {
                                    headers: {
                                        'Content-Type': 'multipart/form-data'
                                    }
                                };
                                // 上传参数和文件
                                this.$http.post(this.config.pathmag.import_excel.uri, formdata, config).then((res) => {
                                    if (res.data.statusCode == '0') {
                                        this.excelReport = res.data.excelReport;
                                        this.excelImportReport();
                                    } else {
                                        this.importLoading = false;
                                        this.$Message.error('导入数据发生异常');
                                    }
                                }).catch(() => {
                                    this.importLoading = false;
                                    this.$Message.error('导入数据发生异常');
                                });
                            },
                            onCancel: () => {
                                this.importLoading = false;
                            }
                        });
                    }
                } else {
                    this.handleImportFormatError(file);
                }
                return false;
            },
            // 导入数据结果报告
            excelImportReport() {
                let report = this.excelReport, me = this;
                let reportDetail = '<p>导入总条数:' + report.total + '，成功' + report.successTotal + '条，<span style="color: red">失败' + report.failedTotal + '条</span></p>';
                if (report.failedDetails.length > 0) {
                    reportDetail += '<br/><p>失败行详情：</p>';
                    for (let i = 0;i < report.failedDetails.length;i++) {
                        reportDetail += '<p>第' + report.failedDetails[i].index + '行：' + report.failedDetails[i].failedReason + '</p>';
                    }
                }
                // 延时一段时间防止modal消失
                setTimeout(function(){
                    me.importLoading = false;
                    me.$Modal.success({
                        title: '数据导入成功，耗时：' + report.timeCost + '毫秒',
                        content: reportDetail,
                        width: '600px',
                        onOk: () => {
                            me.searchPost(me.searchParams);
                        }
                    });
                }, 1000);
            }
        },
        mounted(){
            let _this = this;
            if(this.config.tableBtnConfigs && this.config.tableBtnConfigs.length > 0) {
                this.config.tableBtnConfigs.forEach((btn)=>{
                    let options = require('../../../views/content/' + btn.btnConfig.component).default;
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
    };
</script>

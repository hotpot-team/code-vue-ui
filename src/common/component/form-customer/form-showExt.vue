<style lang="scss" scoped>
    .single-form{
        @include compatibleFlex;
        flex-wrap: wrap;
        -ms-flex-wrap: wrap;
        &>div{
            min-width: 30%;
        }
    }
</style>
<template>
    <div style="margin-right: 48px">
        <Form ref="formValidate" :model="formData" :rules="ruleValidate" :label-width="100" @submit.native.prevent :class="singleClass + '-form'">
            <FormItem v-for="(item, index) in formItemList" v-if="item.isShow || item.required" :key="index" :label="item.title || item.name" :prop="item.name">
                <RadioGroup v-if="item.isRadio" v-model="formData[item.name]">
                    <Radio v-for="(opt, index) in dictList[item.name]" :label="opt.value" :key="index">{{opt.name}}</Radio>
                </RadioGroup>
                <Select v-else-if="item.dictName && dictList[item.name]" v-model="formData[item.name]" >
                    <Option v-for="opt in dictList[item.name]" :value="opt.value" :key="opt.value + ''">{{ opt.name }}</Option>
                </Select>
                <Select v-else-if="treeConfig && item.name === treeConfig.parentId" v-model="formData[item.name]">
                    <Option v-for="opt in treeData" :value="opt[treeConfig.value]" :key="opt[treeConfig.value]">{{opt[treeConfig.label]}}</Option>
                </Select>
                <DatePicker style="width: 100%" v-else-if="item.format == 'date-time' || item.isDatePicker" :type="item.dateType||'date'" v-model="formData[item.name]" :format="item.pattern"></DatePicker>
                <person-input v-else-if="item.personInput && item.personInput.length > 0"  :single="item.personInput.indexOf('single') > -1" :person="item.personInput.indexOf('person') > -1" :org="item.personInput.indexOf('org') > -1" :team="item.personInput.indexOf('team') > -1" v-model="formData[item.name]"></person-input>
                <UploadFile v-else-if="item.fileId && item.fileId !== ''" v-model="formData[item.name]" :file-id.sync="formData[item.fileId]"></UploadFile>
                <Input v-else v-model="formData[item.name]" :type="item.isTextArea?'textarea':'text'"></Input>
            </FormItem>

            <FormItem v-if="config.formBtnConfigs && config.formBtnConfigs.length>0" v-for="(btn, index) in config.formBtnConfigs" :key="btn.btnId">
                <div :id="'btnFrom-'+btn.btnId"></div>
            </FormItem>
        </Form>
    </div>
</template>
<script type="text/ecmascript-6">
import Vue from 'vue';
import UploadFile from '../upload-file/upload-file';
export default {
    data() {
        return {
            formItemList: [], //表单
            ruleValidate: {}, //验证配置
            formData: {}, //提交用
            dictList: {}, //表单用 所有字典
            tableName: '' //对应的表名
        };
    },
    props: {
        config: {
            type: Object
        },
        treeData: {
            type: Array
        },
        treeConfig: {
            type: Object
        },
        singleClass:{
            type: String,
            default: 'normal'
        }
    },
    components:{
        UploadFile
    },
    created(){
        const validateRequired = (rule, value, callback) => {
            if (value == '') {
                callback(new Error(rule.message));
            } else {
                callback();
            }
        };
        //没有配置
        if (!this.config.formConfigData) {
            return;
        }
        //排序
        this.formItemList = Object.values(this.config.formConfigData).sort((a, b) => {
            return a.sortIndex - b.sortIndex;
        });
        let code = this.$store.getters.dictstroage;
        this.formItemList.forEach((obj) => {
            // 验证规则
            if (obj.isValidate && obj.ruleValidate) {
                let rules = Object.values(JSON.parse(JSON.stringify(obj.ruleValidate)));
                rules.forEach((item, index)=> {
                    if (item.pattern && item.pattern !== '') {
                        item.pattern = new RegExp(item.pattern);
                    }
                    if (item.required) {
                        rules.splice(index, 1);
                        rules.unshift({validator: validateRequired, trigger: item.trigger, message: item.message, required: true});
                    }
                });
                this.$set(this.ruleValidate, obj.name, rules);
            }
            this.$set(this.formData, obj.name, '');
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
        //表名
        if (this.config.tableMappingName){
            this.tableName = this.config.tableMappingName.toLowerCase().replace(/_(\w)/g, ($0,$1) => $1.toUpperCase());
        }

    },
    methods: {
        getData(data){
            return new Promise((resolve,reject)=>{
                if (!this.config.pathmag.detail || !this.config.pathmag.detail.uri) {
                    this.$Message.error('请配置请求地址');
                    resolve();
                }
                let detailUrl = this.editUrl(data, this.config.pathmag.detail.uri);
                this.$http[this.config.pathmag.detail.method.toLowerCase()](detailUrl).then((response) => {
                    if (response.status === 200) {
                        this.clearData();
                        this.formData = Object.assign({}, this.formData, response.data[this.tableName]);
                        resolve(this.formData);
                    }
                }).catch(() => {
                    // 错误提示
                    resolve();
                    reject();
                    this.$Message.error('获取数据失败');
                });
            });
        },
        updateData(){
            return new Promise((resolve,reject)=>{
                this.$refs['formValidate'].validate((valid) => {
                    if (valid) {
                        if (!this.config.pathmag.update || !this.config.pathmag.update.uri) {
                            resolve();
                            reject();
                        }
                        let updateUrl = this.editUrl(this.formData, this.config.pathmag.update.uri);
                        let data = Object.assign({}, this.formData);
                        for (let key in this.formData) {
                            if (this.config.formConfigData[key] && this.config.formConfigData[key].format === 'date-time' && data[key]) {
                                data[key] = data[key].dateFormat(this.config.formConfigData[key].pattern);
                            }
                        }
                        this.$http[this.config.pathmag.update.method.toLowerCase()](updateUrl, data).then((response) => {
                            if (response.status === 200) {
                                this.$Message.info('更新成功');
                            }
                            resolve(200);
                        }).catch(() => {
                            // 错误提示
                            resolve();
                            reject();
                            this.$Message.error('更新失败');
                        });
                    }
                });
            });
        },
        insertData(){
            return new Promise((resolve, reject)=>{
                this.$refs['formValidate'].validate((valid) => {
                    if (valid) {
                        let data = Object.assign({}, this.formData);
                        for (let key in this.formData) {
                            if (this.config.formConfigData[key] && this.config.formConfigData[key].format === 'date-time' && data[key]) {
                                data[key] = data[key].dateFormat(this.config.formConfigData[key].pattern);
                            }
                        }
                        this.$http[this.config.pathmag.create.method.toLowerCase()](this.config.pathmag.create.uri, data).then((response) => {
                            if (response.status === 200) {
                                this.$Message.info('创建成功');
                            }
                            resolve(200);
                            reject();
                        });
                    }
                });
            });
        },
        clearData(){
            for (let key in this.formData) {
                this.formData[key] = '';
            }
            this.$refs['formValidate'].resetFields();
        },
        editUrl(data, url) {
            //正则匹配出所有{}
            let arrayParam = url.match(new RegExp('(\\w+?)(?=})', 'g'));
            if (arrayParam && arrayParam.length > 0) {
                for (let i=0; i < arrayParam.length; i++) {
                    let param = arrayParam[i].replace(this.tableName, '').replace(/( |^)[A-Z]/g, (L) => L.toLowerCase());
                    if (data.hasOwnProperty(param)) {
                        let re = new RegExp('\{' + arrayParam[i] + '\}');
                        url = url.replace(re, data[param]);
                    } else {
                        this.$Message.info('请配置正确的详情参数');
                        return;
                    }
                }
            }
            return url;
        }
    },
    mounted(){
        if(this.config.formBtnConfigs && this.config.formBtnConfigs.length > 0) {
            this.config.formBtnConfigs.forEach((btn)=>{
                let options = require('../../../views/content/' + btn.btnConfig.component).default;
                let a = Vue.extend(options);
                new a({router: this.$router, store: this.$store, propsData: {parentData: this.formData}, parent: this}).$mount('#btnFrom-' + btn.btnId);
            });
        }
    }
};
</script>

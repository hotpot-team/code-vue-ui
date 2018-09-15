<style lang="scss" scoped>
</style>
<template>
    <div>
        <Form ref="propertyExt" :label-width="85">
            <FormItem label="展示名" prop="title">
                <Input v-model="column.title"></Input>
            </FormItem>
            <FormItem label="是否必填" prop="title">
                <Radio label="是" v-model="column.required" :true-value="true" :false-value="false" :disabled="column._disabled"></Radio>
                <Radio label="否" v-model="column.required" :true-value="false" :false-value="true" :disabled="column._disabled"></Radio>
            </FormItem>
            <FormItem label="是否只读" prop="title">
                <Radio label="是" v-model="column.readOnly" :true-value="true" :false-value="false" :disabled="column._disabled"></Radio>
                <Radio label="否" v-model="column.readOnly" :true-value="false" :false-value="true" :disabled="column._disabled"></Radio>
            </FormItem>
            <FormItem label="单选框形式" prop="title" v-if="column.dictName">
                <Radio label="是" v-model="column.isRadio" :true-value="true" :false-value="false"></Radio>
                <Radio label="否" v-model="column.isRadio" :true-value="false" :false-value="true"></Radio>
            </FormItem>
            <FormItem label="日期选择器" prop="title" v-if="!column.format">
                <Radio label="是" v-model="column.isDatePicker" :true-value="true" :false-value="false"></Radio>
                <Radio label="否" v-model="column.isDatePicker" :true-value="false" :false-value="true"></Radio>
            </FormItem>
            <FormItem label="文本框形式" prop="title" v-if="!column.dictName && !column.format && !column.isDatePicker">
                <Radio label="是" v-model="column.isTextArea" :true-value="true" :false-value="false"></Radio>
                <Radio label="否" v-model="column.isTextArea" :true-value="false" :false-value="true"></Radio>
            </FormItem>
            <FormItem label="类型" prop="title" v-if="column.format || column.isDatePicker">
                <Select v-model="column.dateType">
                    <Option  value="date">按日期选择</Option>
                    <Option  value="year">按年选择</Option>
                    <Option  value="month">按月选择</Option>
                </Select>
            </FormItem>
            <FormItem label="日期格式" prop="title" v-if="column.format || column.isDatePicker">
                <Input v-model="column.pattern" placeholder="yyyy-MM-dd HH:mm:ss"></Input>
            </FormItem>
            <FormItem label="正则表达式" prop="title" v-if="!column.format && !column.isDatePicker">
                <Input v-model="column.ruleValidate.regex.pattern"></Input>
            </FormItem>
            <FormItem label="提示语" prop="title"  v-if="!column.format && !column.isDatePicker">
                <Input v-model="column.ruleValidate.regex.message"></Input>
            </FormItem>
            <FormItem label="最大值" prop="title" v-if="(column.type === 'integer' || column.type === 'string') && !column.format && !column.isDatePicker">
                <Input v-model="column.ruleValidate.max.max"></Input>
            </FormItem>
            <FormItem label="最小值" prop="title" v-if="(column.type === 'integer' || column.type === 'string') && !column.format && !column.isDatePicker">
                <Input v-model="column.ruleValidate.min.min"></Input>
            </FormItem>
            <FormItem label="人员选择器" prop="title" v-if="!column.dictName && !column.format && !column.isTextArea && !column.isDatePicker">
                <CheckboxGroup v-model="column.personInput">
                    <Checkbox label="single"><span>单选</span></Checkbox>
                    <Checkbox label="person"><span>人员</span></Checkbox>
                    <Checkbox label="org"><span>组织</span></Checkbox>
                    <Checkbox v-if="showTeam" label="team"><span>群组</span></Checkbox>
                </CheckboxGroup>
            </FormItem>
            <FormItem label="附件id" v-if="(column.type === 'integer' || column.type === 'string') && !column.format && !column.isDatePicker">
                <Select v-model="column.fileId" clearable>
                    <Option v-for="item in columnList" :key="item.name" :value="item.name">{{item.name}}</Option>
                </Select>
            </FormItem>
            <FormItem label="字典" v-if="column.type === 'string'" >
                <Select v-model="column.dictName" clearable>
                    <Option v-for="item in dictstroage" :value="item.code" :key="item.id">{{item.name}}</Option>
                </Select>
            </FormItem>
        </Form>
    </div>
</template>
<script>
    import Util from '../../../libs/util';
    import { mapGetters } from 'vuex';
    export default {
        data() {
            return {
                showTeam: false
            };
        },
        created() {
            if (Util.personInput.props.team) {
                this.showTeam = true;
            }
            if (!this.column.dictName && !this.column.format && !this.column.isTextArea) {
                this.$set(this.column, 'isTextArea', false);
            } else if (this.column.dictName && !this.column.isRadio) {
                this.$set(this.column, 'isRadio', false);
            }
            this.initRule();
        },
        props: ['column', 'columnList'],
        components: {
        },
        watch:{
            column(){
                this.initRule();
            },
            'column.title':function () {
                if (this.column.ruleValidate.required) {
                    this.column.ruleValidate.required.message = this.column.title + '不能为空';
                }
                if (this.column.ruleValidate.max) {
                    this.column.ruleValidate.max.message = this.column.title + '长度不能大于' + (this.column.maxLength?this.column.maxLength:'');
                }
                if (this.column.ruleValidate.min) {
                    this.column.ruleValidate.min.message = this.column.title + '长度不能小于' + (this.column.minLength?this.column.minLength:'');
                }
            }
        },
        computed:{
            ...mapGetters([
                'dictstroage'
            ])
        },
        methods: {
            initRule(){
                if (!this.column.ruleValidate.regex && !this.column.format) {
                    this.$set(this.column.ruleValidate, 'regex', {
                        type: 'string', pattern: '', message: '', trigger: 'blur'
                    });
                }
                if ((this.column.type === 'integer' || this.column.type === 'string') && !this.column.ruleValidate.max && (!this.column.format || this.column.format === 'date-time')) {
                    this.$set(this.column.ruleValidate, 'max', {
                        type: 'string', max: this.column.maxLength?this.column.maxLength:'',message: this.column.title + '长度不能大于' + (this.column.maxLength?this.column.maxLength:''), trigger: 'blur'
                    });
                }
                if ((this.column.type === 'integer' || this.column.type === 'string') && !this.column.ruleValidate.min && (!this.column.format || this.column.format === 'date-time')) {
                    this.$set(this.column.ruleValidate, 'min', {
                        type: 'string', min: this.column.minLength?this.column.minLength:'',message: this.column.title + '长度不能小于' + (this.column.minLength?this.column.minLength:''), trigger: 'blur'
                    });
                }
            },
            saveRule(column){
                let triggerType = this.getTriggerType(column);
                if (column.required && !column.ruleValidate.required) {
                    column.ruleValidate.required = {required: true, message: column.title + '不能为空', type: (column.format && column.format === 'date-time')? 'date': 'string', trigger: triggerType};
                }
                if (column.ruleValidate.regex && column.ruleValidate.regex.pattern.length === 0) {
                    delete column.ruleValidate['regex'];
                }
                if (column.ruleValidate.max) {
                    if (column.ruleValidate.max.max === '') {
                        delete column.ruleValidate['max'];
                    } else {
                        column.ruleValidate.max.max = column.ruleValidate.max.max * 1;
                        column.ruleValidate.max.trigger = triggerType;
                    }
                }
                if (column.ruleValidate.min) {
                    if (column.ruleValidate.min.min === '') {
                        delete column.ruleValidate['min'];
                    } else {
                        column.ruleValidate.min.min = column.ruleValidate.min.min * 1;
                        column.ruleValidate.min.trigger = triggerType;
                    }
                }
            },
            getTriggerType(column){
                return  ((column.format && column.format === 'date-time') || (column.personInput && column.personInput.length > 0) || column.dictName || (column.fileId && column.fileId !== ''))? 'change': 'blur';
            },
            isPersonInput(column){
                if ((column.personInput && column.personInput.length === 0) || column.isTextArea ) {
                    delete column['personInput'];
                }
            }
        }
    };
</script>

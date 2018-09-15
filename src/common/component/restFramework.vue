<style lang="scss">
    .tab-frame-work{
        .ivu-tabs{
            .ivu-tabs-bar{
                margin: 16px 16px 0 16px;
            }
        }
    }

    .form-single {
        padding: 16px;
    }
</style>
<template>
    <div>
        <div v-if="formFlag" class="form-single">
            <form-single :config="config" :singleClass="singleClass"></form-single>
        </div>
        <div v-else>
            <div v-if="!relation">
                <table-show :config="config"></table-show>
            </div>
            <div v-else class="tab-frame-work">
                <Tabs type="card" :value="actTab">
                    <TabPane :label="config.configName" :name="config.configName">
                        <table-show :config="config" @oneToMany="openOneToMany"></table-show>
                    </TabPane>
                    <TabPane v-for="(tabConfig, index) in otherConfigs" :key="index" :label="tabConfig.configName" :closable="true" :name="tabConfig.configName">
                        <table-show :config="tabConfig"></table-show>
                    </TabPane>
                </Tabs>
            </div>
        </div>
    </div>
</template>
<script type="text/ecmascript-6">
    import FormSingle from './form-customer/form-single.vue';
    import TableShowExt from './table-customer/table-showExt.vue';
    export default {
        data(){
            return{
                otherConfigs: [],
                relation: false,
                actTab: '',
                formFlag: false
            };
        },
        props:{
            config: {
                type: Object
            },
            singleClass:{
                type: String,
                default: 'single'
            }
        },
        created() {
            if (this.config.tabConfigData && this.config.tabConfigData.tableColumns) {
                let tableColumns = this.config.tabConfigData.tableColumns;
                for (let col in tableColumns) {
                    if (tableColumns[col].tableConfig && tableColumns[col].relationType === 'one_to_many') {
                        this.relation = true;
                    }
                }
                this.actTab = this.config.configName;
            } else {
                this.formFlag = true;
            }
        },
        components: {
            'table-show': TableShowExt,
            'form-single': FormSingle
        },
        methods:{
            openOneToMany(config){
                this.otherConfigs.forEach((obj, index) => {
                    if (obj.configName === config.configName) {
                        this.otherConfigs.splice(index, 1);
                    }
                });
                this.actTab = this.config.configName;
                this.$nextTick(()=>{
                    this.otherConfigs.push(config);
                    this.actTab = config.configName;
                });
            }
        },
        watch: {
        }
    };
</script>
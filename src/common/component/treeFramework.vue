<template>
    <div style="padding: 16px">
        <div v-if="!relation">
            <tree-show-ext :config="config"></tree-show-ext>
        </div>
        <div v-else class="tab-frame-work">
            <tree-show-ext :config="config"  @oneToMany="openOneToMany" style="width: 30%"></tree-show-ext>
            <div  style="width: 70%; margin-left: 32px">
                <Tabs type="card" :value="actTab" v-if="otherConfigs.length > 0">
                    <TabPane v-for="(tabConfig, index) in otherConfigs" :key="index" :label="tabConfig.configName" :closable="false" :name="tabConfig.configName">
                        <table-show-ext :config="tabConfig"></table-show-ext>
                    </TabPane>
                </Tabs>
            </div>
        </div>
    </div>
</template>
<script>
    import TableShowExt from './table-customer/table-showExt.vue';
    import TreeShowExt from './tree-customer/tree-showExt';
    export default {
        data(){
            return {
                otherConfigs: [],
                relation: false,
                actTab: '',
            };
        },
        props:{
            config: {
                type: Object
            }
        },
        components:{
            TableShowExt,
            TreeShowExt
        },
        created(){
            if (this.config.tabConfigData && this.config.tabConfigData.tableColumns) {
                let tableColumns = this.config.tabConfigData.tableColumns;
                for (let col in tableColumns) {
                    if (tableColumns[col].tableConfig && tableColumns[col].relationType === 'one_to_many') {
                        this.relation = true;
                    }
                }
                // this.actTab = this.config.configName;
            }
        },
        methods:{
            openOneToMany(config){
                this.otherConfigs.forEach((obj, index) => {
                    if (obj.configName === config.configName) {
                        this.otherConfigs.splice(index, 1);
                    }
                });
                this.$nextTick(()=>{
                    this.otherConfigs.push(config);
                    this.actTab = config.configName;
                });
            }
        }
    };
</script>
<style scoped lang="scss">
    .tab-frame-work{
        display: flex;
        flex-direction: row;
        width: 100%;
    }
</style>
<template>
    <div style="padding: 16px">
        <div v-if="!relation">
            <tree-show-ext :config="config"></tree-show-ext>
        </div>
        <div v-else class="tree-frame-flex">
            <tree-show-ext :config="config"  @oneToMany="openOneToMany" style="width: 30%"></tree-show-ext>
            <div style="width: 70%; margin-left: 32px">
                <Tabs type="card" :value="actTab" v-if="otherConfigs.length > 0">
                    <TabPane v-for="(tabConfig, index) in otherConfigs" :key="index" :label="tabConfig.configName" :closable="false" :name="tabConfig.configName">
                        <rest-frame :config="tabConfig" singleClass="normal"></rest-frame>
                    </TabPane>
                </Tabs>
            </div>
        </div>
    </div>
</template>
<script>
    import TreeShowExt from './tree-customer/tree-showExt';
    import restFrame from './restFramework';
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
            restFrame,
            TreeShowExt
        },
        created(){
            if (this.config.tabConfigData && this.config.tabConfigData.tableColumns) {
                let tableColumns = this.config.tabConfigData.tableColumns;
                for (let col in tableColumns) {
                    if (tableColumns[col].tableConfig && tableColumns[col].relationType) {
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
                    this.actTab = this.otherConfigs[0].configName;
                });
            }
        }
    };
</script>
<style lang="scss" scoped>
    .tree-frame-flex{
        @include compatibleFlex;
        @include flex-direction(row);
    }
</style>
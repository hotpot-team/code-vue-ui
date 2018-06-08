<style lang="scss" scoped>
    .rest-config {
        padding: 16px;
    }
</style>
<template>
    <div class="rest-config">
        <Tabs type="card" v-model="currentTab">
            <TabPane :label="configMenuName" :name="configMenuName">
                <table-form-config v-if="showConfig" :config="config" :menuId="configMenuId" :schema="configMenuPath" :configMenuName="configMenuName" @saveConfig="saveConfig" @addRelationTab="addRelationTab" :showType="showType"></table-form-config>
            </TabPane>
            <TabPane v-if="relationTab.length > 0" :label="item.tabConfig.name+'配置'" v-for="(item, index) in relationTab" :key="index" :name="item.tabConfig.name" >
                <table-form-config :config="item.tabConfig.tableConfig" :menuId="configMenuId" :childSchemaData="item.schemaData" :configMenuName="item.tabConfig.name" :relationType="item.tabConfig.relationType" @saveChildConfig="saveChildConfig"></table-form-config>
            </TabPane>
        </Tabs>
    </div>
</template>
<script>
    import TableFormConfig from './restContentConfig.vue';
    import {mapGetters} from 'vuex';
    import Util from '../../../../libs/util'
    export default {
        data() {
            return {
                config: {}, //配置
                configMenuId: this.$route.query.menuId, // 菜单Id
                configMenuName: this.$route.query.menuName, // 菜单名称
                configMenuPath: this.$route.query.menuPath, // 菜单JsonSchema url ''
                showConfig: false, //同步控制
                relationTab: [], //关系配置
                tabNames: [], //tab统计 防止重复添加
                currentTab: this.$route.query.menuName,
                showType: this.$route.query.showType
            }
        },
        created: function () {
            this.$store.dispatch('getConfig', this.uiVersion).then(() => {
                this.config = this.uiConfigData[this.configMenuId];
                this.showConfig = true;
            });
        },
        components: {
            'table-form-config': TableFormConfig
        },
        computed: {
            ...mapGetters([
                'uiConfigData',
                'uiVersion'
            ])
        },
        mounted(){

        },
        watch: {
            '$route'(to) {
                this.configMenuId = to.query.menuId;
                this.configMenuName = to.query.menuName;
                this.configMenuPath = to.query.menuPath;
                this.currentTab = to.query.menuName;
                this.showConfig = false;
            },
            configMenuId: function (val, oldVal) {
                this.config = {};
                this.$nextTick(() => {
                    this.config = this.uiConfigData[val];
                    this.showConfig = true;
                });
            }
        },
        methods: {
            //保存配置
            saveConfig(config) {
                if (!this.config || !this.config.id) {
                    this.config = {};
                    this.config.id = this.configMenuId;
                    this.config.jsonSchemaUrl = this.configMenuPath;
                    this.config.configName = this.configMenuName;
                    this.config.pathmag = {};
                }
                config.pathmag = Object.assign({}, this.config.pathmag, config.pathmag);
                this.config = Object.assign({}, this.config, config);
                let data = {};
                for (let key in this.config) {
                    if (Util.serializable.indexOf(key) > -1) {
                        data[key] = JSON.stringify(this.config[key]);
                    } else {
                        data[key] = this.config[key];
                    }
                }
                this.$store.dispatch('saveConfig',  JSON.stringify(data)).then(() => {
                    this.$Message.success('数据保存成功!');
                });
            },
            saveChildConfig(data){
                if (this.config && this.config.tabConfigData && this.config.tabConfigData.tableColumns) {
                    if (this.config.tabConfigData.tableColumns[data.name]) {
                        data.tableConfig.pathmag = Object.assign({}, this.config.tabConfigData.tableColumns[data.name].tableConfig.pathmag, data.tableConfig.pathmag);
                        this.config.tabConfigData.tableColumns[data.name].tableConfig = Object.assign({},this.config.tabConfigData.tableColumns[data.name].tableConfig, JSON.parse(JSON.stringify(data.tableConfig)));
                    } else {
                        this.config.tabConfigData.tableColumns[data.name] = Object.assign({},this.config.tabConfigData.tableColumns[data.name], JSON.parse(JSON.stringify(data)));
                    }
                    let tempData = {};
                    for (let key in this.config) {
                        if (Util.serializable.indexOf(key) > -1) {
                            tempData[key] = JSON.stringify(this.config[key]);
                        } else {
                            tempData[key] = this.config[key];
                        }
                    }
                    this.$store.dispatch('saveConfig',  JSON.stringify(tempData)).then(() => {
                        this.$Message.success('数据保存成功!');
                    });
                } else {
                    this.$Message.error('必须配置主表数据!');
                }
            },
            //添加关联配置
            addRelationTab(data){
                if (this.tabNames.indexOf(data.tabConfig.name) > -1) {
                    this.currentTab = data.tabConfig.name;
                } else {
                    this.currentTab = data.tabConfig.name;
                    this.tabNames.push(data.tabConfig.name);
                    this.relationTab.push(data);
                }
            }
        }
    }
</script>

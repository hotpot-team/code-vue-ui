<template>
    <Tabs value="name1" v-if="(schemaData && schemaData.tableName) || (childSchemaData && childSchemaData.tableName)">
        <TabPane label="表格配置" name="name1" v-if="!relationType">
            <table-config :config="config" :schemaData="schemaData" :menuId="menuId" :configMenuName="configMenuName" @saveConfig="saveConfig" @addRelationTab="addRelationTab" :showType="showType"></table-config>
        </TabPane>
        <TabPane label="表单配置" name="name2" v-if="!relationType">
            <form-config :config="config" :schemaData="schemaData" :menuId="menuId" :configMenuName="configMenuName" @saveConfig="saveConfig" @addRelationTab="addRelationTab"></form-config>
        </TabPane>
        <TabPane label="表格配置" name="name1" v-if="relationType && relationType == 'one_to_many'">
            <table-config :config="config" :schemaData="childSchemaData" :menuId="menuId" :configMenuName="configMenuName" @saveConfig="saveChildConfig" :noBtn="true"></table-config>
        </TabPane>
        <TabPane label="表单配置" name="name2" v-if="relationType && relationType == 'one_to_many'">
            <form-config :config="config" :schemaData="childSchemaData" :menuId="menuId" :configMenuName="configMenuName" @saveConfig="saveChildConfig" :noBtn="true"></form-config>
        </TabPane>
        <TabPane label="表单配置" name="name1" v-if="relationType && relationType == 'one_to_one'">
            <form-config :config="config" :schemaData="childSchemaData" :menuId="menuId" :configMenuName="configMenuName" @saveConfig="saveChildConfig" :noBtn="true"></form-config>
        </TabPane>
    </Tabs>
</template>
<script>
    import TableConfig from '../../../../common/component/table-customer/table-customer.vue';
    import FormConfig from '../../../../common/component/form-customer/form-customer.vue';
    import Util from '../../../../libs/util';
    export default {
        data() {
            return {
                schemaData: {}
            };
        },
        created() {
            if (this.schema) {
                this.$http.get(Util.baseUrl + this.schema, {
                    headers: {Accept: 'application/schema+json'},
                }).then((res) => {
                    this.schemaData = res.data.jsonSchema;
                });
            }
        },
        props: ['config', 'schema', 'configMenuName', 'childSchemaData', 'relationType', 'menuId','showType'],
        components: {
            'table-config': TableConfig,
            'form-config': FormConfig
        },
        watch: {},
        methods: {
            saveConfig(config) {
                config.tableMappingName = this.schemaData.tableName;
                this.$emit('saveConfig', config);
            },
            saveChildConfig(config) {
                let data = JSON.parse(JSON.stringify(this.childSchemaData));
                data.tableConfig = config;
                data.tableConfig.configName = data.name;
                data.tableConfig.tableMappingName = data.tableName;
                delete data['crudmappings'];
                this.$emit('saveChildConfig',data);
            },
            addRelationTab(row, schemaData){
                this.$emit('addRelationTab',{
                    tabConfig: row,
                    schemaData: schemaData
                });
            }
        }
    };
</script>

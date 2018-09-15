<template>
    <component :is="componentName"
               :showConfig="configs.config || {}"
               :config="configs.config || {}"
               :parent_src="configs.src || ''"
               :id="configs.compName || ''">
    </component>
</template>
<script>
    import RestFramework from '../restFramework.vue';
    import ExpertTable from '../../../views/content/common/expertTable.vue';
    import IFrame from '../../../views/content/common/iframe.vue';
    import TreeFramework from '../treeFramework';
    export default {
        props: {
            configs: [String, Object],
            componetType: Number
        },
        data: function () {
            return {

            };
        },
        components: {
            'rest-framework': RestFramework,
            'expert-table':ExpertTable,
            'i-frame': IFrame,
            'tree-framework': TreeFramework
        },
        methods: {},
        created: function () {
        },
        computed: {
            componentName: function () {
                if (this.componetType === 1) {
                    return 'expert-table';
                } else if (this.componetType === 2) {
                    return 'rest-framework';
                } else if (this.componetType === 3) {
                    return 'i-frame';
                } else if (this.componetType === 4){
                    return 'tree-framework';
                } else {
                    return 'div';
                }
            }
        }
    };
</script>
<style>

</style>
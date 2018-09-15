<template>
    <component :is="componentName" :config="config" :childrenConfig="childrenConfig" :titles="titles"></component>
</template>
<script>
    import Row from './row.vue';
    import Column from './column.vue';
    import Tab from './tab.vue';
    import Drag from './Drag.vue';
    export default {
        props: ['config','childrenConfig', 'titles'],
        data() {
            return {
            };
        },
        components: {
            'row': Row,
            'column': Column,
            'tab': Tab,
            'drag':Drag,
        },
        methods: {},
        created: function () {
            this.componentName = this.config.type;
        }
    };
</script>
<style>

</style>
<style lang="scss" scoped>
</style>
<template>
    <Tabs>
        <TabPane :label="titles[index]" :name="item.id" v-for="(item, index) in childrenConfig" :key="index">
            <component-select :configs="item" :componetType="item.componentType"></component-select>
        </TabPane>
    </Tabs>
</template>
<script>
    import ComponentSelect from './componetSelect.vue';
    export default {
        props: ['config','childrenConfig', 'titles'],
        data: function () {
            return {

            };
        },
        components: {
            'component-select': ComponentSelect
        },
        methods: {},
        created: function () {
        }
    };
</script>
<style>

</style>
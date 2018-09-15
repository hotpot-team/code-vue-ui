<style lang="scss" scoped>
    .panel-column{
        @include compatibleFlex;
        @include flex-direction(column);
        flex-wrap: wrap;
        -ms-flex-wrap: wrap;
    }
</style>
<template>
    <div class="panel-column">
        <div v-for="item in childrenConfig">
            <component-select :configs="item" :componetType="item.componentType"></component-select>
        </div>
    </div>
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
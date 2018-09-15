<style lang="scss" scoped>
    .list-transition-group{
        @include compatibleFlex;
        @include flex-direction(column);
        .list-row{
            @include compatibleFlex;
            @include flex-direction('row-reverse');
            flex-wrap: nowrap;
            -ms-flex-wrap: nowrap;
            &>div{
                flex-grow: 1;
            }
        }
    }
</style>
<template>
    <div class="list-transition-group">
        <div v-for="(item,index) in config.draggableDate" :key="index" class="list-row">
            <div v-for="(dragitem,dragindex) in item.divConfig" :key="dragindex">
                <component-select :configs="mapConfig[dragitem]" :componetType="mapConfig[dragitem].componentType"></component-select>
            </div>
        </div>
    </div>
</template>
<script>
    import ComponentSelect from './componetSelect.vue';
    export default {
        props: ['config','childrenConfig', 'titles'],
        data: function () {
            return {
                mapConfig:{}
            };
        },
        components: {
            'component-select': ComponentSelect
        },
        methods: {
        },
        created: function () {
            this.childrenConfig.forEach((item) => {
                this.$set(this.mapConfig, item.config.id, item);
            });
        }
    };
</script>
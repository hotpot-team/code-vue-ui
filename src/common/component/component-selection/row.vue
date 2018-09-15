<style lang="scss" scoped>
    .panel-row{
        @include compatibleFlex;
        @include flex-direction(row);
        flex-wrap: wrap;
        -ms-flex-wrap: wrap;
    }
</style>
<template>
    <div class="panel-row">
        <div v-for="item in childrenConfig" :style="columnWidth">
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
            if (this.config.width && this.config.width !== '') {
                this.columnWidth = 'width: '+ this.config.width;
            } else {
                this.columnWidth = 'width: 50%';
            }
        }
    };
</script>
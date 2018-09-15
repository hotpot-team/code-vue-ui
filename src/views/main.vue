<style lang="scss" scoped>
    .main{
        @include compatibleFlex;
        height: 100%;
        width: 100%;
        overflow: hidden;
        .right{
            width: calc(100% - 240px);
            overflow: auto;
            .top{
                height: 50px;
            }
        }
    }
</style>
<template>
    <div class="main">
        <left-menu></left-menu>
        <div class="right">
            <layout-top class="top"></layout-top>
            <layout-content></layout-content>
        </div>
    </div>
</template>
<script>
    import LayoutContent from './layout/content.vue';
    import LayoutTop from './layout/top.vue';
    import LeftMenu from './layout/menu.vue';
    export default {
        data(){
            return {

            };
        },
        components:{
            LayoutContent,LayoutTop,LeftMenu
        }
    };
</script>
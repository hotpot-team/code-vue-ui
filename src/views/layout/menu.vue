<style scoped lang="scss">
    .left-menu{
        height: 100%;
        background: #495060;
        width: 240px;
        overflow: hidden;
        .logo{
            color: #dddee1;
            font-size: 26px;
            padding: 16px 0;
            img{
                width: 30px;
                height: 30px;
                vertical-align: text-bottom;
                margin-left: 16px;
            }
        }
        .hide-scroll {
            overflow-y: auto;
            height: calc(100% - 71px);
            padding-right: 20px;
            width: 260px;
        }
    }
</style>
<template>
    <div class="left-menu">
        <div class="logo"><img src="../../assets/images/icon.png"/><span style="margin-left: 8px">{{title}}</span></div>
        <div class="hide-scroll">
            <MenuTree v-if="menus && menus.length > 0 && currentMenu && currentMenu.id != ''" :data="menus"></MenuTree>
        </div>
    </div>
</template>
<script type="text/ecmascript-6">
    import { mapGetters } from 'vuex';
    import MenuTree from '../../common/component/menu/menu-tree';
    import Util from '../../libs/util'
    export default {
        data(){
            return {
                title: Util.appName
            }
        },
        created(){
        },
        computed: {
            ...mapGetters([
                'currentMenu',
                'menus'
            ])
        },
        components:{
            MenuTree
        },
        methods:{
        }
    };
</script>
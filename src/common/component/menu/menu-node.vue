<style lang="scss" scoped>
    .menu-title{
        padding: 14px 24px;
        position: relative;
        cursor: pointer;
        z-index: 1;
        transition: all .2s ease-in-out;
        color: hsla(0,0%,100%,.7);

        &:hover{
            color: #fff;
        }

        &.active{
            color: #fff;
            background-color: #2d8cf0;
        }

        .menu-icon{
            font-size: 18px;
            vertical-align: text-bottom;
            margin-right: 5px;
        }

        .fade-enter-active, .fade-leave-active {
            transition: opacity .8s
        }
        .fade-enter, .fade-leave-to /* .fade-leave-active in below version 2.1.8 */ {
            opacity: 0;
        }

    }
</style>
<template>

    <li class="ivu-menu-submenu">
        <div :class="currentMenu != null &&currentMenu.id == node.id? 'menu-title active' : 'menu-title'" @click="menuClick(node)"><span :style="node.image1Id?'':'padding-left:18px'"><Icon class="menu-icon" v-if="node.image1Id" :type="node.image1Id"></Icon>{{node.functionName}}</span>
            <i v-if="hasChildren" :class="open?'ivu-icon ivu-menu-submenu-title-icon ivu-icon-arrow-down-b':'ivu-icon ivu-menu-submenu-title-icon ivu-icon-arrow-right-b'"></i>
        </div>
        <transition-group name="fade">
            <ul class="ivu-menu" v-if="node.children != null && node.children.length>0 && open" v-for="menu in node.children"  :key="menu.functionName"  style="background-color: #363e4f;">
                <MenuNode :node="menu" v-if="menu.isMenu == 'Y'"></MenuNode>
            </ul>
        </transition-group>
    </li>

</template>
<script>
    import { mapGetters,mapMutations } from 'vuex'
    export default {
        name: 'MenuNode',
        components: {},
        props:{
            node: {
                type: Object
            }
        },
        data(){
            return {
                hasChildren: false,
                open: false,
                Modals:false,
                specialList:['common/restShow.vue', 'common/expertTable.vue', 'common/framework.vue', 'common/treeShow.vue']
            }
        },
        computed: {
             ...mapGetters([
                'currentMenu'
            ]),
        },
        created(){
            //判断是否有子菜单
            this.$nextTick(()=>{
                if (this.node.children && this.node.children.length > 0) {
                    this.node.children.forEach((child, index)=>{
                        if (child.isMenu === 'Y') {
                            this.hasChildren = true;
                        }
                    });
                }
                this.menuOpen(this.node);
                if (this.currentMenu && this.currentMenu.url && this.currentMenu.url !=='') {
                    let urlConfig = JSON.parse(this.currentMenu.url);
                    if (this.$route.path === '/main' || this.$route.path === '/main/') {
                        let query = {};
                        if (this.specialList.indexOf(urlConfig.component) > -1) {
                            query = {
                                menuId : this.currentMenu.id
                            }
                        }
                        this.$router.push({path: '/main'+urlConfig.path, query: query});
                    }
                }
            });
        },
        methods:{
            ...mapMutations({
                showModal:'SHOWMODAL'
            }),
            menuClick(node){
                this.open = this.open ? false: true;
                if (node.url && node.url !== '') {
                    let urlConfig = JSON.parse(node.url);
                    if (urlConfig.type === 'iframe') {
                        this.$router.push({
                            path: '/main'+urlConfig.path,
                            query: {
                                src: urlConfig.url
                            }
                        });
                    } else {
                        let query = {};
                        if (this.specialList.indexOf(urlConfig.component) > -1) {
                            query = {
                                menuId : node.id
                            }
                        }
                        if(urlConfig.openMethod === 'default'){
                            this.$router.push({path: '/main'+urlConfig.path, query: query});
                        }else if(urlConfig.openMethod === 'modal'){
                            this.$router.push({path: '/main'+urlConfig.path, query: query});
                            this.showModal();
                        }else if(urlConfig.openMethod === 'pop'){
                            window.open('/main'+ urlConfig.path);
                        }
                    }
                }
            },
            menuOpen(node){
                if (node.children && node.children.length>0) {
                    for (let i=0; i < node.children.length && !this.open; i++) {
                        if (node.children[i].id === this.currentMenu.id) {
                            this.open= true;
                            break;
                        } else if (node.children[i].children && node.children[i].children.length>0) {
                            this.menuOpen(node.children[i]);
                        }
                    }
                }
            }
        }
    };
</script>

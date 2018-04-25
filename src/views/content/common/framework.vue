<style lang="scss">
    .panel-group{
        padding: 16px;
    }
</style>
<template>
    <div v-if="config" class="panel-group">
        <frame-layout :config="config" :childrenConfig="childrenConfig" :titles="titles"></frame-layout>
    </div>
</template>
<script>
    import { mapState, mapGetters } from 'vuex';
    import FrameLayout from '../../../common/component/component-selection/frame-layout.vue';
    import Vue from 'vue';
    export default {
        data(){
            return{
                configMenuId: this.$route.query.menuId, // 菜单id
                config: null,
                childrenConfig:[],
                titles:[],
            };
        },
        created() {
            this.configMenuId = this.configMenuId?this.configMenuId: this.menuId;
            this.$store.dispatch('getConfig', this.uiVersion).then(()=>{

                this.config = this.uiConfigData[this.configMenuId];
                let menu = this.getMenuById(this.configMenuId);
                if (menu.children.length > 0) {
                    menu.children.forEach((p)=>{
                        this.titles.push(p.functionName);
                        let componentName = JSON.parse(p.url).component;
                        if (componentName === 'common/expertTable.vue') {
                            let obj = {};
                            obj.config = Object.assign({},this.uiConfigData[p.id]);
                            obj.componentType = 1;
                            this.childrenConfig.push(obj);
                        } else if (componentName === 'common/restShow.vue') {
                            let obj = {};
                            obj.config = Object.assign({},this.uiConfigData[p.id]);
                            obj.componentType = 2;
                            this.childrenConfig.push(obj);
                        } else if (componentName === 'common/iframe.vue') {
                            let obj = JSON.parse(p.url);
                            obj.componentType = 3;
                            this.childrenConfig.push(obj)
                        } else {
                            let obj = JSON.parse(p.url);
                            let compName = obj.component.replace('.vue','');
                            obj.compName = compName;
                            obj.componentType = 4;
                            this.childrenConfig.push(obj);
                        }
                    });
                }
            });
        },
        updated(){
            if (this.childrenConfig.length > 0) {
                this.childrenConfig.forEach((p)=>{
                    if (p.compName && document.getElementById(p.compName)) {
                        let a = Vue.extend(require	('../' + p.component).default);
                        new a().$mount('#' + p.compName);
                    }
                });
            }
        },
        computed: {
            ...mapGetters([
                'uiConfigData',
                'uiVersion',
                'currentMenu',
                'getMenuById'
            ])
        },
        components: {
            'frame-layout': FrameLayout
        },
        methods:{
        },
        watch: {
            '$route' (to) {
                this.configMenuId = to.query.menuId;
            },
            configMenuId: function(val, oldVal){
                this.config = null;
                this.$nextTick(()=>{
                    this.config = this.uiConfigData[val];
                });
            }
        }
    };
</script>
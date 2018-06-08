<template>
    <tree-framework v-if="config" :config="config"></tree-framework>
</template>
<script>
    import TreeFramework from '../../../common/component/treeFramework.vue'
    import { mapState, mapGetters } from 'vuex';
    export default {
        data() {
            return {
                openTableName:'', // 初始化table名称
                configMenuId: this.$route.query.menuId, // 菜单id
                config: null,
            }
        },
        props:["menuId"],
        created(){
            this.configMenuId = this.configMenuId?this.configMenuId: this.menuId;
            this.$store.dispatch('getConfig', this.uiVersion).then(()=>{
                this.config = this.uiConfigData[this.configMenuId];
            });
        },
        components: {
            TreeFramework
        },
        computed: {
            ...mapGetters([
                'uiConfigData',
                'uiVersion'
            ])
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
        },
        methods: {
        }
    };
</script>
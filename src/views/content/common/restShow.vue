<style lang="scss" scoped>
</style>
<template>
    <div>
        <rest-framework v-if="config" :config="config"></rest-framework>
    </div>
</template>
<script type="text/ecmascript-6">
    import RestFramework from '../../../common/component/restFramework.vue'
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
            'rest-framework': RestFramework
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
    }
</script>

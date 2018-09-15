<style scoped lang="scss">
    .layout-content{
        margin: 16px;
        box-shadow: 0 2px 22px 0 rgba(192,204,221,0.80);
        border-radius: 2px;
        border: none;
        min-height: 800px;
        position: relative;
        .content-title{
            font-size: 16px;
            padding: 16px;
            border-bottom: 1px solid #e9eaec;
            @include flex-justify;
            @include compatibleFlex;
            span{
                line-height: 32px;
            }
        }
    }
</style>
<template>
    <div>
        <Modal v-model="modalShow"
        width="1000"
        :closable="false"
        :mask-closable="false">
        <p slot="header" class="title">
        <span>{{currentMenu.functionName}}</span>
            <Button type="dashed" style="border: none;float: right" @click="setmodals" title="关闭">
                <Icon type="close" size="12"></Icon>
            </Button>
        </p>
        <div>
        <router-view name="modalshows"></router-view>
        </div>
        <div slot="footer">
        <i-button @click="setmodals">关闭</i-button>
        </div>
        </Modal>
        <div class="layout-content">
            <div class="content-title">
                <span v-if="currentMenu != null">{{currentMenu.functionName}}</span>
                <Button v-if="titleBread.length > 2" @click="goBack">返回</Button>
            </div>
            <router-view name="general"></router-view>
        </div>
    </div>
</template>
<script type="text/ecmascript-6">
    import { mapGetters,mapMutations,mapState } from 'vuex'
    export default {
        data(){
            return {
                Modals:false
            }
        },
        computed: {
            ...mapState({
                modalShow: ({ loginStore }) => loginStore.modalShow
            }),
            ...mapGetters([
                'currentMenu',
                'titleBread'
            ]),
        },
        created(){
        },
        watch:{
        },
        methods:{
            ...mapMutations({
                hidemodal: 'HIDEMODAL'
            }),
            setmodals(){
                this.hidemodal();
            },
            goBack(){
                this.$router.go(-1);
            }
        }
    };
</script>
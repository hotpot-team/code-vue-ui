<style scoped lang="scss">
    .affix{
        @include compatibleFlex;
        @include flex-justify;
        padding: 14px 16px;
        border-bottom: 1px solid #e9eaec;
        box-sizing: border-box;
        .isPointer {
            cursor: pointer;
        }
        vertical-align: middle;
    }
</style>
<template>
    <div class="affix">
        <Breadcrumb>
            <BreadcrumbItem v-for="(item, index) in titleBread" :key="index"><span @click="goBack(item,index)" :class="item.isClick? 'isPointer': ''">{{item.name}}</span></BreadcrumbItem>
        </Breadcrumb>
        <Dropdown @on-click="topClick" placement="bottom-end" style="height: 30px">
            <a href="javascript:void(0)" style="height: 30px">
                {{loginInfo.name}}
                <Icon type="arrow-down-b"></Icon>
            </a>
            <DropdownMenu slot="list">
                <DropdownItem name="info" v-if="showInfo">个人信息</DropdownItem>
                <DropdownItem name="logout">注销</DropdownItem>
            </DropdownMenu>
        </Dropdown>
    </div>
</template>
<script>
    import { mapState, mapMutations, mapGetters } from 'vuex';
    import VueRouter from 'vue-router';
    import Util from '../../libs/util'
    export default {
        data(){
            return {
                showInfo: false
            }
        },
        computed: ({
            ...mapState({
                loginInfo: ({ loginStore }) => loginStore.loginInfo
            }),
            ...mapGetters([
                'titleBread'
            ])
        }),
        created(){
            let arr = this.$store.getters.menuArray;
            for (let i = 0; i < arr.length; i++ ) {
                let menu = arr[i];
                if (menu.url && menu.url !== '') {
                    let config = JSON.parse(menu.url);
                    if (config.component === 'common/personSet.vue') {
                        this.showInfo = true;
                        break;
                    }
                }
            }
        },
        methods:{
            ...mapMutations({
                changeLoginInfo: 'CHANGELOGININFO'
            }),
            topClick(name) {
                if (name === 'logout') {
                    this.$http.get('/logout').then((response)=>{
                        this.$store.commit('CLEAR_CONFIG');
                        window.localStorage.removeItem('loginInfo');
                        this.$store.commit('CLEAR_MENU');
                        this.$store.dispatch('clearLogin').then(()=>{
                            this.$router.push({path: Util.indexUrl});
                        });
                    }).catch(function (e) {
                        window.localStorage.removeItem('loginInfo');
                        window.location.href = "/";
                    });
                } else if (name === 'info') {
                    this.$router.push({path: '/main/p/setting'})
                }
            },
            goBack(item, n) {
                if (item.isClick) {
                    this.$router.go(n - this.titleBread.length + 1);
                }
            }
        }
    };
</script>
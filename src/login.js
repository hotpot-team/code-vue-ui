import stores from './store';
import Util from './libs/util';

let loginInit = {};
loginInit.login = function(router){
    router.onReady(()=>{
        let token = '';
        if(window.localStorage.loginInfo && JSON.parse(window.localStorage.loginInfo)){ //从localstorage中取出用户信息
            stores.commit('CHANGELOGININFO',JSON.parse(window.localStorage.loginInfo));
            token = stores.state.loginStore.loginInfo.authToken;
        }
        if(token !== '' && window.location.pathname !== Util.indexUrl){
            //获取目录
            let config = {
                router: router,
                token: token
            };
            stores.commit('MENU_LIST', config);
        }else{
            if (window.location.pathname === Util.indexUrl){ //访问为登录路径时，直接返回
                window.localStorage.removeItem('loginInfo');
                return;
            } else {
                window.localStorage.removeItem('loginInfo');
                router.push({path: Util.indexUrl,  query: {redirect: encodeURIComponent(router.currentRoute.fullPath)}});
            }
        }
    });

    //请求前
    Util.ajax.interceptors.request.use(function(config){
        if (stores.state.loginStore.loginInfo.authToken !== '') {
            config.headers.AUTH_TOKEN = `${stores.state.loginStore.loginInfo.authToken}`;
            config.headers.CURRENT_USER = `${stores.state.loginStore.loginInfo.loginId}`;
        }
        return config;
    },function(err){
        return Promise.reject(err);
    });

    //请求后
    Util.ajax.interceptors.response.use(function(response){
        //提示请求成功
        return response;
    },function(err){
        if(err.response && err.response.status == 401){
            stores.commit('CHANGELOGININFO',{});
            window.localStorage.removeItem('loginInfo');
            if (router.currentRoute.path !== Util.indexUrl) {
                router.replace({
                    path: Util.indexUrl,
                    query: {redirect: encodeURIComponent(router.currentRoute.fullPath)}
                });
            }
        }
        return Promise.reject(err);
    });
};


function getQueryString(name) {
    let reg = new RegExp('(^|&)'+ name +'=([^&]*)(&|$)');
    let r = window.location.search.substr(1).match(reg);
    if(r !=null) {
        return  decodeURIComponent(r[2]);
    }
    return null;
}

export default loginInit;


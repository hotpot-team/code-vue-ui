import * as types from '../mutation-types';
import Util from '../../libs/util';
import CustomRouter from '../../routers/customRouter';
import TreeUtil from '../../treeUtil';

const state = {
    currentMenu: {},
    menus:[],
    breadCrumbList:[],
    titleBread:[]
};

// getters
const getters = {
    currentMenu: state => state.currentMenu,
    menus: state=> state.menus,
    breadCrumbList: state=> state.breadCrumbList,
    titleBread: state=> state.titleBread,
    menuIdList: state=> {
        let arr =  TreeUtil.transformToArrayFormat(state.menus);
        return arr.map((item)=>{return item.id});
    },
    menuArray: state=> {
        return TreeUtil.transformToArrayFormat(state.menus);
    },
    getMenuById: (state) => (id) => {
        let arr = TreeUtil.transformToArrayFormat(state.menus);
        let result;
        arr.forEach((item)=>{
           if (item.id === id) {
               result = item;
           }
        });
        return result;
    }
};

const actions = {
    clickMenu({commit, state}, currentMenu) {
        commit(types.MENU_CLICK, currentMenu);
    },
    getMenus({commit, state}, config) {
        commit(types.MENU_LIST, config);
    },
    clearMenu({commit, state}){

    },
};

// mutations
const mutations = {
    [types.MENU_CLICK] (state, currentMenu) {
        state.currentMenu = currentMenu;
    },
    //构建面包屑
    [types.CREATE_BREAD_CRUMB] (state, route) {
        if (state.menus.length > 0) {
            let newBreadList = [];
            let current = findMenu(state.menus, newBreadList, route.path);
            if (newBreadList.length === 0) {
                let list = state.breadCrumbList.filter((r)=>{
                    return route.path.indexOf(r.path) > -1;
                });
                list.map((item)=>{
                    item.path = item.path.indexOf('/main') === 0? item.path: (item.path.indexOf('/') === 0? '/main' + item.path: '/main/'+item.path);
                    return item;
                });
                list.sort((a, b)=>{
                    return b.path.length > a.path.length;
                });
                for (let i=0; i < list.length; i++) {
                    let r_menu = findMenu(state.menus, newBreadList, list[i].path);
                    if (newBreadList.length > 0) {
                        break;
                    }
                }
                newBreadList.reverse().push({
                    name: route.meta.title
                });
                if (newBreadList.length > 2) {
                    newBreadList[newBreadList.length - 2].isClick = true;
                }
                state.titleBread = newBreadList;
                state.currentMenu = {
                    functionName: route.meta.title,
                    id: ''
                };
            } else {
                state.titleBread = newBreadList.reverse();
                state.currentMenu = current;
            }
        }
    },
    [types.MENU_LIST] (state, config) {
        //从后台获取所有menu
        let router = config.router;
        let token = config.token;
        Util.ajax.get('/security/functions/').then((response)=>{
            if (response.status == 200) {
                if (response.data.length === 0) {
                    window.localStorage.removeItem('loginInfo');
                    router.push({name: 'login', query: {error:'noRole'}});
                }
                let children = [];
                state.menus = TreeUtil.transformToTreeFormat(response.data);

                let currentMenu = [];
                menuPush(state.menus, children, currentMenu, router.currentRoute);
                children = children.concat(CustomRouter);
                state.breadCrumbList = children;
                let routers = [{
                    path: '/main',
                    component: (resolve) => require(['../../views/main.vue'], resolve),
                    children: children
                },{
                    path: '/*',
                    name: 'error-404',
                    meta:{
                        title: '404-页面不存在'
                    },
                    component: (resolve) => require(['../../views/error/404.vue'], resolve)
                }];
                router.addRoutes(routers);
                state.currentMenu = currentMenu[0];
            } else {
                router.push({path: Util.indexUrl});
            }
        });
    },
    [types.CLEAR_MENU](state){
        state.currentMenu = {};
        state.menus = [];
        state.breadCrumbList = [];
        state.titleBread = [];
    }
};

function findMenu(menus, temp, path){
    for (let i = 0; i < menus.length; i++) {
        if (menus[i].url != null && menus[i].url != '') {
            let urlConfig = JSON.parse(menus[i].url);
            if ('/main' + urlConfig.path == path) {
                temp.push({
                    name: menus[i].functionName,
                    isClick: false
                });
                return menus[i];
            }
        }
        if (menus[i].children != null && menus[i].children.length > 0) {
            let m = findMenu(menus[i].children, temp, path);
            if(m != null){
                temp.push({
                    name: menus[i].functionName,
                    isClick: (menus[i].url != null && menus[i].url != '')
                });
                return m;
            }
        }
    }
    return null;
}
function menuPush(menus, children, currentMenu, currentRoute) {
    for (let i = 0; i < menus.length; i++) {
        if (menus[i].url != null && menus[i].url != '') {
            if (currentMenu.length == 0) {
                currentMenu.push(menus[i]);
            }
            let urlConfig;
            urlConfig = JSON.parse(menus[i].url);
            if (currentRoute.path === '/main' + urlConfig.path) {
                currentMenu.splice(0,1, menus[i]);
            }
            let r = {
                path: '/main' + urlConfig.path,
                meta: {title: menus[i].functionName},
                children: [],
                components: {}
            };
            if(urlConfig.openMethod === 'modal'){
                r.components = {
                    modalshows : () => import('../../views/content/' + urlConfig.component)
                };
            }else{
                r.components = {
                    general : () => import('../../views/content/' + urlConfig.component)
                };
            }
            children.push(r);
        }
        if (menus[i].children != null &&  menus[i].children.length > 0) {
            menuPush(menus[i].children, children, currentMenu, currentRoute);
        }
    }
}



export default {
    state,
    getters,
    actions,
    mutations
};

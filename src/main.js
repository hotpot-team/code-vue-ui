import Vue from 'vue';
import iView from 'iview';
import VueRouter from 'vue-router';
import Routers from './routers/router';
import Util from './libs/util';
import Vuex from 'vuex';
import App from './app.vue';
import 'iview/dist/styles/iview.css';
import 'element-ui/lib/theme-chalk/index.css';
import store from './store';
import loginInit from './login';
import RoleButton from './common/component/role-button/role-button.vue';
import VCharts from 'v-charts';

import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import 'bpmn-js-properties-panel/dist/assets/bpmn-js-properties-panel.css';

import { Tree } from 'element-ui';
import { Loading } from 'element-ui';
import vuedraggable from 'vuedraggable';

const RouterConfig = {
    mode: 'history',
    routes: Routers
};
Vue.prototype.$http = Util.ajax;

Date.prototype.dateFormat = function (fmt) {
    let o = {
        'M+': this.getMonth() + 1, //月份
        'd+': this.getDate(), //日
        'H+': this.getHours(), //小时
        'h+': this.getHours(), //小时
        'm+': this.getMinutes(), //分
        's+': this.getSeconds(), //秒
        'q+': Math.floor((this.getMonth() + 3) / 3), //季度
        'S': this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
    for (let k in o)
        if (new RegExp('(' + k + ')').test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
    return fmt;
};

if (window.navigator.userAgent.indexOf('MSIE')>=1 && window.HTMLElement) {
    if (Object.getOwnPropertyNames(HTMLElement.prototype).indexOf('dataset') === -1) {
        Object.defineProperty(HTMLElement.prototype, 'dataset', {
            get: function() {
                let attributes = this.attributes;
                let name = [],
                    value = [];
                let obj = {};
                for (let i = 0; i < attributes.length; i++) {
                    if (attributes[i].nodeName.slice(0, 5) == 'data-') {
                        name.push(attributes[i].nodeName.slice(5));
                        value.push(attributes[i].nodeValue);
                    }
                }
                for (let j = 0; j < name.length; j++) {
                    obj[name[j]] = value[j];
                }
                return obj;
            }
        });
    }
}

const router = new VueRouter(RouterConfig);
router.beforeEach((to, from, next) => {
    iView.LoadingBar.start();
    Util.title(to.meta.title);
    //判断token
    store.commit('CREATE_BREAD_CRUMB', to);
    store.dispatch('updateDict');
    next();
});

router.afterEach(() => {
    iView.LoadingBar.finish();
    window.scrollTo(0, 0);
});
loginInit.login(router);

Vue.use(VueRouter);
Vue.use(Vuex);
Vue.use(iView);
Vue.use(Tree);
Vue.use(Loading);
Vue.use(VCharts);

Vue.component('PersonInput',Util.personInput);
Vue.component('RoleButton', RoleButton);
Vue.component('draggable', vuedraggable);

let v = new Vue({
    el: '#app',
    router: router,
    store: store,
    render: h => h(App)
});

export default v;
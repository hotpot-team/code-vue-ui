import Vue from 'vue';
import Vuex from 'vuex';
import menus from './modules/menus';
import loginStore from './modules/loginStore';
import ui from './modules/uiConfig';
import dict from './modules/dict';

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        menus,
        loginStore,
        ui,
        dict
    }
});

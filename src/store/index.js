import Vue from 'vue';
import Vuex from 'vuex';
import menus from './modules/menus';
import loginStore from './modules/loginStore';
import ui from './modules/uiConfig';
import dict from './modules/dict';
import fileServer from '../libs/fileServer/fileServer';
import sbaServer from '../libs/springbootadmin/sbaServer';

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        menus,
        loginStore,
        ui,
        dict,
        fileServer,
        sbaServer
    }
});

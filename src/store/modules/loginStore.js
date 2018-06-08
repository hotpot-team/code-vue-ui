import Util from '../../libs/util';
import * as types from '../mutation-types';
const LOGINSTATUS = 'LOGINSTATUS';
const CHANGELOGININFO = 'CHANGELOGININFO';
const SHOWMODAL = 'SHOWMODAL';
const HIDEMODAL = 'HIDEMODAL';
const state = {
    loginStatus: false,
    modalShow:false,
    loginInfo: {
        authToken: '',
        name: '',
        loginId: '',
        organizationId: '',
        departmentId: ''
    }
};
const mutations = {
    [SHOWMODAL](state){
        state.modalShow = true;
    },
    [HIDEMODAL](state){
        state.modalShow = false;
    },
    [LOGINSTATUS](state, status) {
        state.loginStatus = status;
    },
    [CHANGELOGININFO](state, data) {
        state.loginInfo = data;
    },
    [types.CLEAR_LOGIN](state){
        state.loginStatus = false;
        state.modalShow = false;
        state.loginInfo = {
            authToken: '',
            name: '',
            loginId: '',
            organizationId: '',
            departmentId: ''
        };
    }
};

const getters = {
    loginInfo: state => state.loginInfo
};

const actions = {
    goLogin({ commit }, data) {
        Util.ajax.post('/login', data).then((response) => {
            commit(LOGINSTATUS, true);
            let info = response.data.data;
            info = Object.assign({}, info, {
                authToken:  response.headers.auth_token
            });
            window.localStorage.loginInfo = JSON.stringify(info);
            commit(CHANGELOGININFO, info);
        }).catch(function() {});
    },
    clearLogin({commit}){
        commit(types.CLEAR_LOGIN);
    }
};

export default {
    state,
    getters,
    actions,
    mutations
};

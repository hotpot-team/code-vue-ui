import * as types from '../mutation-types';
import Util from '../../libs/util';

const state = {
    dictstroage: [],
    dictVersion: 1111111111
};

// getters
const getters = {
};

const actions = {
    updateDict({state, commit, rootState}, info) {
        let headers;
        if (rootState.loginStore.loginInfo) {
            headers = Object.assign({}, headers, {
                AUTH_TOKEN: rootState.loginStore.loginInfo.authToken,
                CURRENT_USER: rootState.loginStore.loginInfo.loginId
            });
        } else if (info) {
            headers = Object.assign({}, headers, {
                AUTH_TOKEN: info.token,
                CURRENT_USER: info.loginId
            });
        }
        if (headers.AUTH_TOKEN) {
            Util.ajax({
                method:'POST',
                url: Util.url + '/api/dict/dict_type/dict_values/all?version=' + state.dictVersion,
                headers: headers
            }).then((res)=>{
                if(res.data.isUpdate === '1' || !window.localStorage.dictstroage){
                    localStorage.removeItem('dictstroage');
                    state.dictstroage=res.data.dictTypeAndValue;
                    localStorage.setItem('dictstroage',JSON.stringify(res.data.dictTypeAndValue));
                    state.dictVersion=res.data.version;
                }
            });
        }
    },
    clearDict({commit, state}){
        commit(types.CLEAR_DICT);
    }
};

// mutations
const mutations = {
    [types.UPDATE_DICT] (state, info) {
        let headers;
        if (state.loginInfo) {
            headers = Object.assign({}, headers, {
                AUTH_TOKEN: state.loginInfo.authToken,
                CURRENT_USER: state.loginInfo.loginId
            });
        } else if (info) {
            headers = Object.assign({}, headers, {
                AUTH_TOKEN: info.token,
                CURRENT_USER: info.loginId
            });
        }
        if (headers) {
            Util.ajax({
                method:'POST',
                url: Util.url + '/api/dict/dict_type/dict_values/all?version=' + state.dictVersion,
                headers: headers
            }).then((res)=>{
                if(res.data.isUpdate === '1' || state.dictstroage.length === 0){
                    localStorage.removeItem('dictstroage');
                    state.dictstroage=res.data.dictTypeAndValue;
                    localStorage.setItem('dictstroage',JSON.stringify(res.data.dictTypeAndValue));
                    state.dictVersion=res.data.version;
                }
            });
        }
    },
    [types.CLEAR_DICT](state){
        state.dictstroage = [];
        state.dictVersion = 1111111111;
    }
};

export default {
    state,
    getters,
    actions,
    mutations
};

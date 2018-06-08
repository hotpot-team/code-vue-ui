import * as types from '../mutation-types';
import Util from '../../libs/util';

const state = {
    dictstroage: [],
    dictVersion: 1111111111
};

// getters
const getters = {
    dictstroage: state => state.dictstroage
};

const actions = {
    updateDict({commit, state}) {
        commit(types.UPDATE_DICT);
    },
    clearDict({commit}){
        commit(types.CLEAR_DICT);
    }
};

// mutations
const mutations = {
    [types.UPDATE_DICT] (state) {
        if (this.getters.loginInfo.authToken && this.getters.loginInfo.authToken !== '') {
            Util.ajax.post('/api/dict/dict_type/dict_values/all?version=' + state.dictVersion).then((res) => {
                if (res.data.isUpdate === '1' || state.dictstroage.length === 0) {
                    state.dictstroage = res.data.dictTypeAndValue;
                    state.dictVersion = res.data.version;
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

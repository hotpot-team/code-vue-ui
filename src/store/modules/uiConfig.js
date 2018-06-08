import Util from '../../libs/util';
import * as types from '../mutation-types';

const state = {
    // 表格/表单配置信息
    uiConfigData: {},
    // 表格/表单版本号
    uiVersion: -1
};

const mutations = {
    // 更新表格/表单配置信息及版本号
    [types.UPDATE_UI_CONFIG](state, {data, version}) {
        state.uiConfigData = data;
        state.uiVersion = version;
    },
    [types.CLEAR_CONFIG](state){
        state.uiConfigData={};
        state.uiVersion = -1;
    }
};

const getters = {
    uiConfigData: state=> state.uiConfigData,
    uiVersion: state=> state.uiVersion
};

const actions = {
    getConfig({commit, state}, version) {
        return new Promise((resolve, reject) => {
            Util.ajax.get('/api/ui/uiconfigs', {params: {version: version}}).then((response) => {
                let body = response.data;
                // 如果配置信息不为空则更新配置信息和版本号
                if (body.uimap && body.uimap.actualObj) {
                    let data = {};
                    for (let id in body.uimap.actualObj) {
                        data[id] = {};
                        for (let key in body.uimap.actualObj[id]) {
                            if (Util.serializable.indexOf(key) > -1) {
                                data[id][key] = JSON.parse(body.uimap.actualObj[id][key]);
                            } else {
                                data[id][key] = body.uimap.actualObj[id][key];
                            }
                        }
                    }
                    commit(types.UPDATE_UI_CONFIG, {data: data, version: body.uimap.version});
                }
                resolve();
            }).catch(function(e) {
                // 错误提示
                resolve();
            });
        });
    },
    saveConfig({commit, state}, data)  {
        let uiconfig = {data: data};
        let version = state.uiVersion;
        return new Promise((resolve, reject) => {
            Util.ajax.post('/api/ui/uiconfigs/save', uiconfig).then((response) => {
                // 如果返回值为成功则触发更新配置信息操作
                if (response.data.statusCode === '0') {
                    dispatch('getConfig', {version: version});
                }
                resolve();
            }).catch(function(e) {
                // 错误提示
                resolve();
            });
        });
    },
    clearConfig({commit, state}){
        commit(types.CLEAR_CONFIG);
    }
};

export default {
    state,
    getters,
    actions,
    mutations
};
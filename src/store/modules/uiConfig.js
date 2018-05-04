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
                    commit(types.UPDATE_UI_CONFIG, {data: body.uimap.actualObj, version: body.uimap.version});
                }
                resolve();
            }).catch(function(e) {
                // 错误提示
                resolve();
            });
        });
    },
    // 获取配置信息
    fetchConfig({ commit, state }, {version, successCallback, processData}) {
        Util.ajax.get('/api/ui/uiconfigs', {params: {version: version}}).then((response) => {
            let body = response.data;
            // 如果配置信息不为空则更新配置信息和版本号
            if (body.uimap && body.uimap.actualObj) {
                commit(types.UPDATE_UI_CONFIG, {data: body.uimap.actualObj, version: body.uimap.version});
            }
            // 如果定义了成功回调函数则触发回调函数
            if (successCallback !== undefined) {
                successCallback(state.uiConfigData, processData);
            }
        }).catch(function(e) {
            // 错误提示
            processData.$Message.error('数据获取失败!');
        });

    },
    saveConfig({commit, state}, data)  {
        let uiconfig = {data: data};
        let version = state.uiVersion;
        return new Promise((resolve, reject) => {
            Util.ajax.post('/api/ui/uiconfigs/save', uiconfig).then((response) => {
                // 如果返回值为成功则触发更新配置信息操作
                if (response.data.statusCode === '0') {
                    dispatch('fetchConfig', {version: version});
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

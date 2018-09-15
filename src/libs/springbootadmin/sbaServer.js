import Util from '../util';
import sbaServer from './index';


const state = {
    serverHeader: {
        'titan-apptoken': '',
        'titan-appid': Util.appId
    },
    expireAt: null
};
const mutations = {
    ['SERVERTOKEN'](state, token){
        state.serverHeader['titan-apptoken'] = token;
    },
    ['UPDATEDATE'](state, date) {
        state.expireAt = new Date(date);
    },
};

const getters = {
    serverAdminHeader: state => state.serverHeader
};

const actions = {
    getServerAdminHeader({ commit, state }) {
        return new Promise((resolve, reject) => {
            if (new Date() > state.expireAt || state.serverHeader["titan-apptoken"] === '') {
                Util.ajax.get('/api/services/token/' + sbaServer.serverName).then((res)=>{
                    if (res.status === 200) {
                        commit('UPDATEDATE', res.data.tokenDTO.expireAt);
                        commit('SERVERTOKEN', res.data.tokenDTO.token);
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    }
};

export default {
    state,
    getters,
    actions,
    mutations
};
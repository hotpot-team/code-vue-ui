import store from "../../store";
import sbaStore from './sbaServer';
import env from '../../config/env';

let sbaServer={};

let devUrl =  'http://10.64.26.26:30080';
let testUrl = 'http://10.64.26.26:30080';
let proUrl = 'http://10.64.26.26:30080';
const serverUrl = env === 'development' ? devUrl : env === 'production' ? proUrl : testUrl;

sbaServer.serverName = 'platform-service';
sbaServer.sbaStore=sbaStore;
sbaServer.serverUrl=serverUrl;

sbaServer.getToken=function () {
    return new Promise((resolve, reject) => {
        store.dispatch('getServerAdminHeader').then(()=>{
            resolve(store.getters.serverAdminHeader);
        });
    });
}

export default sbaServer;

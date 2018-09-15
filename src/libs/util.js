import axios from 'axios';
import env from '../config/env';
import resUrl from './rescenter';
import PersonInput from '../common/component/person-seletion/person-input-res.vue';

let util = {
    appName: 'demo',
    baseUrl: '/' + 'demo'
};
let devUrl =  'http://127.0.0.1:8079';
let testUrl = 'http://127.0.0.1:8080';
let proUrl = 'http://127.0.0.1:8080';

util.title = function(title) {
    title = title ? title : 'front';
    window.document.title = title;
};

const ajaxUrl = env === 'development' ? devUrl : env === 'production' ? proUrl : testUrl;

util.ajax = axios.create({
    baseURL: ajaxUrl,
    timeout: 300000
});

util.url = ajaxUrl;
util.indexUrl = '/';
util.resUrl = resUrl;
util.personInput = PersonInput;
util.serializable = ['pathmag', 'tabConfigData', 'formConfigData', 'tableBtnConfigs', 'tableRowBtnConfigs', 'formBtnConfigs']; //序列化用
util.appId= '9d5ffa836f8f4fd4af8372d5bef02fb8';

export default util;
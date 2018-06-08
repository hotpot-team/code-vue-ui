import axios from 'axios';
import env from '../config/env';
import PersonInput from '../common/component/person-seletion/person-input.vue';

let util = {
    appName: 'demo',
    baseUrl: '/' + 'demo'
};
let devUrl =  'http://127.0.0.1:8080';
let testUrl = 'http://127.0.0.1:8080';
let proUrl = 'http://127.0.0.1:8080';

util.title = function(title) {
    title = title ? title : 'demo';
    window.document.title = title;
};

const ajaxUrl = env === 'development' ? devUrl : env === 'production' ? proUrl : testUrl;

util.ajax = axios.create({
    baseURL: ajaxUrl,
    timeout: 3000000
});

util.url = ajaxUrl;
util.indexUrl = '/';
util.personInput = PersonInput;
util.serializable = ['pathmag', 'tabConfigData', 'formConfigData', 'tableBtnConfigs', 'tableRowBtnConfigs', 'formBtnConfigs'] //序列化用

export default util;
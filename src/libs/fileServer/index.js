import env from '../../config/env';
import main from '../../main';
import store from '../../store';
import fileStore from './fileServer';
import Util from '../util';

let fileServer = {};

let devUrl =  'http://10.64.19.229:8090';
let testUrl = 'http://10.64.19.229:8090';
let proUrl = 'http://10.64.19.229:8090';

const serverUrl = env === 'development' ? devUrl : env === 'production' ? proUrl : testUrl;

fileServer.baseUrl = serverUrl;
fileServer.serverUrl = serverUrl + '/file/api/v1/file_service'; //文件上传
fileServer.serverName = 'file-service';
fileServer.fileStore = fileStore;

fileServer.getToken = function(){
    return new Promise((resolve, reject) => {
        store.dispatch('getServerHeader').then(()=>{
            resolve(store.getters.serverHeader);
        });
    });
};

fileServer.fileList = function (param) {
    return new Promise((resolve, reject) => {
        store.dispatch('getServerHeader').then(()=>{
            let headers = store.getters.serverHeader;
            let header = {
                'titan-apptoken': headers["titan-apptoken"],
                'titan-appid': headers["titan-appid"]
            };
            Util.ajax.post(fileServer.baseUrl + '/file/api/v1/file_service/pages', param,{
                headers: header
            }).then((res)=>{
                resolve(res);
            });
        });
    });
};


fileServer.downloadFile = function (fileId, fileName) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', fileServer.serverUrl + '/' + fileId, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    store.dispatch('getServerHeader').then(()=>{
        let headers = store.getters.serverHeader;
        xhr.setRequestHeader('titan-apptoken', headers["titan-apptoken"]);
        xhr.setRequestHeader('titan-appid', headers["titan-appid"]);
        xhr.responseType = 'blob';
        xhr.onload = function () {
            if (this.status === 200) {
                let blob = this.response;
                if (navigator.appVersion.toString().indexOf('.NET') > 0) {
                    window.navigator.msSaveBlob(blob, fileName);
                } else {
                    let body = document.body;
                    let a = document.createElement('a');
                    a.download = fileName;
                    a.href = URL.createObjectURL(blob);
                    body.appendChild(a);
                    a.click();
                    body.removeChild(a);
                }
            } else {
                let reader = new FileReader();
                reader.readAsText(this.response);
                reader.onload = function(){
                    let result = JSON.parse(reader.result);
                    if (result) {
                        main.$Message.error(result.message);
                    } else {
                        main.$Message.error('文件下载失败');
                    }
                };
            }
        };
        xhr.send();
    });
};

export default fileServer;
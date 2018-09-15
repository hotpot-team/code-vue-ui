import Util from '../../../../../libs/util';
import sba from '../../../../../libs/springbootadmin';

const actuatorMimeTypes = ['application/vnd.spring-boot.actuator.v2+json',
    'application/vnd.spring-boot.actuator.v1+json',
    'application/json'];

class Instance {
    constructor(id) {
        this.id = id;
    }


    async fetchMetrics() {
        return Util.ajax(`${sba.serverUrl}/bootadmin/instances/${this.id}/actuator/metrics`, {
            headers: {'Accept': actuatorMimeTypes}
        });
    }
    fetchMetricInfo(param){
        return Util.ajax(`${sba.serverUrl}/bootadmin/instances/${this.id}/actuator/metrics/${param}`, {
            headers: {'Accept': actuatorMimeTypes}
        }).then((res)=>{
            return Promise.resolve(res.data);
        });
    }

    async fetchMetricInfo_a(param){
        return Util.ajax(`${sba.serverUrl}/bootadmin/instances/${this.id}/actuator/metrics/${param}`, {
            headers: {'Accept': actuatorMimeTypes}
        });
    }

    async fetchPID_a(){
        return Util.ajax(`${sba.serverUrl}/bootadmin/instances/${this.id}/actuator/env/PID`, {
            headers: {'Accept': actuatorMimeTypes}
        })
    }

    fetchMemory(metric, param) {
        return Util.ajax(`${sba.serverUrl}/bootadmin/instances/${this.id}/actuator/metrics/${metric}`, {
            headers: {'Accept': actuatorMimeTypes},
            params: param
        }).then((res) => {
            return Promise.resolve(res.data);
        });
    }

    fetchEnvInfo() {
        return Util.ajax.get(`${sba.serverUrl}/bootadmin/instances/${this.id}/actuator/env/`,{
            headers: {'Accept': actuatorMimeTypes}
        }).then((res) => {
            if (res) {
                return Promise.resolve(res.data);
            }
        });
    }

    fetchLoggerInfo() {
        return Util.ajax.get(`${sba.serverUrl}/bootadmin/instances/${this.id}/actuator/loggers`,{
            headers: {'Accept': actuatorMimeTypes}
        }).then((res) => {
            if (res) {
                return Promise.resolve(res.data);
            }
        });
    }
    fetchLoggerInfo1() {
        return Util.ajax.get(`${sba.serverUrl}/bootadmin/instances/${this.id}/actuator/loggers`,{
            headers: {'Accept': actuatorMimeTypes},
            transformResponse: Instance._toLoggers
        }).then((res) => {
            if (res) {
                return Promise.resolve(res.data);
            }
        });
    }

    configureLogger(name, level) {
        return Util.ajax.post(`${sba.serverUrl}/bootadmin/instances/${this.id}/actuator/loggers/${name}`, {configuredLevel: level}, {
            headers: {'Content-Type': 'application/json'}
        }).then((res) => {
            if (res) {
                return Promise.resolve(res);
            }
        });
    }

    static _toLoggers(data) {
        if (!data) {
            return data;
        }
        const raw = JSON.parse(data);
        const loggers = _.transform(raw.loggers, (result, value, key) => {
            return result.push({name: key, ...value});
        }, []);
        return {levels: raw.levels, loggers};
    }

}

export default Instance;
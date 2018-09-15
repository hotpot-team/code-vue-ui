<template>
    <Row>
        <Col span="24">
        <Card dis-hover>
            <p slot="title">Process</p>
            <div v-if="error" class="message is-danger">
                <div class="message-body">
                    <strong>
                        <Icon class="has-text-danger" type="alert"/>
                        Fetching process metrics failed.
                    </strong>
                    <p v-text="error.message"/>
                </div>
            </div>
            <p>
                <div class="level">
                    <div class="level-item has-text-centered" v-if="pid">
            <p class="heading">PID</p>
            <p v-text="pid"/>
            </div>
            <div class="level-item has-text-centered" v-if="uptime">
                <p class="heading">Uptime</p>
                <p>
                    <process-uptime :value="uptime"></process-uptime>
                </p>
            </div>
            <div class="level-item has-text-centered" v-if="systemCpuCount">
                <p class="heading">CPUS</p>
                <p v-text="systemCpuCount.toFixed(2)"/>
            </div>
            <!--<div class="level-item has-text-centered" v-if="systemLoad">
                <p class="heading">SYSTEM LOAD (LAST 1M)</p>
                <p v-text="systemLoad.toFixed(2)"/>
            </div>-->
            <div class="level-item has-text-centered" v-if="processLoad">
                <div>
                    <p class="heading">Process CPU Usage</p>
                    <p v-text="processLoad.toFixed(2)"/>
                </div>
            </div>
            <div class="level-item has-text-centered" v-if="systemLoad">
                <div>
                    <p class="heading">System CPU Usage</p>
                    <p v-text="systemLoad.toFixed(2)"/>
                </div>
            </div>
            </div>
            </p>
        </Card>
        </Col>
    </Row>
</template>

<script>
    import Instance from "../../utils/instance";
    import processUptime from './process-uptime';

    let timeId;
    export default {
        components: {processUptime},
        name: "detail-process",
        props: {
            curId:{
                type:String,
                required:true
            },
            endpoints:{
                type:Array,
                required:true
            },
            metrics:{
                type:Array,
                required:true
            }
        },
        data() {
            return {
                instance: null,
                pid: '',
                uptime: '',
                systemCpuCount: '',
                systemLoad: '',
                processLoad:'',
                error:null
            };
        },
        created() {
            this._initInstance();
            this.fetchUptime();
            this.fetchCpucount();
            this.fetchPID();
            this.constantFetchLoad();
        },
        methods: {
            _initInstance() {
                this.instance = new Instance(this.curId);
            },
            async fetchPID(){
                if(this.hasEndpoints('env')){
                    try{
                        const res=await this.instance.fetchPID_a();
                        this.pid=res.data.property.value;
                    }catch (error){
                        console.warn('Fetching PID failed:', error);
                    }
                }
            },
            async fetchUptime() {
                try{
                    this.uptime=await this.fetchMetric('process.uptime');
                }catch (error){
                    this.error=error;
                    console.log('Fetching Uptime failed:', error);
                }
            },
            async fetchCpucount(){
                try{
                    this.systemCpuCount=await this.fetchMetric('system.cpu.count')
                }catch(error){
                    console.warn('Fetching system cpu failed:', error);
                }
            },
            async fetchMetric(name){
                const res=await this.instance.fetchMetricInfo_a(name);
                return res.data.measurements[0].value
            },
            async fetchCpuLoadMetrics() {
                /*const systemRes=this.fetchMetric('system.cpu.usage');
                const processRes=this.fetchMetric('process.cpu.usage');
                try{
                    this.systemLoad=await systemRes;
                }catch (e) {
                    console.warn('Fetching System CPU Load failed:', e);
                }

                try{
                    this.processLoad=await processRes;
                }catch (e) {
                    console.warn('Fetching Process CPU Load failed:', e);
                }*/
                if(this.hasMetric('system.load.average.1m')){
                    const systemRes=this.fetchMetric('system.load.average.1m');
                    try{
                        this.systemLoad=await systemRes;
                    }catch (e) {
                        console.warn('Fetching System CPU Load failed:', e);
                    }
                }

            },
            hasEndpoints(pointId) {
                //return this.endpoints.findIndex(endpoint => endpoint.id === endpointId) >= 0;
                return this.endpoints.findIndex(curId => curId === pointId) >= 0;
            },
            constantFetchLoad(){
                let vm=this;
                timeId=setInterval(function () {
                    vm.fetchCpuLoadMetrics();
                },2500)
            },
            hasMetric(metric) {
                return this.metrics.includes(metric);
            }
        },
        beforeDestroy(){
            clearInterval(timeId);
        }
    };
</script>

<style scoped lang="sass">
    .level
        display: flex
        width: 100%
        align-items: center
        padding: 0 20px
        justify-content: space-between

        .level-item
            margin: 0 .75rem
        p
            height: 30px
</style>
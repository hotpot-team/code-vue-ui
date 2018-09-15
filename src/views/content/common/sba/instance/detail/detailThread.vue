<template>
    <Row>
        <Col span="24">
        <Card dis-hover>
            <p slot="title">Thread</p>
            <div v-if="error" class="message is-danger">
                <div class="message-body">
                    <strong>
                        <Icon class="has-text-danger" type="alert"/>
                        Fetching threads metrics failed.
                    </strong>
                    <p v-text="error.message"/>
                </div>
            </div>
            <p>
                <div class="level">
                    <div class="level-item has-text-centered" v-if="live">
            <p class="heading">LIVE</p>
            <p v-text="live"/>
            </div>
            <div class="level-item has-text-centered" v-if="daemon">
                <p class="heading">DAEMON</p>
                <p v-text="daemon"/>
            </div>
            <div class="level-item has-text-centered" v-if="peak">
                <p class="heading">PEAK LIVE</p>
                <p v-text="peak"/>
            </div>
            </div>
            </p>
            <p>
                <thread-chart :chartData="chartData" :timeData="timeData"></thread-chart>
            </p>
        </Card>
        </Col>
    </Row>
</template>

<script>
    import Instance from "../../utils/instance";
    import {timer} from 'rxjs';
    import subscribing from '../../utils/subscribing';
    import moment from 'moment';
    import threadChart from './thread-chart';

    let liveData = [];
    let daemonData = [];

    export default {
        name: "detail-thread",
        mixins: [subscribing],
        components: {
            threadChart
        },
        data() {
            return {
                instance: null,
                chartData: [],
                timeData: [],
                live: '',
                daemon: '',
                peak: '',
                error: null
            };
        },
        props: {
            curId: {
                type: String,
                required: true
            }
        },
        created() {
            this._initInstance();
            this._getThreadInfo();
        },
        methods: {
            _initInstance() {
                this.instance = new Instance(this.curId);
            },
            _getThreadInfo() {
                this.instance.fetchMetricInfo('jvm.threads.live').then((data) => {
                    if (data) {
                        this.live = data.measurements[0].value;
                        this.instance.fetchMetricInfo('jvm.threads.daemon').then((data) => {
                            if (data) {
                                this.daemon = data.measurements[0].value;
                                this.setData(liveData, this.live);
                                this.setData(daemonData, this.daemon);
                            }
                        });
                    }
                });

                this.instance.fetchMetricInfo('jvm.threads.peak').then((data) => {
                    if (data) {
                        this.peak = data.measurements[0].value;
                    }
                });
            },
            setData(contain, data) {
                contain.push(data);
                this.chartData.push({
                    contain
                });
            },
            createSubscription() {
                const vm = this;
                return timer(0, 2500).subscribe({
                    next: () => {
                        vm._getThreadInfo();
                        vm.timeData.push(moment.now().valueOf());
                    },
                    error: error => {
                        console.warn('Fetching threads metrics failed:', error);
                        vm.error = error;
                    }
                });
            }
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
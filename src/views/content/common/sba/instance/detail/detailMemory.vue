<template>
    <Row>
        <Col span="24">
        <Card dis-hover>
            <p slot="title" v-text="`Memory: ${name}`"></p>
            <div v-if="error" class="message is-danger">
                <div class="message-body">
                    <strong>
                        <Icon class="has-text-danger" type="alert"/>
                        Fetching memory metrics failed.
                    </strong>
                    <p v-text="error.message"/>
                </div>
            </div>
            <p>
                <div class="level memory-current" v-if="used">
                    <div class="level-item has-text-centered" v-if="metaspace">
                        <div>
            <p class="heading has-bullet has-bullet-primary">Metaspace</p>
            <p v-text="formatBytes(metaspace)"></p>
            </div>
            </div>
            <div class="level-item has-text-centered">
                <div>
                    <p class="heading has-bullet has-bullet-info">Used</p>
                    <p v-text="formatBytes(used)"></p>
                </div>
            </div>
            <div class="level-item has-text-centered">
                <div>
                    <p class="heading has-bullet has-bullet-warning">Size</p>
                    <p v-text="formatBytes(committed)"></p>
                </div>
            </div>
            <div class="level-item has-text-centered" v-if="max >= 0">
                <div>
                    <p class="heading">Max</p>
                    <p v-text="formatBytes(max)"></p>
                </div>
            </div>
            </div>
            </p>
            <p>
                <memory-chart :chartData1="chartData" :timeData1="timeData" :type="type"></memory-chart>
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
    import memoryChart from './memory-chart';

    let usedData = [];
    let usedData_h = [];
    let sizeData = [];
    let sizeData_h = [];
    let metaData_nonheap = [];

    export default {
        name: "detail-memory",
        mixins: [subscribing],
        components: {
            memoryChart
        },
        props: {
            type: {
                type: String,
                required: true
            },
            curId: {
                type: String,
                required: true
            }
        },
        data() {
            return {
                instance: null,
                current: null,
                chartData: [],
                timeData: [],
                max: null,
                used: null,
                committed: null,
                metaspace: null,
                error: null
            };
        },
        computed: {
            name() {
                switch (this.type) {
                    case 'heap':
                        return 'Heap'
                    case 'nonheap':
                        return 'Non heap'
                    default:
                        return this.type;
                }
            }
        },
        created() {
            this._initInstance();
            this._fetchMemory();
        },
        methods: {
            //流量 单位换算
            formatBytes(size) {
                var units = [' B', ' KB', ' MB', ' GB', ' TB'];
                for (var i = 1; size >= 1024 && i < 4; i++) { // i = 1 表示传入size的最小单位为KB
                    size /= 1024;
                }
                return Math.floor(size * 100) / 100 + units[i - 1]; // 保留两位小数
            },
            _initInstance() {
                this.instance = new Instance(this.curId);
            },
            _fetchMemory() {
                this.instance.fetchMemory(`jvm.memory.max?tag=area:${this.type}`).then((res) => {
                    if (res) {
                        this.max = res.measurements[0].value;
                    }
                })
                this.instance.fetchMemory(`jvm.memory.used?tag=area:${this.type}`).then((res) => {
                    if (res) {
                        this.used = res.measurements[0].value;
                        this.instance.fetchMemory(`jvm.memory.committed?tag=area:${this.type}`).then((res) => {
                            if (res) {
                                this.committed = res.measurements[0].value;
                                if (this.type === 'nonheap') {
                                    this.instance.fetchMemory('jvm.memory.used?tag=area:nonheap,id:Metaspace').then((res) => {
                                        if (res) {

                                            this.metaspace = res.measurements[0].value;
                                            this.setData(metaData_nonheap, this.metaspace);
                                            this.setData(usedData, this.used);
                                            this.setData(sizeData, this.committed);

                                        }
                                    });
                                } else {
                                    this.setData(usedData_h, this.used);
                                    this.setData(sizeData_h, this.committed);
                                }
                            }
                        });
                    }
                });
            },
            setData(contain, data) {
                if (this.type === 'nonheap') {
                    contain.push(
                        data
                    );
                    this.chartData.push({
                        contain
                    });
                } else {
                    contain.push(
                        data
                    );
                    this.chartData.push({
                        contain
                    });
                }

            },
            createSubscription() {
                const vm = this;
                return timer(0, 2500).subscribe({
                    next: () => {
                        vm._fetchMemory();
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
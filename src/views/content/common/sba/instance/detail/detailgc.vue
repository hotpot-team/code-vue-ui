<template>
    <Row>
        <Col span="24">
            <Card dis-hover>
                <p slot="title">Garbage Collection Pauses</p>
                <div v-if="error" class="message is-danger">
                    <div class="message-body">
                        <strong>
                            <Icon class="has-text-danger" type="alert"/>
                            Fetching GC metrics failed.
                        </strong>
                        <p v-text="error.message"/>
                    </div>
                </div>
                <p>
                    <div class="level" v-if="gcInfo">
                        <div class="level-item has-text-centered">
                            <div>
                <p class="heading">Count</p>
                <p v-text="gcInfo.count"/>
                </div>
                </div>
                <div class="level-item has-text-centered">
                    <div>
                        <p class="heading">Total time spent</p>
                        <p v-text="`${gcInfo.total_time.toFixed(3)}s`"/>
                    </div>
                </div>
                <div class="level-item has-text-centered">
                    <div>
                        <p class="heading">Max time spent</p>
                        <p v-text="`${gcInfo.max.toFixed(3)}s`"/>
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
    import moment from 'moment'

    let timeId;
    export default {
        name: "detailgc",
        props: {
            curId: {
                type: String,
                required: true
            }
        },
        data() {
            return {
                gcInfo: null,
                instance: null,
                error: null,
            };
        },
        created() {
            this._initInstance();
            this.constantTest();
        },
        methods: {
            _initInstance() {
                this.instance = new Instance(this.curId);
            },

            async fetchGc_a() {
                try {
                    const res = await this.instance.fetchMetricInfo_a('jvm.gc.pause');
                    const measures = res.data.measurements.reduce((current, measurement) => ({
                        ...current,
                        [measurement.statistic.toLowerCase()]: measurement.value
                    }), {});
                    this.gcInfo = measures;
                }catch (error) {
                    console.warn('Fetching GC metrics failed:', error);
                    this.error = error;
                }
            },
            constantTest() {
                let vm = this;
                timeId =setInterval(function () {
                    vm.fetchGc_a();
                }, 2500)
            }
        },
        beforeDestroy() {
            clearInterval(timeId);
        },
    };
</script>

<style scoped lang="sass">
    .level
        display: flex
        width: 100%
        align-items: center
        justify-content: space-between
        padding: 0 20px
        .level-item
            margin: 0 .75rem
        p
            height: 30px


</style>
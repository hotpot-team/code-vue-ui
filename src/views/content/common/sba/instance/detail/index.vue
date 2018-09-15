<template>
    <section class="section">
        <div class="container">
            <div v-if="error" class="message is-danger">
                <div class="message-body">
                    <strong>
                        <font-awesome-icon class="has-text-danger" icon="exclamation-triangle"/>
                        Fetching metrics index failed.
                    </strong>
                    <p v-text="error.message"/>
                </div>
            </div>
            <div class="columns is-desktop">
                <div class="column is-half-desktop">
                    <info :infoMessage="infoMessage" v-if="hasInfo"></info>
                    <detail-meta :metaMessage="metaMessage" v-if="hasMetadata"></detail-meta>
                </div>
                <div class="column is-half-desktop">
                    <health :healthMessage="healthMessage"></health>
                </div>
            </div>
            <div class="columns is-desktop">
                <div class="column is-half-desktop">
                    <process :curId="curId" :endpoints="getpoints" :metrics="metrics" v-if="hasProcess"></process>
                    <gc :curId="curId" v-if="hasGc"></gc>
                </div>
                <div class="column is-half-desktop">
                    <thread :curId="curId" v-if="hasThreads"></thread>
                </div>
            </div>
            <div class="columns is-desktop">
                <div class="column is-half-desktop">
                    <memory type="heap" :curId="curId" v-if="hasMemory"></memory>
                </div>
                <div class="column is-half-desktop">
                    <memory type="nonheap" :curId="curId" v-if="hasMemory"></memory>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
    import Info from './detailInfo';
    import detailMeta from './detailMeta';
    import Health from './detailHealth';
    import Gc from './detailgc';
    import Process from './detailProcess';
    import Thread from './detailThread';
    import Memory from './detailMemory';
    import Instance from "../../utils/instance";

    export default {
        name: "index",
        components: {
            Info,
            detailMeta,
            Health,
            Gc,
            Process,
            Thread,
            Memory,
        },
        props: {
            curInstance: {
                type: Object,
                required: true
            }
        },
        data() {
            return {
                metrics: [],
                error: null
            }
        },
        computed: {
            getpoints: function () {
                let list = this.curInstance.endpoints;
                let idList = [];
                list.forEach((item) => {
                    idList.push(item.id);
                })
                return idList;
            },
            hasCaches() {
                return this.hasMetric('cache.gets');
            },
            hasDatasources() {
                return this.hasMetric('data.source.active.connections');
            },
            hasGc() {
                return this.hasMetric('jvm.gc.pause');
            },
            hasInfo() {
                return this.hasEndpoints('info');
            },
            hasMemory() {
                return this.hasMetric('jvm.memory.max');
            },
            hasProcess() {
                return this.hasMetric('process.uptime');
            },
            hasThreads() {
                return this.hasMetric('jvm.threads.live');
            },
            hasMetadata() {
                return this.curInstance.registration && this.curInstance.registration.metadata;
            },
            infoMessage: function () {
                return this.curInstance.info;
            },
            metaMessage: function () {
                return this.curInstance.registration.metadata;
            },
            healthMessage: function () {
                return this.curInstance.statusInfo;
            },
            curId: function () {
                return this.curInstance.id;
            },
            instance: function () {
                return new Instance(this.curInstance.id)
            }
        },
        created() {
            this._fetchMetrics()
        },
        methods: {
            hasEndpoints(pointId) {
                //return this.endpoints.findIndex(endpoint => endpoint.id === endpointId) >= 0;
                return this.getpoints.findIndex(curId => curId === pointId) >= 0;
            },
            hasMetric(metric) {
                return this.metrics.includes(metric);
            },
            async _fetchMetrics() {
                if (this.hasEndpoints('metrics')) {
                    this.error = null;
                    try {
                        const res = await this.instance.fetchMetrics();
                        this.metrics = res.data.names;
                    }catch (error){
                        console.warn('Fetching metric index failed:', error);
                        this.error = error;
                    }
                }
            }
        }
    };
</script>

<style scoped lang="scss">
    .section {
        //padding: 1rem 1.5rem;
        display: block;

        .container {
            margin: 0px auto;
            position: relative
        }
        div {
            display: block
        }

        .columns:not(:last-child) {
            margin-bottom: 0.75rem
        }
        .columns {
            margin-left: -.75rem;
            margin-right: -.75rem;
            margin-top: -.75rem
        }
        .column {
            display: block;
            flex-basis: 0;
            flex-grow: 1;
            flex-shrink: 1;
            padding: .75rem
        }
        .is-desktop {
            display: flex;
            flex-wrap: wrap
        }
        .is-half-desktop > * {
            margin-bottom: 2rem
        }
        //class="ivu-card-head"
        .ivu-card-head {
            padding: 0px;
        }
    }

</style>
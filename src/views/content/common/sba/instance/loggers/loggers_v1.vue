<template>
    <section class="section" :class="{ 'is-loading' : !hasLoaded }">
        <div class="container" v-if="hasLoaded">
            <div v-if="error" class="message is-danger">
                <div class="message-body">
                    <strong>
                        <Icon class="has-text-danger" type="alert"/>
                        Fetching loggers failed.
                    </strong>
                    <p v-text="error.message"/>
                </div>
            </div>
            <template v-if="loggerConfig">
                        <div class="field-body">
                        <Row>
                            <Col span="24">
                            <Input class="input" placeholder="name filter" clearable v-model="filter">
                            <span class="button is-static" slot="append">
                                    <span v-text="filteredLoggers.length"/>
                                    /
                                    <span v-text="loggerConfig.loggers.length"/>
                                  </span>
                            </Input>
                            </Col>
                        </Row>
                    </div>


                <div class="field-body" style="margin: 10px 0px">
                    <div>
                        <Checkbox v-model="showClassLoggersOnly">class only</Checkbox>
                        <Checkbox v-model="showConfiguredLoggersOnly">configured</Checkbox>
                    </div>
                </div>
            </template>
            <Row>
                <Col span="24">
                <table v-if="loggerConfig" class="table is-hoverable is-fullwidth">
                    <tbody>
                    <tr v-for="logger in limitedLoggers" :key="logger.name">
                        <td>
                            <span class="is-breakable" v-text="logger.name"/>
                            <span class="has-text-danger" v-if="logger.name in failed">
                                <Icon class="has-text-danger" type="alert"/>
                                <span v-text="`Configuring ${failed[logger.name]} failed.`"/>
                              </span>
                            <sba-logger-control class="is-pulled-right"
                                                :level-options="levels"
                                                :effective-level="logger.effectiveLevel"
                                                :configured-level="logger.configuredLevel"
                                                :is-loading="loading[logger.name]"
                                                :has-failed="failed[logger.name]"
                                                :allow-reset="logger.name !== 'ROOT'"
                                                @input="level => configureLogger(logger, level)"/>
                        </td>
                    </tr>
                    <tr v-if="limitedLoggers.length === 0">
                        <td class="is-muted" colspan="5">No loggers found.
                        </td>
                    </tr>
                    </tbody>
                </table>
                </Col>
            </Row>

        </div>
    </section>
</template>

<script>
    import Instance from '../../utils/instance';
    import sbaLoggerControl from './logger-control';

    const isClassName = name => /\.[A-Z]/.test(name);

    const addToFilter = (oldFilter, addedFilter) =>
        !oldFilter
            ? addedFilter
            : (val, key) => oldFilter(val, key) && addedFilter(val, key);



    export default {
        name: 'logger_v1',
        components: {
            sbaLoggerControl
        },
        props:{
            curInstance: {
                type: Object,
                required: true
            }
        },
        data() {
            return {
                hasLoaded: false,
                error: null,
                loggerConfig: null,
                filter: '',
                showClassLoggersOnly: false,
                showConfiguredLoggersOnly: false,
                visibleLimit: 25,
                loading: {},
                failed: {}
            };
        },
        computed: {
            instance() {
                let id = this.curInstance.id;
                return new Instance(id);
            },
            levels() {
                return this.loggerConfig.levels;
            },
            limitedLoggers() {
                if (this.visibleLimit > 0) {
                    return this.filteredLoggers.slice(0, this.visibleLimit);
                } else {
                    return this.filteredLoggers;
                }
            },
            filteredLoggers() {
                let filterFn = this.getFilterFn();
                return filterFn ? this.loggerConfig.loggers.filter(filterFn) : this.loggerConfig.loggers;
            }
        },
        methods: {
            configureLogger(logger, level) {

                const vm = this;
                const setLoadingHandle = setTimeout(() => vm.$set(vm.loading, logger.name, level), 150);
                try {
                    this.instance.configureLogger(logger.name, level).then(() => {
                        console.log('configure success!!!!!!!!!');
                    });
                    vm.$delete(vm.failed, logger.name, level);

                } catch (error) {
                    console.warn(`Configuring logger '${logger.name}' failed:`, error);
                    vm.$set(vm.failed, logger.name, level);
                }

                try {
                    this.fetchLoggers();
                } finally {
                    vm.$delete(vm.loading, logger.name);
                    clearTimeout(setLoadingHandle);
                }
            },
            fetchLoggers: function () {
                this.error = null;
                try {
                    this.instance.fetchLoggerInfo1().then((res) => {
                        this.loggerConfig = res;
                    });

                } catch (error) {
                    console.warn('Fetching loggers failed:', error);
                    this.error = error;
                }
                this.hasLoaded = true;
            },
            onScroll() {
                if (this.loggerConfig && this.$el.getBoundingClientRect().bottom - 400 <= window.innerHeight && this.visibleLimit < this.filteredLoggers.length) {
                    this.visibleLimit += 25;
                }
            },
            getFilterFn() {
                let filterFn = null;

                if (this.showClassLoggersOnly) {
                    filterFn = addToFilter(filterFn, logger => isClassName(logger.name));
                }

                if (this.showConfiguredLoggersOnly) {
                    filterFn = addToFilter(filterFn, logger => !!logger.configuredLevel);
                }

                if (this.filter) {
                    const normalizedFilter = this.filter.toLowerCase();
                    filterFn = addToFilter(filterFn, logger => logger.name.toLowerCase().includes(normalizedFilter));
                }

                return filterFn;
            }
        },
        created() {
            this.fetchLoggers();
        },
        mounted() {
            let dom = document.getElementsByClassName('right')[0];
            dom.addEventListener('scroll', this.onScroll);
        },
        beforeDestroy() {
            let dom = document.getElementsByClassName('right')[0];
            dom.removeEventListener('scroll', this.onScroll);
        }
    };
</script>

<style scoped lang="scss">

    .table{
        width: 100%;
        tr {
            height: 2.6rem;
            td{
                padding: 0rem 1rem;
                border-radius: 4px;
            }
        }
        tr:hover {
            background-color: #eee;
        }
    }
    .is-breakable {
        vertical-align: -.4.2rem;
        font-size: 12px;
    }
</style>
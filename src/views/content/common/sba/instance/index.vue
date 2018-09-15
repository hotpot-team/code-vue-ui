<template>
    <div class="content">
        <Layout v-if="showAppli">
            <Content>
                <Row class-name="row"  v-if="application">
                    <Col span="12">
                    <ul>
                        <li>INSTANCES</li>
                        <li v-text="application.instances.length" style="color: forestgreen"></li>
                    </ul>
                    </Col>
                    <Col span="12">
                    <ul v-if="application&&application.status==='UP'">
                        <li>STATUS</li>
                        <li style="color: forestgreen">All UP</li>
                    </ul>
                    <ul v-else>
                        <li>Instances Down</li>
                        <li style="color: red">{{downCount}} down</li>
                    </ul>
                    </Col>
                </Row>
            </Content>
            <Content style="padding: 5px;" v-if="application">
                <Card dis-hover>
                    <p slot="title">{{application.name}}</p>
                    <div class="insList" v-for="instance in application.instances">
                        <div>
                            <span><!--<Icon type="checkmark" color="green"/>-->
                                <sba-icon :status="instance.statusInfo.status"></sba-icon>
                            </span><br>
                            <span>
                                <sba-time :date="instance.statusTimestamp"></sba-time>
                            </span>
                        </div>
                        <div>
                            <span><a :href="instance.registration.serviceUrl || instance.registration.healthUrl"
                                     v-text="instance.registration.serviceUrl || instance.registration.healthUrl"></a></span><br>
                            <span v-text="instance.id" @click="metricInfo(instance)" style="cursor: pointer"></span>
                        </div>
                    </div>
                </Card>
            </Content>
        </Layout>
        <Layout v-if="showMetrics">
            <span class="icon" @click="closeInfo()"><Icon type="close"></Icon></span>
            <Content class="cardContent">
                <!--<div>-->
                    <Tabs :value="flagTab" @on-click="tabclick">
                        <TabPane label="详情" name="name1">
                            <detail :curInstance="curInstance" v-if="flagTab==='name1'"></detail>
                        </TabPane>
                        <TabPane label="环境" name="name2" v-if="curInstance.statusInfo.status==='UP'">
                            <env :curInstance="curInstance" v-if="flagTab==='name2'"></env>
                        </TabPane>
                        <TabPane label="日志级别" name="name3" v-if="curInstance.statusInfo.status==='UP'">
                            <loggers :curInstance="curInstance" v-if="flagTab==='name3'"></loggers>
                        </TabPane>
                    </Tabs>
                <!--</div>-->
            </Content>
        </Layout>
    </div>
</template>

<script>
    import Layout from 'iview/src/components/layout/layout';
    import Detail from './detail/index';
    import Env from '../instance/env/env';
    import Loggers from './loggers/loggers_v1';
    import sbaServer from '../../../../../libs/springbootadmin';

    import sbaIcon from './tool/sba-icon';
    import sbaTime from './tool/sba-time';

    export default {
        components: {
            Layout,
            Detail,
            Env,
            Loggers,
            sbaIcon,
            sbaTime
        },
        name: "index",
        props: {},
        data() {
            return {
                application: null,
                showMetrics: false,
                showAppli: true,
                headers: null,
                flagTab: 'name1',
                curInstance: null
            };
        },
        computed: {
            downCount() {
                if (this.application) {
                    let ins = this.application.instances;
                    let count = 0;
                    for (let i = 0; i < ins.length; i++) {
                        if (ins[i].statusInfo.status != 'UP') {
                            count++;
                        }
                    }
                    return count;
                } else
                    return 0;
            }
        },
        created() {
            sbaServer.getToken().then((header) => {
                this.headers = header;
                this._getAppList();
            });

        },
        methods: {
            _getAppList() {
                this.$http.get(sbaServer.serverUrl + '/bootadmin/ext/application/instances', {
                    headers: this.headers
                }).then((res) => {
                    if (res) {
                        let data = res.data;
                        this.application = data[0];
                    }
                });
            },
            metricInfo(instance) {
                this.showAppli = false;
                this.showMetrics = true;
                this.curInstance = instance;
            },
            closeInfo() {
                this.showAppli = true;
                this.showMetrics = false;
                this.flagTab='name1';
            },
            tabclick(name) {
                this.flagTab = name;
            }
        }
    };
</script>

<style scoped lang="sass">
        .cardContent
            box-shadow: 0 2px 22px 0 rgba(192, 204, 221, 0.8)
            border-radius: 2px
            border: none
            div
                background-color: #fff
                padding: 5px

        .content
            padding: 6px
            font-size: large
            .insList
                display: flex
                div
                    margin-bottom: 30px
                    margin: 10px

        .row
            text-align: center

        ul li
            list-style-type: none

        .icon
            position: absolute
            top: 15px
            right: 20px
            z-index: 99
            cursor: pointer


</style>
<template>
    <div>
        <Scroll :on-reach-bottom="handleReachBottom" :height='height'>
            <Row>
                <Col span="24">
                <!--<Input placeholder="name filter" clearable @on-change="findFilter()"></Input>
                </Col>
                <Col span="4">
                <Card :dis-hover="single2" :padding=4.5>
                    <span v-text="loggers.length"></span>/<span v-text="loggers.length"></span>
                </Card>-->
                    <Input v-model="value14" placeholder="name filter" clearable @on-change="findFilter()">
                    <span slot="append">{{loggers.length}}/{{loggers.length}}</span>
                    </Input>
                </Col>
            </Row>
            <div style="margin: 20px 0px">
                <Checkbox v-model="single1" @on-change="outsingle()">class only</Checkbox>
                <Checkbox v-model="single2">configured</Checkbox>
            </div>
            <div>
                <Table stripe :columns="columns" :data="data" :show-header="false"></Table>
            </div>

        </Scroll>
    </div>
</template>

<script>
    import Instance from '../../utils/instance';

    export default {
        name: "loggers",
        computed: {
            instance() {
                let id = window.localStorage.getItem('currentId');
                return new Instance(id);
            }
        },
        data() {
            return {
                value14: '',
                single1: true,
                single2: false,
                single3: true,
                height: window.innerHeight,
                loggers: [],
                options: [],
                columns: [
                    {
                        title: ' ',
                        key: 'name'
                    },
                    {
                        title: ' ',
                        key: 'action',
                        align: 'center',
                        render: (h, params) => {
                            let props = this._madeHArrs(h, params)
                            return h('div', props);
                        }

                    }
                ],
                data: []
            };
        },
        created() {
            this._getLoggers();
        },
        methods: {
            _madeHArrs(h, params) {
                let arrs = []
                for (let i = 0; i < this.options.length; i++) {
                    arrs.push(this._madeH(h, params, i));
                }
                return arrs;
            },
            _madeH(h, params, i) {
                return h('Button', {
                    props: {
                        size: 'small'
                    },
                    style: {
                        marginRight: '5px'
                    },
                    on: {
                        click: () => {
                            //this.show(params.index)
                            console.log('点击事件');
                        }
                    }
                }, this.options[i]);
            },
            _getLoggers() {
                this.instance.fetchLoggerInfo().then((res) => {
                    if (res) {
                        let data = res.loggers
                        let levels = res.levels
                        levels.push('Reset')
                        let keys = Object.keys(data)
                        this.loggers = keys
                        let keysS = keys.slice(0, 50)
                        for (let item in keysS) {
                            this.data.push({name: keysS[item]});
                        }
                        this.options = levels;
                    }
                });
            },
            handleReachBottom() {
                console.log('下拉加载。。。。。。。。。。。。。。。。。。。。。。。。。。')
                return new Promise(resolve => {
                    setTimeout(() => {
                        const last = this.data.length - 1
                        for (let i = 1; i < 20; i++) {
                            this.data.push({name: this.loggers[last + i]});
                        }
                        resolve();
                    }, 0);
                });
            },
            findFilter() {
                console.log('过滤查找。。。。。');
            },
            outsingle() {
                console.log('single1:' + this.single1);
            },
            show(index) {
                this.$Modal.info({
                    title: 'User Info',
                    content: `Name：${this.data[index].name}<br>Age：${this.data[index].age}<br>Address：${this.data[index].address}`
                });
            },
            remove(index) {
                this.data1.splice(index, 1);
            }
        }
    };
</script>

<style scoped>

</style>
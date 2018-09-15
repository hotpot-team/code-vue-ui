<template>
    <div>
        <div ref="chart" class="Mcontainer"></div>
    </div>
</template>

<script>
    import echarts from 'echarts';

    let size = 10;

    export default {
        name: "memory-chart",
        props: ['chartData1', 'timeData1', 'type'],
        data() {
            return {
                used: [],
                size: [],
                meta: [],
                times: [],
                chart: {}
            };
        },
        watch: {
            chartData1: function (val) {
                if (val) {
                    if (this.type === 'heap') {
                        let len = val[0].contain.length;
                        if (len < size) {
                            this.used = this.formatByteArr(val[0].contain);
                            this.size = this.formatByteArr(val[1].contain);
                        } else {
                            this.used = this.formatByteArr(val[0].contain.slice(len - size));
                            this.size = this.formatByteArr(val[1].contain.slice(len - size));
                        }
                        this.drawChart_heap();
                    } else {
                        let len = val[0].contain.length;
                        if (len < size) {
                            this.meta = this.formatByteArr(val[0].contain);
                            this.used = this.formatByteArr(val[1].contain);
                            this.size = this.formatByteArr(val[2].contain);
                        } else {
                            this.meta = this.formatByteArr(val[0].contain.slice(len - size));
                            this.used = this.formatByteArr(val[1].contain.slice(len - size));
                            this.size = this.formatByteArr(val[2].contain.slice(len - size));
                        }
                        this.drawChart();
                    }
                }
            },
            timeData1: function (val) {
                if (val) {
                    let len = val.length;
                    if (len < size) {
                        this.times = this.formatTime(val);
                    } else {
                        this.times = this.formatTime(val.slice(len - size));
                    }
                }
                if (this.type === 'heap') {
                    this.drawChart_heap();
                } else {
                    this.drawChart();
                }


            }
        },
        methods: {
            drawChart_heap() {
                let dom = this.$refs.chart;
                this.chart = echarts.init(dom);
                // 皮肤添加同一般使用方式
                this.chart.hideLoading();
                this.chart.setOption({
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'cross',
                            label: {
                                backgroundColor: '#6a7985'
                            }
                        }
                    },
                    color: [
                        "#d48265",
                        "#91c7ae",
                        "#749f83",
                        "#ca8622",
                    ],
                    legend: {
                        data: ['size', 'used']
                    },
                    toolbox: {
                        feature: {}
                    },
                    grid: {
                        y: 30,
                        y2: 60
                    },
                    xAxis: [
                        {
                            type: 'category',
                            boundaryGap: false,
                            data: this.times
                        }
                    ],
                    yAxis: [
                        {
                            type: 'value',
                            axisLabel: {formatter: '{value}M'},
                            max:function(value) {
                                return value.max +50;
                            },
                            interval:200,
                            splitNumber:8
                        }
                    ],
                    series: [
                        {
                            name: 'size',
                            type: 'line',
                            areaStyle: {normal: {opacity: 1}},
                            data: this.size
                        },
                        {
                            name: 'used',
                            type: 'line',
                            areaStyle: {normal: {opacity: 1}},
                            data: this.used
                        },

                    ]
                });
                this.chart.resize();
            },
            drawChart() {
                let dom = this.$refs.chart;
                this.chart = echarts.init(dom);
                // 皮肤添加同一般使用方式
                this.chart.hideLoading();
                this.chart.setOption({
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'cross',
                            label: {
                                backgroundColor: '#6a7985'
                            }
                        }
                    },
                    color: [
                        "#d48265",
                        "#91c7ae",
                        "#749f83",
                        "#ca8622",
                    ],
                    legend: {
                        data: ['meta', 'size', 'used']
                    },
                    toolbox: {
                        feature: {}
                    },
                    grid: {
                        y: 30,
                        y2: 60
                    },
                    xAxis: [
                        {
                            type: 'category',
                            boundaryGap: false,
                            data: this.times
                        }
                    ],
                    yAxis: [
                        {
                            type: 'value',
                            axisLabel: {
                                formatter: function (size) {
                                    var units = ['M', 'G', 'T'];
                                    for (var i = 1; size >= 1024 && i < 2; i++) { // i = 1 表示传入size的最小单位为KB
                                        size /= 1024;
                                    }
                                    return Math.floor(size * 100) / 100 + units[i - 1]; // 保留两位小数
                                }
                            },
                            max:function(value) {
                                return value.max +20;
                            },
                            interval:50,
                            splitNumber:3
                        }
                    ],
                    series: [
                        {
                            name: 'size',
                            type: 'line',
                            areaStyle: {
                                normal: {
                                    opacity: 1
                                }
                            },
                            data: this.size
                        },
                        {
                            name: 'used',
                            type: 'line',
                            areaStyle: {
                                normal: {
                                    opacity: 1
                                }
                            },
                            data: this.used
                        },
                        {
                            name: 'meta',
                            type: 'line',
                            areaStyle: {normal: {opacity: 1}},
                            data: this.meta
                        },

                    ]
                });
                this.chart.resize();
            },
            formatTime(times) {
                // item.eventDate.timestamp = new Date(item.eventDate.timestamp).Format("dd/MM/yyyy hh:mm:ss");
                let result = [];
                for (let i = 0; i < times.length; i++) {
                    let time = new Date(times[i]).Format('hh:mm:ss');
                    result.push(time);
                }
                return result;
            },
            formatByteArr(byteArr) {
                let result = [];
                for (let i = 0; i < byteArr.length; i++) {
                    let byte = this.formatBytes(byteArr[i]);
                    result.push(byte);
                }
                return result;
            },
            //流量 单位换算
            formatBytes(size) {
                for (var i = 1; size >= 1024 && i < 4; i++) { // i = 1 表示传入size的最小单位为KB
                    size /= 1024;
                }
                return Math.floor(size * 100) / 100; // 保留两位小数
            }
        },
        mounted() {
            /*this.$nextTick(function () {
                this.drawChart();
            });*/
        }
    };
</script>

<style scoped lang="sass">
    .Mcontainer
        height: 220px
</style>
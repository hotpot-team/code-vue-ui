<template>
    <div id="container"></div>
</template>

<script>
    import echarts from 'echarts';

    Date.prototype.Format = function (fmt) { //
        var o = {
            "M+": this.getMonth() + 1, //Month
            "d+": this.getDate(), //Day
            "h+": this.getHours(), //Hour
            "m+": this.getMinutes(), //Minute
            "s+": this.getSeconds(), //Second
            "q+": Math.floor((this.getMonth() + 3) / 3), //Season
            "S": this.getMilliseconds() //millesecond
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() +

            "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1,

                (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    };


    export default {
        name: "thread-chart",
        props: ['chartData', 'timeData'],
        data() {
            return {
                liveData: [],
                daemonData: [],
                times: []
            };
        },
        watch: {
            chartData: function (val) {
                if (val) {
                    let len = val[0].contain.length;
                    if (len < 10) {
                        this.liveData = val[0].contain;
                        this.daemonData = val[1].contain;
                    } else {
                        this.liveData = val[0].contain.slice(len - 10);
                        this.daemonData = val[1].contain.slice(len - 10);
                    }
                    this.drawChart('container');
                }
            },
            timeData: function (val) {
                if (val) {
                    let len = val.length
                    if (len <= 10) {
                        this.times = this.formatTime(val);
                    } else {
                        this.times = this.formatTime(val.slice(len - 10));
                    }
                    this.drawChart('container');
                }

            },
        },
        methods: {
            formatTime(times) {
                // item.eventDate.timestamp = new Date(item.eventDate.timestamp).Format("dd/MM/yyyy hh:mm:ss");
                let result = [];
                for (let i = 0; i < times.length; i++) {
                    let time = new Date(times[i]).Format('hh:mm:ss');
                    result.push(time);
                }
                return result;
            },
            drawChart(id) {
                this.chart = echarts.init(document.getElementById(id));
                // 皮肤添加同一般使用方式
                this.chart.hideLoading();
                this.chart.setOption({
                    color: [
                        "#d48265",
                        "#91c7ae",
                        "#749f83",
                        "#ca8622",
                    ],
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'cross',
                            label: {
                                backgroundColor: '#6a7985'
                            }
                        }
                    },
                    legend: {
                        data: ['live', 'daemon']
                    },
                    toolbox: {
                        feature: {}
                    },
                    grid: {
                        y:30,
                        y2:60
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

                        }
                    ],
                    series: [
                        {
                            name: 'live',
                            type: 'line',
                            areaStyle: {normal: {}},
                            data: this.liveData
                        },
                        {
                            name: 'daemon',
                            type: 'line',
                            areaStyle: {normal: {}},
                            data: this.daemonData
                        }
                    ]
                });
                this.chart.resize();
            }
        },
        mounted() {
            this.$nextTick(function () {
                this.drawChart('container');
            });
        }
    };
</script>

<style scoped lang="sass">
    #container
        height: 220px
</style>
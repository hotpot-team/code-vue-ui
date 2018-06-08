<style lang="scss">
    .framework-config {
        padding: 16px;
        .framework-list {
            display: flex;
            flex-direction: row;
            flex-wrap: nowrap;

            .framework{
                width: 160px;
                height: 160px;
                border: 1px solid #dddee1;
                margin-right: 16px;
                &.checked{
                    border: 1px solid red;
                }

                .demo{
                    height: 30px;
                    border: 1px solid #ddd;
                    display: inline-block;
                    &:nth-child(odd){
                        background-color: #5cadff;
                    }
                    &:nth-child(even){
                        background-color: #2d8cf0;
                    }
                }

                .demo-column{
                    width: 144px;
                }

                .demo-row{
                    width: 66px;
                    margin-left: 8px;
                }

                .demo-tab{
                    padding: 8px;
                    span{
                        margin: 0 4px;
                        &:nth-child(1){
                            color: #2d8cf0;
                        }
                    }
                }
            }
        }
        .framework-footer{
            margin-top: 60px;
            text-align: center;
        }
    }
</style>
<template>
    <div class="framework-config">
        <div class="framework-list">
            <div :class="item.checked?'framework checked': 'framework'" v-for="(item, index) in panelList" :key="index" @click="selectPanel(index)">
                {{item.name}}
                <Input v-if="item.type === 'row'" v-model="item.width" style="padding: 8px" placeholder="300px | 50%">
                    <span slot="prepend">width:</span>
                </Input>
                <div style="text-align: center; margin-top: 16px" v-if="item.type === 'column'">
                    <div class="demo demo-column" v-for="item in [1,2,3]"></div>
                </div>
                <div style="margin-top: 6px" v-if="item.type === 'row'">
                    <div class="demo demo-row" v-for="item in [1,2,3,4]"></div>
                </div>
                <div class="demo-tab" v-if="item.type === 'tab'">
                    <span>标签一</span><span>标签二</span><span>标签三</span>
                    <div style="height: 1px;width: 42px;border: 1px solid #2d8cf0;"></div>
                    <div style="height: 1px;width: 100%;border: 1px solid #ddd;margin-bottom: 8px"></div>
                    <p>xxxxxxxxxxxx</p>
                    <p>xxxxxxxxxx</p>
                </div>
            </div>
        </div>
        <div class="framework-footer">
            <Button type="primary" @click="save">保存</Button>
        </div>
    </div>
</template>
<script>
    import {mapGetters} from 'vuex';
    export default {
        data(){
            return{
                config: null,
                configMenuId: this.$route.query.menuId, // 菜单Id
                panelList: [{
                    name: '垂直排列',
                    type: 'column',
                    checked: false
                },{
                    name: '横向排列',
                    type: 'row',
                    checked: false,
                    width: ''
                },{
                    name: '标签页',
                    type: 'tab',
                    checked: false
                }]
            };
        },
        created() {
            this.$store.dispatch('getConfig', this.uiVersion).then(() => {
                this.config = this.uiConfigData[this.configMenuId];
                if (this.config && this.config.tableMappingName === 'framework') {
                    let fconfig = this.config.tabConfigData;
                    this.panelList.forEach((p, index)=>{
                        if (fconfig.type === p.type){
                            this.panelList.splice(index, 1, JSON.parse(JSON.stringify(fconfig)));
                        }
                    });
                }
            });
        },
        components: {
        },
        computed: {
            ...mapGetters([
                'uiConfigData',
                'uiVersion'
            ])
        },
        methods:{
            selectPanel(index){
                this.panelList.forEach((p)=>{
                    p.checked = false;
                });
                this.panelList[index].checked = true;
            },
            save(){
                this.panelList.forEach((p)=>{
                    if (p.checked) {
                        let data = {
                            id: this.configMenuId,
                            tabConfigData:  JSON.stringify(p),
                            tableMappingName: 'framework'
                        };
                        this.$store.dispatch('saveConfig',  JSON.stringify(data)).then(() => {
                            this.$Message.success('数据保存成功!');
                        });
                    }
                });
            }
        },
        watch: {
            '$route'(to) {
                this.configMenuId = to.query.menuId;
            },
            configMenuId: function (val, oldVal) {
                this.config = null;
                this.$nextTick(() => {
                    this.config = this.uiConfigData[val];
                });
            }
        }
    };
</script>
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
                if (this.config) {
                    this.panelList.forEach((p, index)=>{
                        if (this.config.type === p.type){
                            this.panelList.splice(index, 1, JSON.parse(JSON.stringify(this.config)));
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
                        this.uiConfigData[this.configMenuId] = p;
                        this.$store.dispatch('saveConfig',  JSON.stringify(this.uiConfigData).replace(/"([^"]*)"/g, "'$1'")).then(() => {
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
<style lang="scss">
    .framework-config {
        padding: 16px;
        .framework-list {
            @include compatibleFlex;
            @include flex-direction(row);
            flex-wrap: nowrap;
            -ms-flex-wrap: nowrap;
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
                <div class="demo-tab" v-if="item.type === 'drag'">
                    <Button @click="adddrag">配置</Button>
                </div>
            </div>
        </div>
        <div class="framework-footer">
            <Button type="primary" @click="save">保存</Button>
        </div>
        <Modal
                v-model="dragmodal"
                width="700px"
                title="动态页配置">
            <template>
                <div  class="list-draggable">
                    <draggable  v-model="formDynamic" :options="dragOptions1" style="min-height: 30px">
                        <div  v-for="(item, index) in formDynamic" :key="index">{{item}}</div>
                    </draggable>
                </div>
                <div class="list-transition-group">
                    <div v-for="(item,index) in list2" :key="index" >
                        <draggable v-model="item.divConfig" :options="dragOptions" class="list-item-flex" >
                            <div v-for="(element,n) in item.divConfig" :key="n">
                                <Input type="text"></Input>
                            </div>
                        </draggable>
                    </div>
                    <Button type="dashed"  @click="Adddiv" icon="plus-round" class="add-div">Add Div</Button>
                </div>
            </template>
            <div slot="footer">
                <Button @click="Submit">提交</Button>
            </div>
        </Modal>
    </div>
</template>
<script>
    import {mapGetters} from 'vuex';
    import draggable from 'vuedraggable';
    export default {
        components: {
            draggable,
        },
        data(){
            return{
                dragmodal:false,
                config: null,
                configMenuId: this.$route.query.menuId, // 菜单Id
                panelList: [
                    {
                        name: '垂直排列',
                        type: 'column',
                        checked: false
                    },
                    {
                        name: '横向排列',
                        type: 'row',
                        checked: false,
                        width: ''
                    },
                    {
                        name: '标签页',
                        type: 'tab',
                        checked: false
                    },
                    {
                        name:'动态页',
                        type:'drag',
                        checked: false,
                        draggableDate:[],
                    }
                ],
                //动态页配置参数
                formDynamic:[],
                list2:[
                    {
                        divConfig:[]
                    }
                ],
                editable:true,
            };
        },
        created() {
            let menu = this.$store.getters.getMenuById(this.$route.query.menuId);
            this.formDynamic=menu.children.map((item)=>{
                return item.id;
            });
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
        computed: {
            ...mapGetters([
                'uiConfigData',
                'uiVersion'
            ]),
            dragOptions1 () {
                return  {
                    animation: 0,
                    Required:true,
                    group: 'description',
                    disabled: !this.editable,
                    ghostClass: 'ghost'
                };
            },
            dragOptions () {
                return  {
                    animation: 0,
                    Required:true,
                    group: 'description',
                    disabled: !this.editable,
                    ghostClass: 'ghost'
                };
            },
        },
        methods:{
            //添加div
            Adddiv(){
                this.list2.push({
                    divConfig:[],
                });
            },
            //提交
            Submit(){
                this.panelList[3].draggableDate=[...this.list2];
                this.dragmodal=false;
            },
            adddrag(){
                this.dragmodal=true;
                this.list2=[...this.panelList[3].draggableDate];
                let draglist =[];
                let arrtmp = [];
                for(let i=0;i<this.list2.length;i++){
                    this.list2[i].divConfig.map((item)=>{arrtmp.push(item)});
                }
                for(let j=0;j<this.formDynamic.length;j++){
                    if(!arrtmp.includes(this.formDynamic[j])){
                        draglist.push(this.formDynamic[j]);
                    }
                }
                this.formDynamic=draglist;
            },
            //跳转到draggable.vue页面
//            ropush() {
//                this.$router.push('/main/drag');
//            },
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
            },
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
            },
        }
    };
</script>
<style>
    .inline {
        display: inline-block;
    }

    .m-l-lg {
        margin-left: 30px
    }

    .wrapper {
        padding: 15px
    }

    .inline-block {
        display: inline-block;
    }

    .padder-sm {
        padding-right: 10px;
        padding-left: 10px
    }

    .ghost {
        opacity: 0.5;
        background: #c8ebfb;
    }

    .form-list-group {
        min-height: 200px;
        padding: 20px !important;
    }

    /* 设置items下所有鼠标样式为 move */

    .items,
    .items * {
        cursor: move;
    }

    /* 配置按钮默认位置 */

    /* 例如P Hr Title按钮 */

    .items .item-icon {
        transition: all 2s ease;
        position: absolute;
        top: -18px;
        right: 0px;
        opacity: 0;
        max-height: 0;
        overflow: hidden;
    }

    /* form控件下配置按钮位置 */

    .ivu-form-item.items .item-icon {
        top: -25px;
    }

    /* 配置按钮样式 */

    .item-icon i {
        cursor: pointer !important;
        margin-right: 5px;
    }

    .items:hover .item-icon {
        transition: inherit;
        opacity: 1;
        max-height: 50px;
    }

    /* 提交按钮下方无 margin-bottom */

    .form_content .ivu-form-item:last-child {
        margin-bottom: 0;
    }


    /* 表单校验选项样式 */
    .items.sortable-items-required .ivu-form-item-label:before {
        content: '*';
        display: inline-block;
        margin-right: 4px;
        line-height: 1;
        font-family: SimSun;
        font-size: 12px;
        color: #ed3f14;
    }

</style>
<style lang="scss" scoped>
    .list-draggable{
        height: 324px;
        width: 324px;
        border: 1px solid #c3c3c3;
        margin: 0px 0px 0px 10px;
    }
    .list-transition-group{
        width: 324px;
        height: 324px;
        border: 1px solid #c3c3c3;
        margin: -324px 0px 0px 334px;
        @include compatibleFlex;
        @include flex-direction(column);
    }
    .list-item-flex{
        min-height: 30px;
        @include compatibleFlex;
        border-bottom: 1px dashed gold;
        &>div{
            flex-grow: 1;
        }
    }
    .add-div{
        @include flex-direction(column);
        margin: 10px 100px 0px 110px;
    }

    ivu-modal-wrap * {
        flex: 1;
        box-sizing: border-box;
        -webkit-tap-highlight-color: transparent;
    }
</style>
<style lang="scss" scoped>
    .person-select-content {
        display: flex;
        justify-content: space-between;
        .left-content, .right-content {
            height: 100%;
            display: inline-block;
            width: 248px;
            .person-list {
                height: 100%;
                &.left {
                    margin-top: 8px;
                    height: calc(100% - 38px);
                    .person-page {
                        margin-top: 4px;
                        display: flex;
                        justify-content: space-between;
                        line-height: 24px;
                    }
                    .person-search {
                        padding: 4px 4px;
                        border: 1px solid #dddee1;
                        border-top: none;
                    }
                }
            }
            .result-list {
                border: 1px solid #dddee1;
                margin-top: 72px;
                padding: 4px;
                overflow: auto;
                ul {
                    li {
                        padding: 0 8px 2px 8px;
                        white-space:nowrap;
                        &.active {
                            background-color: #ebf7ff;
                        }
                        &:hover {
                            cursor: pointer;
                        }
                        i{
                            font-size: 16px;
                            vertical-align: text-bottom;
                            margin-right: 3px;
                            color: #5cadff;
                        }
                    }
                }
            }
        }
        .control {
            display: flex;
            flex-direction: column;
            margin: auto 0;
            .control-btn {
                margin-bottom: 8px;
            }
        }
    }
</style>
<style lang="scss">
    .person-select-content{
        .person-list{
            .ivu-tabs-bar{
                margin: 0;
                .ivu-tabs-nav-container{
                    height: auto;
                    .ivu-tabs-tab{
                        font-size: 14px;
                        padding: 4px 10px;
                    }
                }
            }
            .ivu-table-wrapper{
                border-top: none;
                .ivu-table-small{
                    td{
                        height: 26px;
                        border: none;
                        min-width: auto;
                        .ivu-table-cell{
                            padding: 0;
                        }
                        &:last-child{
                            .ivu-table-cell{
                                padding-right: 10px;
                            }
                        }
                        &:first-child{
                            .ivu-table-cell{
                                padding-left: 10px;
                                text-overflow: clip;
                            }
                        }
                    }
                }
            }
            .el-tree{
                border: 1px solid #dddee1;
                border-top: none;
                height: 100%;
                overflow: auto;
            }
        }
        .el-loading-spinner .circular {
            height: 24px;
            width: 24px;
        }
    }

</style>
<template>
    <div><Button type="info" @click="haha">test</Button></div>
</template>
<script>
        export default {
        created() {
        },
        data() {
            return{}
        },
        methods:{
            haha(){
//                this.$parent.search();
                this.$emit('refreshTable');
            }
        }
    };
</script>
<template>
    <div style="padding: 12px;">
        <Form ref="formInline"  inline :label-width="60" :model="tableItem">
            <FormItem label="文件名称">
                <Input type="text" v-model="tableItem.filename" ></Input>
            </FormItem>
            <FormItem label="上传时间">
                <Row>
                    <DatePicker type="datetime" v-model="tableItem.starttime" ></DatePicker> ~
                    <DatePicker type="datetime" v-model="tableItem.endtime"></DatePicker>
                </Row>
            </FormItem>
            <FormItem>
                <Button  @click="clearItem">清空</Button>
                <Button type="primary" @click="gettabledata">查询</Button>
            </FormItem>
        </Form>
        <Table :columns="filecolumns" :data="tableData"></Table>
        <div style="margin: 16px 0;text-align: right;">
            <Page :total="this.pageParms.totalElements"  show-sizer show-total @on-change="pageChange" @on-page-size-change="pageSizeChange"></Page>
        </div>
    </div>
</template>

<script>
    import fileServer from '../../../libs/fileServer';
    import Util from '../../../libs/util';
    export default {
        name: 'fileMag',
        data(){
            return {
                filecolumns: [
                    {
                        title: '文件名称',
                        key: 'fileName'
                    },
                    {
                        title: '文件类型',
                        key: 'fileType'
                    },
                    {
                        title: '文件大小',
                        key: 'fileSize'
                    },
                    {
                        title: '存储路径',
                        key: 'filePath'
                    },
                    {
                        title: '上传时间',
                        key: 'createdAt'
                    },
                    {
                        title: '是否删除',
                        key: 'delFlag',
                        render: (h, params) => {
                            if (params.row.delFlag =='0') {
                                return h('div', '否');
                            }else {
                                return h('div', '是');
                            }
                        }
                    },
                ],
                tableData:[],
                tableItem:{
                    filename:'',
                    starttime:'',
                    endtime:''
                },
                pageParms: {
                    pageIndex: 1,
                    pageSize: 10,
                    totalElements:0
                },
            };
        },
        created(){
            fileServer.fileList({
                collection: {
                    filters: [{
                        field: 'appId',
                        operator: 'EQ',
                        value: Util.appId
                    }]
                },
                pageParms: {
                    pageIndex: 1,
                    pageSize: 10
                }
            }).then((res)=>{
                this.tableData = res.data.data;
                this.pageParms.totalElements =res.data.totalElements;
            });
        },
        methods: {
            gettabledata() {
                let req = {
                    collection: {
                        filters: [
                            {
                                field: 'appId',
                                operator: 'EQ',
                                value: '8b376f64d21f474d856916ce0922fb35'
                            },
                            {
                                field: 'fileName',
                                operator: 'LIKE',
                                value: this.tableItem.filename
                            }
                        ]
                    },
                    pageParms: {
                        pageIndex: this.pageParms.pageIndex,
                        pageSize: this.pageParms.pageSize
                    }
                };
                if (this.tableItem.starttime) {
                    req.collection.filters.push({
                        field: 'createdAt',
                        operator: 'GTE',
                        value: this.tableItem.starttime.dateFormat('yyyy-MM-dd hh:mm:ss')
                    });
                }
                if (this.tableItem.endtime) {
                    req.collection.filters.push({
                        field: 'createdAt',
                        operator: 'LTE',
                        value: this.tableItem.endtime.dateFormat('yyyy-MM-dd hh:mm:ss')
                    });
                }
                fileServer.fileList(req).then((res) => {
                    this.tableData = res.data.data;
                    this.pageParms.totalElements = res.data.totalElements;
                });
            },
            pageChange (index) {
                this.pageParms.pageIndex = index;
                this.gettabledata();
            },
            pageSizeChange (size) {
                this.pageParms.pageSize = size;
                this.gettabledata();
            },
            clearItem(){
                this.tableItem.starttime = '';
                this.tableItem.filename = '';
                this.tableItem.endtime='';
                this.gettabledata();
            }
        }
    };
</script>

<style scoped>

</style>
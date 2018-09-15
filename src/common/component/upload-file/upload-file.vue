<template>
    <Upload :action="uploadUrl" :default-file-list="fileList" name="file" ref="titanFile" :headers="headers" :on-success="handleSuccess" :on-error="handleError" class="titan-file" :before-upload="beforeUpload" :on-preview="previewFile" :on-remove="removeFile">
        <Button type="ghost" icon="ios-cloud-upload-outline">Upload files</Button>
    </Upload>
</template>

<script>
    import fileServer from '../../../libs/fileServer';
    export default {
        data(){
            return {
                headers: null,
                uploadUrl: fileServer.serverUrl
            };
        },
        props:{
            value:{
                type:String,
                default:''
            },
            fileId: {
                type: String,
                default: ''
            }
        },
        created(){
            fileServer.getToken().then((header)=>{
                this.headers = header;
            });
        },
        computed:{
          fileList:function () {
              if (this.value && this.fileId) {
                return [{
                    name: this.value,
                    fileId: this.fileId
                }];
              }
              return [];
          }
        },
        methods:{
            beforeUpload(file){
                this.$refs['titanFile'].clearFiles();
            },
            removeFile(file, fileList){
                this.$emit('update:fileId', '');
                this.$emit('input', '');
                this.emitValidate('');
            },
            emitValidate(value) {
                if (this.$parent.$options.name === 'FormItem') {
                    this.$parent.$emit.apply(this.$parent, ['on-form-change']);
                }
            },
            previewFile(file){
                if (file && file.response) {
                    fileServer.downloadFile(file.response.titanFile.id, file.name);
                    // this.download(util.server.downloadFile + file.response.titanFile.id, file.name);
                } else if (file.fileId) {
                    // this.download(util.server.downloadFile + file.fileId, file.name);
                    fileServer.downloadFile(file.fileId, file.name);
                }
            },
            handleSuccess(response, file, fileList){
                if (response && response.titanFile) {
                    this.$emit('update:fileId', response.titanFile.id);
                    this.$emit('input', file.name);
                    this.emitValidate(file.name);
                } else {
                    this.$emit('update:fileId', '');
                    this.$emit('input', '');
                    this.$refs['titanFile'].clearFiles();
                    this.$Message.error(response.message);
                }
            },
            handleError(error, response, fileList){
                this.$Message.error(response.message);
                this.$emit('update:fileId', '');
                this.$emit('input', '');
                this.$refs['titanFile'].clearFiles();
            }
        }
    };
</script>

<style lang="scss">
    .titan-file.ivu-upload{
        @include compatibleFlex;
        @include flex-direction('row-reverse');
        .ivu-upload.ivu-upload-select{
            line-height: 1;
            .ivu-btn.ivu-btn-ghost{
                border-bottom-left-radius: 0px;
                border-top-left-radius: 0px;
                border-left: 0;
                &:hover{
                    border-color: #d1dbe5;
                }
            }
        }
        .ivu-upload-list{
            margin: 0;
            border: 1px solid #d1dbe5;
            border-radius: 4px;
            border-bottom-right-radius: 0px;
            border-top-right-radius: 0px;
            height: 32px;
            width: calc(100% - 112px);
            &:hover{
                border-color: #57a3f3;
                cursor: pointer;
            }

            li.ivu-upload-list-file {
                padding: 4px 7px;
                line-height: 1.5;
                &:hover{
                    background-color: transparent;
                }
                span,i{
                    line-height: 22px;
                }
            }
        }

    }

    .ivu-form-item-error {
        .titan-file {
            .ivu-upload-list{
                border: 1px solid #ed3f14;
                &:hover{
                    border-color: #ed3f14;
                }
            }
        }
    }

</style>
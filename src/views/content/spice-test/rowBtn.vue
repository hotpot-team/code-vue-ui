<template>
    <Button type="info" size="small" @click="handleClick">行按钮</Button>
</template>
<script>
    export default {
        created() {
        },
        data() {
            return{
            };
        },
        methods:{
            handleClick(){
                this.$Message.info(JSON.stringify(this.parentData)); //获取当前行数据
                this.$emit('refreshTable'); //刷新表格
            }
        }
    };
</script>
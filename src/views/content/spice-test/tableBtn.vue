<template>
    <Button type="success" @click="handleClick">自定义按钮</Button>
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
                this.$Message.info(JSON.stringify(this.parentData)); //获取当前页面数据
                this.$emit('refreshTable'); //刷新表格
            }
        }
    };
</script>
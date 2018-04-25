<template>
    <Button type="success" @click="handleClick">按钮</Button>
</template>
<script>
    export default {
        created() {
        },
        props: ['parentData'],
        data() {
            return{
            }
        },
        methods:{
            handleClick(){
                this.$Message.info("点击了按钮");
                this.$emit('refreshTable');
            }
        }
    };
</script>
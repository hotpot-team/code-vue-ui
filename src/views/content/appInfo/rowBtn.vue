<template>
    <Button type="info" @click="handleClick">行按钮</Button>
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
                this.emit('refreshTable');
            }
        }
    };
</script>
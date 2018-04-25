<style>
</style>
<template>
    <div style="min-height: 800px">
        <iframe :src="parent_src||src" frameborder="0" width="100%" height="100%" style="min-height: 800px"></iframe>
    </div>
</template>
<script type="text/ecmascript-6">
    export default {
        data(){
            return{
                src: this.$route.query.src
            };
        },
        props:{
            parent_src: String,
        },
        created() {
        },
        methods:{
        },
        watch: {
            '$route' (to) {
                this.src = to.query.src;
            }
        }
    };
</script>
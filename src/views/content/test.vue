<template>
    <!--<person-input @on-selection-data="test"></person-input>-->
    <div>{{user}}</div>
</template>
<script>
    export default {
        created() {
            this.user = this.$store.getters.loginInfo;
            for (let key in this.user) {
                console.log(key);
            }
        },
        data() {
            return{
                user: {}
            }
        },
        methods:{
            haha(){
//                this.$parent.search();
                this.$emit('refreshTable');
            },
            test(data){
                console.log(data);
            }
        }
    };
</script>
<style lang="scss" scoped>
    .footer{
        text-align: center;
    }
</style>
<template>
    <div>
        <form-show :config="config" ref="childForm"></form-show>
        <div class="footer">
            <Button type="ghost" @click="clearForm">清空</Button>
            <Button type="primary" @click="handleSubmit">提交</Button>
        </div>
    </div>
</template>
<script>
import FormShow from './form-showExt.vue';
export default {
    data() {
        return {
        };
    },
    components: {
        'form-show': FormShow
    },
    props: ['config'],
    created(){
    },
    methods: {
        handleSubmit() {
            this.$refs['childForm'].insertData().then((data) => {
                if (data === 200) {
                }
            });
        },
        clearForm() {
            this.$refs['childForm'].clearData();
        }
    }
};
</script>

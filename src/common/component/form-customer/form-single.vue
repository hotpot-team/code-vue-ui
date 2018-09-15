<style lang="scss" scoped>
    .footer{
        text-align: center;
    }
</style>
<template>
    <div class="form-single">
        <form-show :config="config" ref="childForm" :singleClass="singleClass"></form-show>
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
    props: {
        config: {
            type: Object
        },
        singleClass:{
            type: String,
            default: 'single'
        }
    },
    created(){
    },
    mounted(){
        if (this.config.pathmag.detail && this.config.pathmag.detail.uri) {
            let url = this.config.pathmag.detail.uri;
            let arrayParam = url.match(new RegExp('(\\w+?)(?=})', 'g'));
            if (!arrayParam || arrayParam.length === 0) {
                this.$refs['childForm'].getData({});
            }
        }
    },
    methods: {
        handleSubmit() {
            this.$refs['childForm'].insertData().then((data) => {
                data==200;
            });
        },
        clearForm() {
            this.$refs['childForm'].clearData();
        }
    }
};
</script>

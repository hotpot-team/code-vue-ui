<style lang="scss" scoped>
</style>
<template>
    <Button v-if="show" :type="type" :shap="shape" :size="size" :loading="loading" :disabled="disabled" :htmlType="htmlType" :icon="icon" :long="long"  @click="handleClick"><slot></slot></Button>
</template>
<script>
    export default {
        props:{
            menuId: String,
            type: String,
            shape: String,
            size: String,
            loading: Boolean,
            disabled: Boolean,
            htmlType: {
                default: 'button'
            },
            icon: String,
            long: {
                type: Boolean,
                default: false
            }
        },
        data(){
            return {
                show: false
            };
        },
        created() {
            if (!this.menuId) {
                this.show = true;
            } else if (this.$store.getters.menuIdList.indexOf(this.menuId) > -1) {
                this.show = true;
            }
        },
        methods: {
            handleClick (event) {
                this.$emit('click', event);
            }
        }
    };
</script>

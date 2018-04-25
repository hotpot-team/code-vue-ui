<style lang="scss" scoped>
</style>
<template>
    <div>
        <ul v-for="node in data" class="ivu-menu ivu-menu-dark ivu-menu-vertical" style="width: 240px">
            <MenuNode :node="node" v-if="node.isMenu === 'Y'"></MenuNode>
        </ul>
    </div>
</template>
<script>
    import MenuNode from './menu-node';
    export default {
        components: {MenuNode},
        props:{
            data: {
                type: Array,
                default () {
                    return [];
                }
            }
        },
        data(){
            return {

            };
        }
    };
</script>
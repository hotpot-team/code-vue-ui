<template>
    <div class="panel-group">
        <Tabs type="card">
            <TabPane label="应用实例">
                <ins-index></ins-index>
            </TabPane>
        </Tabs>
    </div>
</template>

<script>
    import insIndex from './sba/instance/index'

    export default {
        name: "sba",
        components:{
            insIndex
        }
    };
</script>

<style scoped>
    .panel-group{
        padding: 16px;
    }
</style>
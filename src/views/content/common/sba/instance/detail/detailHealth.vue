<template>
    <Row>
        <Col span="24">
        <Card dis-hover>
            <p slot="title">Health</p>
            <div v-if="error" class="message is-danger">
                <div class="message-body">
                    <strong>
                        <Icon class="has-text-danger" type="alert"/>
                        Fetching health failed.
                    </strong>
                    <p v-text="error.message"/>
                </div>
            </div>
            <p>
                <health-detail :health="health" name="Instance" v-if="health"></health-detail>
            </p>
        </Card>
        </Col>
    </Row>
</template>

<script>
    import healthDetail from './healthDetail';

    export default {
        name: "detail-health",
        components: {
            healthDetail
        },
        props:{
            healthMessage:{
                type:Object,
                required:true
            }
        },
        data() {
            return {
                hasloaded: false,
                health: null,
                error:null,
            };
        },
        created() {
            this._fecthHealth();
        },
        methods: {
            _fecthHealth() {
                try{
                    this.health = this.healthMessage;
                }catch (error){
                    this.error=error;
                    console.warn('Fetching health failed:', error);
                }
                this.hasloaded = true;
            }
        }
    };
</script>

<style scoped>

</style>
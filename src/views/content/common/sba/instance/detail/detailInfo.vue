<template>
    <Row>
        <Col span="24">
        <Card v-if="info" dis-hover>
            <p slot="title">Info</p>
            <div v-if="error" class="message is-danger">
                <div class="message-body">
                    <strong>
                        <Icon class="has-text-danger" type="alert"/>
                        Fetching info failed.
                    </strong>
                    <p v-text="error.message"/>
                </div>
            </div>
            <p>
            <table class="table-set">
                <tr v-for="(value,key) in info" :key="key">
                    <td v-text="key"></td>
                    <td>
                        <div v-text="value"></div>
                    </td>
                </tr>
            </table>
            </p>
        </Card>
        </Col>
    </Row>
</template>

<script>
    export default {
        name: "detail-info",
        props: {
            infoMessage:{
                type:Object,
                required:true
            }
        },
        data() {
            return {
                info: null,
                error: null,
            };
        },
        created() {
            this.initInstance();
        },
        methods: {
            initInstance() {
                this.info=this.infoMessage;
            }
        }
    };
</script>

<style scoped lang="sass">
    .table-set
        width: 100%
        text-align: left
        tr
            height: 30px
</style>
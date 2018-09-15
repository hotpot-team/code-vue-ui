<template>
    <Row v-if="metadata">
        <Col span="24">
        <Card dis-hover>
            <p slot="title">Metadata</p>
            <p>
            <table class="table-set" v-if="isEmptyMetadata">
                <tr v-for="(value,key) in metadata">
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
        props: {
            metaMessage: {
                type: Object,
                required: true
            }
        },
        data() {
            return {
                metadata: null,
                isEmptyMetadata: true
            };
        },
        created() {
            this._fetchMeta();
        },
        methods: {
            _fetchMeta() {
                if (Object.keys(this.metaMessage).length <= 0) {
                    this.isEmptyMetadata = false;
                } else {
                    this.metadata = this.metaMessage;
                }
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
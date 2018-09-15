<template>
    <div>
        <table class="table-set">
            <tr v-if="health">
                <th colspan="2" >
                    <span v-text="name" class="beLeft"></span>
                    <span v-text="health.status" class="health-details__status"
                          :class="`health-details__status--${health.status}`"></span>
                </th>
            </tr>

            <tr v-if="details && details.length > 0">
                <td colspan="2" class="health-details__nested">
                    <table class="table-set">
                        <tr v-for="detail in details" :key="detail.name">
                            <td v-text="detail.name" class="beLeft"/>
                            <td v-if="name === 'diskSpace'" v-text="formatBytes(detail.value)"/>
                            <td v-else v-text="detail.value"/>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr v-for="child in childHealth" :key="child.name">
                <td colspan="2" class="health-details__nested">
                    <health-detail :name="child.name" :health="child.value"/>
                </td>
            </tr>
        </table>
    </div>
</template>

<script>
    import _ from 'lodash';

    const isChildHealth = (value) => {
        return value !== null && typeof value === 'object' && value.hasOwnProperty('status');
    }

    export default {
        name: "health-detail",
        props: {
            health: {
                type: Object,
                required: true
            },
            name: {
                type: String,
                required: true
            }
        },
        methods:{
            //流量 单位换算
            formatBytes(size) {
                var units = [ ' B',' KB', ' MB', ' GB', ' TB'];
                for (var i = 1; size >= 1024 && i < 4; i++) { // i = 1 表示传入size的最小单位为KB
                    size /= 1024;
                }
                return Math.floor(size*100)/100 + units[i-1]; // 保留两位小数
            },
        },
        computed: {
            details() {
                if (this.health.details) {
                    return _.entries(this.health.details)
                        .filter(([, value]) => !isChildHealth(value))
                        .map(([name, value]) => ({name, value}));
                }
                return [];
            },
            childHealth() {
                if (this.health.details) {
                    return _.entries(this.health.details)
                        .filter(([, value]) => isChildHealth(value))
                        .map(([name, value]) => ({name, value}));
                }
                return [];
            }
        }
    };
</script>

<style scoped lang="sass">
    @import '../../sba'

    .beLeft
        float: left

    td.health-details__nested
        padding: 0 0 0 0.75em

    td.health-details__nested
        border-bottom: 0

    .health-details__nested .table-set
        margin-bottom: 0.5em

    .table-set
        width: 100%
        text-align: left
        tr
            height: 30px

    .health-details__status
        float: right
        &--UP
            color: $success
        &--RESTRICTED
            color: $warning
        &--OUT_OF_SERVICE,
        &--DOWN
            color: $danger
        &--UNKNOWN,
        &--OFFLINE
            color: $grey
</style>
<template>
    <timesba :date="date"></timesba>
</template>

<script>
    import timesba from './defineTime';

    export default {
        name: "sba-time",
        components: {
            timesba
        },
        props: {
            date: {
                type: null,
                default: null
            }
        }
    };
</script>

<style scoped>

</style>
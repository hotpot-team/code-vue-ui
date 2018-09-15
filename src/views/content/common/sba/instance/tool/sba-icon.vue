<template>
    <Icon :type="icon" :color="color"/>
</template>

<script>

    const icons = {
        'UP': 'checkmark',
        'RESTRICTED': 'alert',
        'OUT_OF_SERVICE': 'close',
        'DOWN': 'clock',
        'OFFLINE': 'ios-minus',
        'UNKNOWN': 'help'
    };
    export default {
        name: "sba-icon",
        props:{
            status: {
                type: String,
                default: 'UNKNOWN'
            },
        },
        computed:{
            icon(){
                return icons[this.status];
            },
            color(){
                if(this.status==='UP'){
                    return 'green';
                }else if(this.status==='RESTRICTED'){
                    return 'yellow';
                }else if(this.status==='OUT_OF_SERVICE'||this.status==='DOWN'){
                    return 'red';
                }else {
                    return 'grey';
                }
            }
        }
    };
</script>

<style scoped lang="sass">
    @import "../../sba"
    instance-statu
        &__icon
            color: gray
            &-UP
                color: $success
            &-RESTRICTED
                color: $warning
            &-OUT_OF_SERVICE,&-DOWN
                color: $danger
            &-OFFLINE,&-UNKNOWN
                color: $grey

</style>
<template>
    <div class="field is-grouped logger-control">
        <div class="control buttons has-addons">
            <button class="button logger-control__level" :class="cssClass(level)"
                    v-for="level in levelOptions" :key="level" v-text="level"
                    @click.stop="selectLevel(level)"/>
        </div>
        <div class="control">
            <Button ghost class="button is-light" :class="{ 'is-loading' : isLoading === null }"
                    :disabled="!configured || !allowReset" @click.stop="selectLevel(null)">
                Reset
            </Button>
        </div>
    </div>
</template>

<script>
    export default {
        props: {
            effectiveLevel: {
                type: String,
                required: true
            },
            configuredLevel: {
                type: String,
                default: null
            },
            levelOptions: {
                type: Array,
                required: true
            },
            allowReset: {
                type: Boolean,
                default: true
            },
            isLoading: {
                type: String,
                default: undefined
            }
        },
        computed: {
            level() {
                return this.configuredLevel || this.effectiveLevel;
            },
            configured() {
                return !!this.configuredLevel;
            }
        },
        methods: {
            selectLevel(level) {
                this.$emit('input', level);
            },
            cssClass(level) {
                return {
                    'logger-control__level--inherited': this.level === level && !this.configured,
                    'is-active is-danger': this.level === level && this.level === 'TRACE',
                    'is-active is-warning': this.level === level && this.level === 'DEBUG',
                    'is-active is-info': this.level === level && this.level === 'INFO',
                    'is-active is-success': this.level === level && this.level === 'WARN',
                    'is-active is-light': this.level === level && this.level === 'ERROR',
                    'is-active is-black': this.level === level && this.level === 'OFF',
                    'is-loading': this.isLoading === level
                };
            }
        }
    };
</script>

<style scoped lang="scss">
    .buttons{
        text-decoration: none;
        margin-right: 10px;
        .button{
            background-color: #fff;
            border:#ccc solid 1px;
            padding: .3rem 1rem;
            font-size: 12px;
        }
        .button:not(:first-child){
            margin-left: -2px;
        }
    }
    .field.is-grouped {
        display: -ms-flexbox;
        display: flex;
        -ms-flex-pack: start;
        justify-content: flex-start;
    }
    .is-pulled-right {
        float: right!important;
    }
    .logger-control {
        &__level {
            &--inherited {
                opacity: 0.5;
                &:hover {
                    opacity: 1;
            }
        }
    }
    }
    .is-active{
        &.is-info{
            background-color: #2d8cf0;
        }
        &.is-danger{
            background-color: #ff1f4b;
        }
        &.is-warning{
            background-color: #ffd83d;
        }
        &.is-success{
            background-color: #20bc56;
        }
        &.is-light{
            background-color: #ddd;
        }
        &.is-black{
            background-color: #111;
            color: #fff;
        }
        &.is-loading{
            background-color: coral;
        }
    }

    //'logger-control__level--inherited': this.level === level && !this.configured,
/*    'is-active is-danger': this.level === level && this.level === 'TRACE',
    'is-active is-warning': this.level === level && this.level === 'DEBUG',
    'is-active is-info': this.level === level && this.level === 'INFO',
    'is-active is-success': this.level === level && this.level === 'WARN',
    'is-active is-light': this.level === level && this.level === 'ERROR',
    'is-active is-black': this.level === level && this.level === 'OFF',
    'is-loading': this.isLoading === level*/
</style>
import moment from 'moment-shortformat';

export default {
    props: {
        date: {
            type: null,
            default: null
        }
    },
    data: () => ({
        now: moment.now(),
        timer: null,
    }),
    computed: {
        timeAgo() {
            return moment(this.date).short(true, this.now);
        }
    },
    created() {
        this.timer = window.setInterval(() => {
            this.now = moment.now();
        }, 1000);
    },
    render() {
        return this._v(this.timeAgo);
    },
    beforeDestroy() {
        if (this.timer) {
            window.clearInterval(this.timer);
        }
    }
}
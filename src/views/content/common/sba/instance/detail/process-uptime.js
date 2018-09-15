import subscribing from '../../utils/subscribing';
import {timer} from 'rxjs';
import moment from 'moment';

export default {
    props: ['value'],
    mixins: [subscribing],
    data: () => ({
        startTs: null,
        offset: null
    }),
    render() {
        return this._v(this.clock);
    },
    computed: {
        clock() {
            if (!this.value) {
                return null;
            }
            const duration = moment.duration(this.value * 1000 + this.offset);
            return `${Math.floor(duration.asDays())}d ${duration.hours()}h ${duration.minutes()}m ${duration.seconds()}s`;
        }
    },
    watch: {
        value: 'subscribe'
    },
    methods: {
        createSubscription() {
            if (this.value) {
                const vm = this;
                this.startTs = moment.now();
                this.offset = 0;
                return timer(0, 1000).subscribe({
                    next: () => {
                        vm.offset = moment.now().valueOf() - this.startTs.valueOf();
                    }
                });
            }
        }
    }
};
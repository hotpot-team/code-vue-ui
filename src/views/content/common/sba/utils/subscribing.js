export default {
    created() {
        this.subscribe();
    },
    beforeDestroy() {
        this.unsubscribe();
    },
    methods: {
        subscribe() {
            if (!this.subscription) {
                this.subscription =this.createSubscription();
            }
        },
        unsubscribe() {
            if (this.subscription) {
                try {
                    !this.subscription.closed && this.subscription.unsubscribe();
                } finally {
                    this.subscription = null;
                }
            }
        }
    }
};
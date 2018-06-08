//import zh from 'iview/dist/locale/zh-CN';

export default {
    methods: {
        t(...args) {
            return t.apply(this, args);
        }
    }
};

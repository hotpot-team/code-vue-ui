import axios from 'axios';
import env from '../config/env';

let rescenterDev = 'http://cmpuat.changan.com';
let rescenterTest= 'http://cmpuat.changan.com';
let rescenterPro = 'http://cmp.changan.com';

let url = env === 'development' ? rescenterDev : env === 'production' ? rescenterPro : rescenterTest;

const resUrl =  axios.create({
    baseURL: url,
    timeout: 3000000
});

export default resUrl;
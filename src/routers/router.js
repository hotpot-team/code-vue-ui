const routers = [{
    path: '/',
    name:'login',
    component: (resolve) => require(['../views/index.vue'], resolve)
}];
export default routers;
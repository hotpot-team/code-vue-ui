/**
 * Created by Administrator on 2017/10/12.
 */
const customRrouters = [{
    path: 'roleConfig/addRole',
    component: (resolve) => require(['../views/content/common/roleEdit/addRole.vue'], resolve),
    meta: {
        title: '哈哈哈'
    }
}];
export default customRrouters;
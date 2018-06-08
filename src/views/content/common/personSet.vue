<template>
    <div style="padding: 16px 0">
        <Form :label-width="100">
            <FormItem label="所属部门:">
                {{orgInfo.orgFullName}}
            </FormItem>
            <FormItem label="用户:">
                {{userInfo.userName}}
            </FormItem>
            <FormItem label="密码:">
                <span style="margin-right: 8px">******</span>
                <Button type="dashed" shape="circle" icon="ios-gear" @click="passwdCh"></Button>
            </FormItem>
        </Form>
        <Modal v-model="isPasswdChModal" title="修改密码" @on-ok="cfmPasswdChange">
            <Form :label-width="100">
                <FormItem label="原密码:">
                    <Input type="password" style="width: 70%" v-model="userChangeInfo.password"></Input>
                </FormItem>
                <FormItem label="新密码:">
                    <Input type="password" style="width: 70%" v-model="userChangeInfo.newPassword"></Input>
                </FormItem>
                <FormItem label="重复新密码:">
                    <Input type="password" style="width: 70%" v-model="userChangeInfo.newPasswordRep"></Input>
                </FormItem>
            </Form>
        </Modal>
    </div>
</template>
<script>
    export default {
        data: function () {
            return {
                userInfo: {},
                orgInfo: {},
                isPasswdChModal: false,
                userChangeInfo: {}
            };
        },
        methods:{
            getUserInfo: function () {
                this.$http.get('/security/user').then((res) => {
                    this.userInfo = res.data.hotpotUserSeniorDTO.hotpotUser;
                    this.orgInfo = res.data.hotpotUserSeniorDTO.hotpotOrganization;
                });
            },
            passwdCh () {
                this.isPasswdChModal = true;
                this.userChangeInfo = Object.assign({},this.userInfo);
                this.userChangeInfo.password = '';
                this.userChangeInfo.newPassword = '';
                this.userChangeInfo.newPasswordRep = '';
            },
            cfmPasswdChange () {
                this.$http.put('/security/password', {
                    hotpotUser: this.userChangeInfo,
                    newPassword: this.userChangeInfo.newPassword
                }).then(()=>{
                    this.$Message.info('修改成功');
                });
            }
        },
        created:function () {
            this.getUserInfo();
        }
    };
</script>
<style></style>
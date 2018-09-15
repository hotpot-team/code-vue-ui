<template>
    <div class="cardContainer">
        <Card dis-hover class="cardItem">
            <h3 slot="title">
                目标列表
            </h3>
            <Button slot="extra" type="info" @click="newMenus" style=" position: absolute;right: 0px; top: -8px;">新增</Button>
            <Tree ref="treeHere" :data="menuTree" ></Tree>
        </Card>
        <Card dis-hover class="cardItem">
            <h3 slot="title">功能详细信息</h3>
            <Breadcrumb style="margin-bottom: 16px">
                <BreadcrumbItem v-for="(item, index) in currentNodeBread.name" :key="index">{{item}}</BreadcrumbItem>
            </Breadcrumb>
            <Form ref="validtest" :model="currentNodeForm" :label-width="100" v-if="stats.tree.isSelecteOn" :rules="formValid">
                <FormItem label="类型">
                    <RadioGroup v-model="currentNodeForm.nodeType" @on-change="nodeTypeChange">
                        <Radio label="content" :disabled="stats.form.tmpData.nodeType !== ''|| !stats.form.isNewNode">目录</Radio>
                        <Radio label="menu" :disabled="stats.form.tmpData.nodeType === 'button'||!stats.form.isNewNode">菜单</Radio>
                        <Radio label="button" :disabled="!stats.form.isNewNode">按钮</Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem label="资源ID" v-show="!stats.form.isNewNode">
                    <Input v-model="currentNodeForm.id" disabled></Input>
                </FormItem>
                <FormItem label="资源名称" prop="functionName">
                    <Input v-model="currentNodeForm.functionName" :disabled="judgeConfForb"></Input>
                </FormItem>
                <FormItem label="资源编码" prop="code">
                    <Input v-model="currentNodeForm.code" :disabled="judgeConfForb"></Input>
                </FormItem>
                <FormItem label="菜单URL" v-if="!judgeContent" prop="url.path">
                    <Input v-model="currentNodeForm.url.path" :disabled="judgeConfForb"></Input>
                </FormItem>
                <FormItem label="是否有效" prop="enabled">
                    <RadioGroup v-model="currentNodeForm.enabled">
                        <Radio label="Y" :disabled="judgeConfForb">是</Radio>
                        <Radio label="N" :disabled="judgeConfForb">否</Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem label="显示方法" v-if="!judgeContent" prop="url.component">
                    <RadioGroup v-model="currentNodeForm.url.type" @on-change="urlTypeChange">
                        <Radio label="div" :disabled="judgeConfForb">div</Radio>
                        <Radio label="iframe" :disabled="judgeConfForb">iframe</Radio>
                    </RadioGroup>
                    <AutoComplete v-model="currentNodeForm.url.component" :disabled="judgeUrlType||judgeConfForb" >
                        <Option value="common/restShow.vue">
                            <span>接口列表配置</span>
                            <span style="float:right;">common/restShow.vue</span>
                        </Option>
                        <Option value="common/treeShow.vue">
                            <span>树形结构配置</span>
                            <span style="float:right;">common/treeShow.vue</span>
                        </Option>
                        <Option value="common/expertTable.vue">
                            <span>高级查询配置</span>
                            <span style="float:right;">common/expertTable.vue</span>
                        </Option>
                        <Option value="common/framework.vue">
                            <span>模板</span>
                            <span style="float:right;">common/framework.vue</span>
                        </Option>
                    </AutoComplete>
                </FormItem>
                <FormItem label="src" v-if="judgeUrlType" prop="url.url">
                    <Input v-model="currentNodeForm.url.url" :disabled="judgeConfForb"></Input>
                </FormItem>
                <FormItem label="动态表单配置" v-if="!judgeUrlType && judgeUrlComponent" prop="url.url">
                    <Input v-model="currentNodeForm.url.url" :disabled="judgeConfForb"></Input>
                </FormItem>
            </Form>
            <Form :model="currentNodeForm" :label-width="100" v-if="stats.tree.isSelecteOn">
                <FormItem label="打开方式" v-if="!judgeContent && !judgeButton">
                    <Select v-model="currentNodeForm.url.openMethod" :disabled="judgeConfForb">
                        <Option value="default" label="默认">默认</Option>
                        <Option value="modal" label="对话框">对话框</Option>
                        <Option value="pop" label="弹窗">弹窗</Option>
                    </Select>
                </FormItem>
                <FormItem label="图标">
                    <span style="margin-right: 24px" v-if="judgeImage">
                        <Icon :type="currentNodeForm.image1Id" style="font-size: 24px;vertical-align: middle;"></Icon>
                    </span>
                    <Button type="ghost" shape="circle" icon="plus-round" @click="iconPlus" v-if="!judgeImage"></Button>
                    <Button type="dashed" shape="circle" icon="trash-a" @click="iconTrash" v-if="judgeImage"></Button>
                </FormItem>
            </Form>
            <div class="formButtons" v-if="stats.tree.isSelecteOn">
                <Button type="error" v-if="!stats.form.isNewNode" :disabled="judgeDelForb" @click="nodeDelete">删除</Button>
                <Button type="info" v-if="!stats.form.isNewNode" :disabled="judgeConfForb || !judgeConf" @click="nodeConf">配置</Button>
                <Button type="info" @click="nodeSave">保存</Button>
            </div>
            <div v-if="!stats.tree.isSelecteOn" class="tip-message">
                <p>可选择目录或点击新建</p>
            </div>
        </Card>
        <Modal v-model="stats.form.iconModal" title="图标选择" class="icon-modal-style" :scrollable="true">
            <div style="flex-wrap: wrap; -ms-flex-wrap: wrap">
                <span v-for="(item, index) in stats.form.iconList" class="icon-item" @click="iconSelect(item)">
                    <Icon :type="item" :key="index"></Icon>
                </span>
            </div>
            <div slot="footer"></div>
        </Modal>
    </div>
</template>
<script>
    import iconList from '../../../../icon';
    export default {
        data() {
            return {
                menuTree: [],
                currentNodeBread: {name:['目标列表'], id:[]},
                currentNodeForm: {},
                stats: {
                    tree: {
                        isSelecteOn: false, //目录树节点是否选中
                        originData: [],
                    },
                    form: {
                        formInitData: {
                            code: '',
                            enabled: '',
                            functionName: '',
                            id: '',
                            image1Id: '',
                            isMenu: '',
                            nodeKey: '',
                            nodeType: '',
                            parentId: '',
                            url: {
                                component:'',
                                openMethod: '',
                                path: '',
                                type: '',
                                url: ''
                            }
                        },
                        tmpData: {},
                        iconModal: false,
                        iconList: iconList,
                        isNewNode: false, //是否为新增
                        delForbidden: ['1','11','111','112','113','12','13','131','132','2','14','15', '16', '17'],
                        confForbidden: ['1','11','111','112','113','12','13','131','132','2','14','15', '16', '17']
                    }
                },
                formValid: {
                    functionName: {required: true, message: '资源名称不能为空', trigger: 'blur'},
                    code: {required: true, message: '资源编码不能为空', trigger: 'blur'},
                    'url.path': {type: "string", message: '菜单URL不能为空',required: true, trigger: 'blur'},
                    'url.url': {required: true, message: '配置不能为空', trigger: 'blur'},
                    'url.component': {required: true, message: '显示方式不能为空', trigger: 'change'},
                    enabled: {required: true, message: '请选择是否有效', trigger: 'change'},
                }
            };
        },
        created: function () {
            this.getMenuData();
        },
        methods: {
            getMenuData(nodePick, nodebranch) {
                let _this = this;
                this.currentNodeForm = JSON.parse(JSON.stringify(this.stats.form.formInitData));
                this.stats.form.tmpData = JSON.parse(JSON.stringify(this.stats.form.formInitData));
                this.$http.post('/funcMag/funcs',{}).then((res) => {// 用于生成目录树
                    for (let i=0; i<res.data.data.length;i++){
                        let icon;
                        if (res.data.data[i].isMenu === 'N') {
                            icon = 'ios-circle-outline';
                        }else if (res.data.data[i].parentId === '0'){
                            icon = 'ios-folder-outline';
                            res.data.data[i].expand = true;
                        } else {
                            icon = 'navicon';
                        }
                        if (nodebranch && nodebranch.includes(res.data.data[i].id)) {
                            res.data.data[i].expand = true;
                        }
                        res.data.data[i].render = function (h, { root, node, data }) {
                            return h('span',{
                                style: {
                                    display: 'inline-block',
                                    width: '100%',
                                    color: '#495060',
                                    fontSize: '13px'
                                },
                            },[
                                h('Icon', {
                                    props: {
                                        type: icon
                                    },
                                    style: {
                                        marginRight: '8px'
                                    }
                                }),
                                h('span',{
                                    class: {
                                        menuActive: data.code === _this.stats.form.tmpData.code,
                                        treeItem: true
                                    },
                                    on: {
                                        click: () => { _this.nodeSelect(_this.stats.tree.originData, data) }
                                    }
                                }, data.functionName)
                            ]);
                        };
                    }
                    this.menuTree = this.transformToTreeFormat(res.data.data);
                    this.stats.tree.originData = JSON.parse(JSON.stringify(res.data.data));
                    let selected;
                    for (let i=0; i<this.stats.tree.originData.length; i++){
                        if (nodePick){
                            if (this.stats.tree.originData[i].code === nodePick.code){
                                selected = this.stats.tree.originData[i]; //新增.修改
                                break;
                            }
                        } else if (this.stats.tree.originData[i].code === '1'){
                            selected = this.stats.tree.originData[i];
                            break;
                        }
                    }
                    this.nodeSelect(this.stats.tree.originData,selected);
                });
            },
            newMenus () {
                this.stats.form.isNewNode = true;
                this.stats.tree.isSelecteOn = true;
                this.currentNodeForm = JSON.parse(JSON.stringify(this.stats.form.formInitData));
                this.currentNodeForm.enabled = 'Y';
                this.currentNodeForm.url.type = 'div';
                this.currentNodeForm.url.openMethod = 'default';
                this.currentNodeForm.parentId = this.stats.form.tmpData.id || '0';
                if (this.stats.form.tmpData.nodeType === ''){
                    this.currentNodeForm.nodeType = 'content';
                    this.currentNodeForm.isMenu = 'Y';
                } else if (this.stats.form.tmpData.nodeType === 'content'){
                    this.currentNodeForm.nodeType = 'menu';
                    this.currentNodeForm.isMenu = 'Y';
                } else {
                    this.currentNodeForm.nodeType = 'button';
                    this.currentNodeForm.isMenu = 'N';
                }
                this.$refs['validtest'].resetFields();
            },
            nodeSelect(root, data){ //目录树节点 选定 事件
                this.stats.form.isNewNode = false;
                this.$refs['validtest'] && this.$refs['validtest'].resetFields();
                if (this.stats.form.tmpData.code !== data.code){
                    this.stats.tree.isSelecteOn = false;
                }
                if (!this.stats.tree.isSelecteOn ){
                    this.currentNodeBread = this.genBread(root, data);
                    this.currentNodeForm = JSON.parse(JSON.stringify(this.parseFormData(data)));
                } else {
                    this.currentNodeBread.name = ['目标列表'];
                    this.currentNodeForm = JSON.parse(JSON.stringify(this.stats.form.formInitData));
                }

                this.stats.form.tmpData = JSON.parse(JSON.stringify(this.currentNodeForm));
                this.stats.tree.isSelecteOn = !this.stats.tree.isSelecteOn;
            },
            genBread(root, data) {
                let childData = data;
                let bread = {name:[],id:[]};
                while (true) {
                    bread.name.unshift(childData.functionName);
                    bread.id.push(childData.id);
                    if (childData.parentId === '0'){
                        bread.name.unshift('目标列表');
                        return bread;
                    }
                    let parentData = this.findParent(root, childData);
                    childData = parentData;
                }
            },
            findParent(root, data) {
                for (let i = 0; i < root.length; i++ ){
                    if (data.parentId === root[i].id){
                        return root[i];
                    }
                }
            },
            transformToTreeFormat(array){
                let i,l,
                    key = 'id',
                    parentKey = 'parentId',
                    childKey = 'children';

                if (array instanceof Array) {
                    let r = [];
                    let tmpMap = {};
                    for (i=0, l=array.length; i<l; i++) {
                        tmpMap[array[i][key]] = array[i];
                    }
                    for (i=0, l=array.length; i<l; i++) {
                        if (tmpMap[array[i][parentKey]] && array[i][key] !== array[i][parentKey]) {
                            if (!tmpMap[array[i][parentKey]][childKey])
                                tmpMap[array[i][parentKey]][childKey] = [];
                            tmpMap[array[i][parentKey]][childKey].push(array[i]);
                        } else {
                            r.push(array[i]);
                        }
                    }
                    return r;
                } else {
                    return [array];
                }
            },
            parseFormData (data) {
                let currNodeForm = Object.assign({},data);
                delete currNodeForm.render;
                if (data.url) {
                    currNodeForm.url = JSON.parse(data.url);
                    if (data.isMenu === 'Y') {
                        currNodeForm.nodeType = 'menu';
                    } else {
                        currNodeForm.nodeType = 'button';
                    }
                } else {
                    currNodeForm.nodeType = 'content';
                    currNodeForm.url = '';
                }
                return currNodeForm;
            },
            nodeTypeChange (type) {
                if (type === 'button') {
                    this.currentNodeForm.isMenu = 'N';
                } else {
                    this.currentNodeForm.isMenu = 'Y';
                }
            },
            urlTypeChange (type){
                if (type === this.stats.form.tmpData.url.type && !this.stats.form.isNewNode){
                    this.currentNodeForm.url.component = this.stats.form.tmpData.url.component;
                    this.currentNodeForm.url.url = this.stats.form.tmpData.url.url;
                } else if (type === 'iframe') {
                    this.currentNodeForm.url.component = 'common/iframe.vue';
                    this.currentNodeForm.url.url = '';
                } else {
                    this.currentNodeForm.url.component = '';
                    this.currentNodeForm.url.url = '';
                }
            },
            iconPlus () {
                this.stats.form.iconModal = true;
            },
            iconSelect (item) {
                this.currentNodeForm.image1Id = item;
                this.stats.form.iconModal = false;
            },
            iconTrash () {
                this.currentNodeForm.image1Id = '';
            },
            nodeSave () {
                let req = JSON.parse(JSON.stringify(this.currentNodeForm));
                let [...nodeBranch] = this.currentNodeBread.id; //存储当前选定树节点 所在分支各节点的id，用于展开该分支
                req.url = req.nodeType !=='content'?JSON.stringify(req.url): '';
                this.$refs['validtest'].validate((valid) => {
                    if (valid) {
                        if (this.stats.form.isNewNode) {
                            if (Object.keys(this.nodeCodes).includes(req.code)) {
                                this.$Message.error('新增失败，资源编码已存在');
                            } else {
                                this.$http.post('/funcMag/func',req).then((res)=>{
                                    this.getMenuData(req, nodeBranch);
                                    this.$Message.success('新增成功');
                                });
                            }
                        } else {
                            if (this.nodeCodes[req.code] && this.nodeCodes[req.code] !== req.id ) {
                                this.$Message.error('修改失败，资源编码不能重复');
                            } else {
                                this.$http.put('/funcMag/func/' + req.id,req).then((res)=>{
                                    this.getMenuData(req,nodeBranch);
                                    this.$Message.success('修改成功');
                                });
                            }
                        }
                    }
                });
            },
            nodeDelete() {
                this.$Modal.confirm({
                    title: '删除确认',
                    content: '<p>确认删除吗？</p>',
                    onOk: () => {
                        this.$store.dispatch('getConfig', this.$store.state.ui.uiVersion).then(() => {
                            let uiConfig = this.$store.state.ui.uiConfigData;
                            if (uiConfig[this.currentNodeForm.parentId]) {
                                let btns = ['tableBtnConfigs', 'tableRowBtnConfigs', 'formBtnConfigs'];
                                let config =  uiConfig[this.currentNodeForm.parentId];
                                for (let i in btns) {
                                    if (config[btns[i]] && JSON.stringify(config[btns[i]]).indexOf(this.currentNodeForm.id) > -1) {
                                        this.$Message.error('在父页面中存在自定义按钮配置,不能删除！')
                                        return;
                                    }
                                }
                            }
                            this.$http.delete('/funcMag/func/'+ this.currentNodeForm.id).then((res) => {
                                this.getMenuData();
                                let config = {
                                    router: this.$router,
                                    token: this.$store.loginStore.loginInfo.authToken
                                };
                                this.$store.commit('MENU_LIST', config);
                                this.$Message.info('已删除');
                            }).catch((err)=>{
                                if(err.response) this.$Message.error(err.response.data.message);
                            });
                        });
                    },
                    onCancel: () => {
                        this.$Message.info('已取消');
                    }
                });

            },
            nodeConf() {
                if (this.currentNodeForm.url.component === 'common/restShow.vue') {
                    this.$router.push({
                        path: '/main/menuConfig/restConfig',
                        query: {
                            menuId: this.currentNodeForm.id,
                            menuName: this.currentNodeForm.functionName,
                            menuPath: this.currentNodeForm.url.url,
                            showType: 'table'
                        }
                    });
                } else if (this.currentNodeForm.url.component === 'common/framework.vue') {
                    this.$router.push({
                        path: '/main/menuConfig/framework',
                        query: {
                            menuId: this.currentNodeForm.id,
                            menuName: this.currentNodeForm.functionName
                        }
                    });
                } else if (this.currentNodeForm.url.component === 'common/expertTable.vue'){
                    this.$router.push({
                        path: '/main/menuConfig/tabConfig',
                        query: {
                            menuId: this.currentNodeForm.id,
                            menuName: this.currentNodeForm.functionName,
                            menuPath: this.currentNodeForm.url.url
                        }
                    });
                } if (this.currentNodeForm.url.component === 'common/treeShow.vue') {
                    this.$router.push({
                        path: '/main/menuConfig/restConfig',
                        query: {
                            menuId: this.currentNodeForm.id,
                            menuName: this.currentNodeForm.functionName,
                            menuPath: this.currentNodeForm.url.url,
                            showType: 'tree'
                        }
                    });
                }
            },
        },
        computed: {
            judgeContent: function () { //通过判断目录树节点类型是否为content，来判断表单中'菜单url','显示方法','打开方式' 是否显示
                return this.currentNodeForm.nodeType==='content';
            },
            judgeUrlType: function () {
                return this.currentNodeForm.url.type === 'iframe';
            },
            judgeUrlComponent: function () {
                let reg = new RegExp(/\/restShow\.vue|\/expertTable\.vue|\/treeShow\.vue/);
                if (this.currentNodeForm.url && this.currentNodeForm.url.component.search(reg) !== -1){
                    return true;
                }
            },
            judgeButton: function () { //判断目录树节点类型是否为button
                return this.currentNodeForm.nodeType==='button';
            },
            judgeImage: function () {
                return this.currentNodeForm.image1Id;
            },
            judgeConf:function () {
                let reg = new RegExp(/restShow\.vue|\/treeShow\.vue|expertTable\.vue|framework\.vue/i);
                if (this.currentNodeForm.url && this.currentNodeForm.url.component.search(reg) !== -1){
                    return true;
                }
            },
            judgeDelForb: function () {
                return this.stats.form.delForbidden.includes(this.currentNodeForm.id);
            },
            judgeConfForb: function () {
                return this.stats.form.confForbidden.includes(this.currentNodeForm.id);
            },
            nodeCodes: function () { //所有节点的编码 与 对应id，用于验证是否有重复的树节点编码
                let code2Id = {};
                for (let i = 0; i < this.stats.tree.originData.length; i++){
                    code2Id[this.stats.tree.originData[i].code] = this.stats.tree.originData[i].id;
                }
                return code2Id;
            }
        }
    };
</script>
<style lang="scss" scoped>
    .cardContainer {
        @include compatibleFlex;
        flex-flow: row nowrap;
        padding: 16px;
        @include flex-justify;
    }
    .cardItem:nth-child(1) {
        width: 30%;
    }
    .cardItem:nth-child(2) {
        width: 69%;
    }

    .formButtons {
        @include compatibleFlex;
        /*flex-flow: row nowrap;*/
        @include flex-justify('center');
        button {
            margin: 0 6px;
        }
    }

    .tip-message{
        @include compatibleFlex;
        @include flex-justify('center');
        align-items: center
    }

    .icon-item {
        margin: 8px;
        i {
            font-size: 24px;
            &:hover {
                color: #2d8cf0;
                cursor: pointer;
            }

        }
    }
</style>
<style lang="scss">
    .cardContainer{
        .treeItem {
            color: #495060;
            &:hover{
                color: #5cadff;
                cursor: pointer;
            }
        }
        .menuActive {
            color: #2d8cf0;
        }
    }
    .icon-modal-style {
        .ivu-modal-body {
            height: 500px;
            overflow: auto;
        }
    }
</style>
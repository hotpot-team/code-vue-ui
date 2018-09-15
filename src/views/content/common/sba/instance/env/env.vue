<template>
    <div class="section">
        <div class="part">
            <div v-if="error" class="message is-danger">
                <div class="message-body">
                    <strong>
                        <font-awesome-icon class="has-text-danger" icon="exclamation-triangle"/>
                        Fetching environment failed.
                    </strong>
                    <p v-text="error.message"/>
                </div>
            </div>
            <div class="profile">
                <span class="frame primary">profile</span>
                <span class="frame" v-for="item in profile" :key="item">{{item}}</span>
            </div>
        </div>

        <!--<div class="part">
            <Row>
                <Col span="24">
                <Card>
                    <div>
                        <h3>Environment Manager</h3>
                        <Row>
                            <Col span="12" style="padding-right:10px">
                            <Select v-model="model11" filterable placeholder="Property name">
                                <Option v-for="item in cityList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                            </Select>
                            </Col>
                            <Col span="12">
                            <Input placeholder="Value"></Input>
                            </Col>
                        </Row>
                        <div style="margin-top: 20px">
                            <Row>
                                <Col span="12" style="padding-right:10px">
                                <Button>Refresh Context</Button>
                                </Col>
                                <Col span="12" style="text-align: right">
                                <Button disabled>Reset</Button>
                                <Button type="primary">Update</Button>
                                </Col>
                            </Row>
                        </div>

                    </div>
                </Card>
                </Col>
            </Row>
        </div>-->

        <div class="part">
            <Row>
                <Col span="24">
                <Input placeholder="name / value filter" clearable v-model="filter"></Input>
                </Col>
            </Row>
        </div>
        <div class="part" v-for="item in propertySources">
            <Row>
                <Col span="24">
                <Card dis-hover>
                    <p slot="title">{{item.name}}</p>
                    <p>
                    <Table stripe :columns="columns1" :data="setData(item.properties)" :show-header="false"></Table>
                    </p>
                </Card>
                </Col>
            </Row>
        </div>
    </div>
</template>

<script>
    import Instance from '../../utils/instance';
    import _ from 'lodash';

    const filterProperty = (needle) => (property, name) => {
        return name.toString().toLowerCase().includes(needle) || property.value.toString().toLowerCase().includes(needle);
    };
    const filterProperties = (needle, properties) => _.pickBy(properties, filterProperty(needle));
    const filterPropertySource = (needle) => (propertySource) => {
        if (!propertySource || !propertySource.properties) {
            return null;
        }
        return {
            ...propertySource,
            properties: filterProperties(needle, propertySource.properties)
        };
    };

    export default {
        props: {
            curInstance: {
                type: Object,
                required: true
            }
        },
        created() {
            this._fetchEnv();
        },
        computed: {
            instance() {
                let id = this.curInstance.id;
                return new Instance(id);
            },
            propertySources() {
                if (!this.propertySource) {
                    return [];
                }
                if (!this.filter) {
                    return this.propertySource;
                }
                return this.propertySource
                    .map(filterPropertySource(this.filter.toLowerCase()))
                    .filter(ps => ps && Object.keys(ps.properties).length > 0);
            }
        },
        methods: {
            _fetchEnv() {
                try{
                    this.instance.fetchEnvInfo().then((res) => {
                        if (res) {
                            this.profile = res.activeProfiles;
                            this.propertySource = res.propertySources;
                        }
                    });
                }catch(error){
                    this.error=error;
                    console.warn('Fetching environment failed:', error);
                }

            },
            setData(property) {
                let arr = Object.keys(property)
                let values = Object.values(property)
                let data1 = []
                for (let i = 0; i < arr.length; i++) {
                    data1.push({
                        property: arr[i],
                        value: values[i].value
                    });
                }
                return data1;
            }
        },
        data() {
            return {
                error:null,
                filter:null,
                profile: [],
                propertySource: [],
                columns1: [
                    {
                        title: 'Name',
                        key: 'property',
                        width: 300
                    },
                    {
                        title: 'Age',
                        key: 'value',
                        align: 'left',
                    }
                ],
                cityList: [
                    {
                        value: 'New York',
                        label: 'New York'
                    },
                    {
                        value: 'London',
                        label: 'London'
                    },
                    {
                        value: 'Sydney',
                        label: 'Sydney'
                    },
                    {
                        value: 'Ottawa',
                        label: 'Ottawa'
                    },
                    {
                        value: 'Paris',
                        label: 'Paris'
                    },
                    {
                        value: 'Canberra',
                        label: 'Canberra'
                    }
                ],
                model11: '',
                model12: []
            };
        }
    };
</script>

<style scoped lang="scss">
    .section {
        padding: 3rem 1.5rem;
        display: block;
        .part {
            margin-bottom: 1.5rem;
            .profile {
                position: relative;
                display: inline-block;
                vertical-align: middle;
                .frame:first-child:not(:last-child) {
                    border-bottom-right-radius: 0;
                    border-top-right-radius: 0;
                    color: #fff;
                    background-color: #2d8cf0;
                    border-color: #2d8cf0;
                }
                .frame:not(:last-child):not(:first-child){
                     border-radius: 0;
                 }
                .frame:last-child:not(:first-child){
                    border-bottom-left-radius: 0;
                    border-top-left-radius: 0;
                }
                .frame{
                    position: relative;
                    float: left;
                    display: inline-block;
                    padding: 6px 15px;
                    font-size: 12px;
                    color: #495060;
                    background-color: #f7f7f7;
                    border-radius: 4px;
                    border: 1px solid  #dddee1;
                }
                .frame+.frame{
                    margin-left: -1px;
                }
            }
        }
    }



</style>

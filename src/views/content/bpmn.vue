<template>
    <div class="bpmn-class">
        <div class="container" id="container"></div>
        <div class="panel" id="js-properties-panel"></div>
        <div class="my-panel">
            <Input v-model="currentElement.id"></Input>
            <Input v-model="currentElement.name" @on-change="elementChange(currentElement, 'name')"></Input>
        </div>
        <div class="download">
            {{currentElement}}
            <Button @click="downLoadXml">下载</Button>
            <Button @click="addProp">addProp</Button>
        </div>
    </div>
</template>

<script>
    import BpmnModeler from 'bpmn-js/lib/Modeler';

    import propertiesPanelModule from 'bpmn-js-properties-panel';
    import propertiesProviderModule from 'bpmn-js-properties-panel/lib/provider/camunda';
    import camundaModdleDescriptor from 'camunda-bpmn-moddle/lib/index';
    import customTranslate from './customTranslate';
    export default {
        data(){
          return {
              bpmnModeler: null,
              xmlStr: null,
              currentElement: {
                  id: '',
                  name:''
              },
          };
        },
        created(){

        },
        mounted(){
            var customTranslateModule = {
                translate: [ 'value', customTranslate ]
            };

            this.bpmnModeler = new BpmnModeler({
                container: "#container",
                propertiesPanel: {
                    parent: '#js-properties-panel'
                },
                additionalModules: [
                    propertiesPanelModule,
                    propertiesProviderModule,
                    // customTranslateModule
                ],
                moddleExtensions: {
                    camunda: camundaModdleDescriptor
                }
            });
            this.createNewDiagram();
        },
        methods:{
            createNewDiagram(){
                const newDiagramXML = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\r\n<bpmn2:definitions xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:bpmn2=\"http://www.omg.org/spec/BPMN/20100524/MODEL\" xmlns:bpmndi=\"http://www.omg.org/spec/BPMN/20100524/DI\" xmlns:dc=\"http://www.omg.org/spec/DD/20100524/DC\" xmlns:di=\"http://www.omg.org/spec/DD/20100524/DI\" xsi:schemaLocation=\"http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd\" id=\"sample-diagram\" targetNamespace=\"http://bpmn.io/schema/bpmn\">\r\n  <bpmn2:process id=\"Process_1\" name=\"" + this.processName + "\" isExecutable=\"false\">\r\n    <bpmn2:startEvent id=\"StartEvent_1\"/>\r\n  </bpmn2:process>\r\n  <bpmndi:BPMNDiagram id=\"BPMNDiagram_1\">\r\n    <bpmndi:BPMNPlane id=\"BPMNPlane_1\" bpmnElement=\"Process_1\">\r\n      <bpmndi:BPMNShape id=\"_BPMNShape_StartEvent_2\" bpmnElement=\"StartEvent_1\">\r\n        <dc:Bounds height=\"36.0\" width=\"36.0\" x=\"412.0\" y=\"240.0\"/>\r\n      </bpmndi:BPMNShape>\r\n    </bpmndi:BPMNPlane>\r\n  </bpmndi:BPMNDiagram>\r\n</bpmn2:definitions>";
                this.bpmnModeler.importXML(newDiagramXML, function(err) {
                    if (err) {
                        console.error(err);
                    }
                });

                let _this =this;
                this.bpmnModeler.on('commandStack.changed', function () {
                    _this.bpmnModeler.saveXML({format: true}, function (err, xml) {
                        _this.xmlStr = xml;
                    });
                });

                this.bpmnModeler.on('selection.changed', function (selection) {
                    var elementRegistry =  _this.bpmnModeler.get('elementRegistry');
                    if (selection.newSelection && selection.newSelection.length > 0) {
                        _this.currentElement = elementRegistry.get(selection.newSelection[0].id).businessObject;
                    } else {
                        _this.currentElement = _this.bpmnModeler._definitions.rootElements[0];
                    }
                });

                // this.bpmnModeler.on('element.changed', function (el) {
                //     console.log(el);
                //     var elementRegistry =  _this.bpmnModeler.get('elementRegistry');
                //     var modeling = _this.bpmnModeler.get('modeling');
                //     modeling.updateProperties(elementRegistry.get(el.element.id), {
                //         name: el.element.name
                //     });
                // });
            },
            // 保存修改操作
            save() {
                // 传给后台的参数
                let params = {
                    bpmnXml: this.xmlStr
                };
                // 调用API接口
            },
            downLoadXml(){
                let blob = new Blob([this.xmlStr], {type: 'application/bpmn20-xml'});
                let body = document.body;
                let a = document.createElement('a');
                a.download = 'test.xml';
                a.href = URL.createObjectURL(blob);
                body.appendChild(a);
                a.click();
                body.removeChild(a);
                // console.log( this.bpmnModeler._definitions.rootElements[0]);
                // console.log( this.bpmnModeler.get('process'));
                // var sequenceFlowElement = this.bpmnModeler.get('Task_08b3fpa'),
                //     sequenceFlow = sequenceFlowElement.businessObject;
                //
                // console.log(sequenceFlow.name);
            },
            elementChange(element, prop){
                var elementRegistry =  this.bpmnModeler.get('elementRegistry');
                var modeling = this.bpmnModeler.get('modeling');
                modeling.updateProperties(elementRegistry.get(element.id), {
                    prop: element[prop]
                });
            },
            addProp(){
                debugger
                var elementRegistry =  this.bpmnModeler.get('elementRegistry');
                var modeling = this.bpmnModeler.get('modeling');
                modeling.updateProperties(elementRegistry.get(this.currentElement.id), {
                    'activiti:candidateUsers': '${candidateUsers}'
                });
            }
        }
    };
</script>

<style lang="scss" scoped>
    .bpmn-class {
        position: absolute;
        background-color: #ffffff;
        bottom: 0;
        top: 65px;
        left: 0;
        right: 0;

        .container{
            width: 100%;
            height: 100%;
        }

        .panel{
            position: absolute;
            right: 0;
            top: 0px;
            width: 300px;
        }

        .my-panel {
            position: absolute;
            right: 300px;
            top: 0;
            width: 300px;
        }

        .download{
            position: absolute;
            bottom: 0;
        }
    }
</style>
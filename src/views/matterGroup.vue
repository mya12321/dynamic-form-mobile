<template>
  <div>
    <div class="title" v-if="!editBase">项目基本信息表</div>
    <DynamicForm class="form" :schema="schema" :content="content" :rule="rule" ref="form"></DynamicForm>
  </div>
</template>

<script>
  import DynamicForm from '@/components/DynamicForm.vue';

  export default {
    name: 'matterGroup',
    data() {
      return {
        schema: {
          items: [
            {
              id: '0',
              label: '项目名称',
            },
            {
              id: '1',
              label: '项目备案号',
            },
            {
              id: '2',
              label: '所属园区',
            },
            {
              id: '3',
              label: '投资总额(万元)',
            },
            {
              id: '4',
              label: '用地面积(亩)',
            },
            {
              id: '5',
              label: '项目地址',
            },
            {
              id: '6',
              label: '企业名称',
            },
            {
              id: '7',
              label: '业主单位',
            },
            {
              id: '8',
              label: '项目业主姓名',
            },
            {
              id: '9',
              label: '项目业主电话',
            },
            {
              id: '10',
              label: '代办员姓名',
            },
            {
              id: '11',
              label: '代办员电话',
            },
            {
              id: '12',
              type: 'date',
              label: '项目开始时间',
            },
            {
              id: '13',
              type: 'text',
              text: '备注：项目开始时间100天后需要完结该项目',
              style: {
                color: 'red',
                fontSize: '12px',
              },
            },
          ],
          buttons: [
            {
              id: '0',
              type: 'primary',
              plain: true,
              text: '返回',
              click: () => {
                if (history.state === null) {
                  if (window.__wxjs_environment || navigator.userAgent.includes("miniProgram")) {
                    wx.miniProgram.navigateBack({
                      delta: 1
                    });
                  } else {
                    window.location.href = this.baseUrl + '/backIndex';
                  }
                } else {
                  // let query = {
                  //   matterId: this.matterId,
                  //   industrialId: this.industrialId,
                  // };
                  // this.$router.push({
                  //   path: '/matterGroupPreview',
                  //   query: query,
                  // });
                  if (this.editBase) {
                    let query = {
                      matterId: this.matterId,
                      industrialId: this.industrialId,
                      role: this.role,
                    };
                    this.$router.replace({
                      path: '/matterGroupBasePreview',
                      query: query,
                    });
                  } else {
                    this.$router.back();
                  }
                }
              },
            },
            {
              id: '1',
              type: 'primary',
              text: '下一步',
              click: () => {
                this.$refs.form.validate(valid => {
                  if (valid) {
                    let data = {
                      projectName: this.content[0],
                      projectNo: this.content[1],
                      ownPark: this.content[2],
                      totalInvestment: this.content[3],
                      landArea: this.content[4],
                      projectAddress: this.content[5],
                      enterpriseName: this.content[6],
                      ownerUnit: this.content[7],
                      projectOwnerName: this.content[8],
                      projectOwnerPhone: this.content[9],
                      projectSecretaryName: this.content[10],
                      projectSecretaryPhone: this.content[11],
                      beginTime: this.content[12],
                    };
                    if (this.content[14]) {
                      data.beginNodeId = this.content[14];
                      localStorage.setItem('extraNodeData', JSON.stringify(this.extraNodeData[data.beginNodeId]));
                    }
                    if (this.industrialId) {
                      data.id = this.industrialId;
                    } else {
                      localStorage.setItem('industrialBaseInfo', JSON.stringify(this.content));
                    }
                    this.$post('api/app/matter/industrialProjectsBaseInfo', data).then(({body}) => {
                      if (!this.industrialId) {
                        this.industrialId = body;
                      }
                      let query = {
                        matterId: this.matterId,
                        industrialId: this.industrialId,
                      };
                      this.$router.push({
                        path: '/matterGroupDetail',
                        query: query,
                      });
                    });
                  } else {
                    this.$alert('校验未通过, 请检查数据.');
                  }
                });
              },
            },
          ],
        },
        content: {},
        rule: {
          '0': [
            {
              type: 'string',
              required: true,
              message: '必填',
              trigger: 'blur',
            },
            {
              type: 'string',
              max: 30,
              message: '请输入30字以内字符',
              trigger: 'blur',
            },
          ],
          '1': [
            // {
            //   type: 'string',
            //   required: true,
            //   message: '必填',
            //   trigger: 'blur',
            // },
            {
              type: 'string',
              max: 30,
              message: '请输入30字以内字符',
              trigger: 'blur',
            },
          ],
          '2': [
            {
              type: 'string',
              required: true,
              message: '必填',
              trigger: 'blur',
            },
            {
              type: 'string',
              max: 30,
              message: '请输入30字以内字符',
              trigger: 'blur',
            },
          ],
          '3': [
            {
              type: 'string',
              required: true,
              message: '必填',
              trigger: 'blur',
            },
            {
              type: 'string',
              max: 30,
              message: '请输入30字以内字符',
              trigger: 'blur',
            },
          ],
          '4': [
            {
              type: 'string',
              required: true,
              message: '必填',
              trigger: 'blur',
            },
            {
              type: 'string',
              max: 30,
              message: '请输入30字以内字符',
              trigger: 'blur',
            },
          ],
          '5': [
            {
              type: 'string',
              required: true,
              message: '必填',
              trigger: 'blur',
            },
            {
              type: 'string',
              max: 30,
              message: '请输入30字以内字符',
              trigger: 'blur',
            },
          ],
          '6': [
            // {
            //   type: 'string',
            //   required: true,
            //   message: '必填',
            //   trigger: 'blur',
            // },
            {
              type: 'string',
              max: 30,
              message: '请输入30字以内字符',
              trigger: 'blur',
            },
          ],
          '7': [
            {
              type: 'string',
              required: true,
              message: '必填',
              trigger: 'blur',
            },
            {
              type: 'string',
              max: 30,
              message: '请输入30字以内字符',
              trigger: 'blur',
            },
          ],
          '8': [
            {
              type: 'string',
              required: true,
              message: '必填',
              trigger: 'blur',
            },
            {
              type: 'string',
              max: 30,
              message: '请输入30字以内字符',
              trigger: 'blur',
            },
          ],
          '9': [
            {
              type: 'string',
              required: true,
              message: '必填',
              trigger: 'blur',
            },
            {
              type: 'string',
              pattern: '^[1][3,4,5,6,7,8,9][0-9]{9}$',
              message: '请输入正确的手机号',
              trigger: 'blur',
            },
          ],
          '10': [
            {
              type: 'string',
              required: true,
              message: '必填',
              trigger: 'blur',
            },
            {
              type: 'string',
              max: 30,
              message: '请输入30字以内字符',
              trigger: 'blur',
            },
          ],
          '11': [
            {
              type: 'string',
              required: true,
              message: '必填',
              trigger: 'blur',
            },
            {
              type: 'string',
              pattern: '^[1][3,4,5,6,7,8,9][0-9]{9}$',
              message: '请输入正确的手机号',
              trigger: 'blur',
            },
          ],
          '12': [
            {
              type: 'string',
              required: true,
              message: '必填',
              trigger: 'blur',
            },
          ],
        },
        // fromPath: '',
        industrialId: 0,
        extraNodeData: {},
        editBase: false,
        role: '',
      };
    },
    props: ['matterId', 'userMatterId'],
    components: {
      DynamicForm
    },
    mounted() {
      let query = this.$route.query;
      if (query.industrialId) {
        this.industrialId = query.industrialId;
      }
      if (query.history) {
        this.addBeginNode();
      }
      if (query.role) {
        this.role = query.role;
      }
      if (query.editBase) {
        this.editBase = query.editBase;
        this.schema.buttons.splice(1, 1, {
          id: '1',
          type: 'primary',
          text: '确认',
          click: () => {
            this.$refs.form.validate(valid => {
              if (valid) {
                let data = {
                  id: this.industrialId,
                  projectName: this.content[0],
                  projectNo: this.content[1],
                  ownPark: this.content[2],
                  totalInvestment: this.content[3],
                  landArea: this.content[4],
                  projectAddress: this.content[5],
                  enterpriseName: this.content[6],
                  ownerUnit: this.content[7],
                  projectOwnerName: this.content[8],
                  projectOwnerPhone: this.content[9],
                  projectSecretaryName: this.content[10],
                  projectSecretaryPhone: this.content[11],
                  beginTime: this.content[12],
                };
                if (this.content[14]) {
                  data.beginNodeId = this.content[14];
                }
                this.$post('api/app/matter/industrialProjectsBaseInfo', data).then(() => {
                  let query = {
                    matterId: this.matterId,
                    industrialId: this.industrialId,
                    role: this.role,
                  };
                  this.$router.replace({
                    path: '/matterGroupBasePreview',
                    query: query,
                  });
                });
              } else {
                this.$alert('校验未通过, 请检查数据.');
              }
            });
          },
        });
      }
      if (this.industrialId) {
        for (let i = 0; i < 5; i++) {
          this.$set(this.schema.items[i + 8], 'status', 'disabled');
        }
        this.$post('api/app/matter/getIndustrialProjectsBaseInfo', {id: this.industrialId}).then(({body}) => {
          this.content = {
            '0': body.projectName,
            '1': body.projectNo,
            '2': body.ownPark,
            '3': body.totalInvestment,
            '4': body.landArea,
            '5': body.projectAddress,
            '6': body.enterpriseName,
            '7': body.ownerUnit,
            '8': body.projectOwnerName,
            '9': body.projectOwnerPhone,
            '10': body.projectSecretaryName,
            '11': body.projectSecretaryPhone,
            '12': new Date(body.beginTime).format('yyyy-MM-dd'),
          };
          if (body.beginNodeId) {
            this.addBeginNode();
            this.$set(this.content, '14', body.beginNodeId);
            this.$set(this.schema.items[12], 'status', 'disabled');
          }
        });
      } else {
        let local = localStorage.getItem('industrialBaseInfo');
        if (local) {
          this.content = JSON.parse(local);
          if (!query.history) {
            this.content[14] = undefined;
          }
        } else {
          this.$post(`${location.origin}/api/gz/user/getInfoByToken.json`).then(({body}) => {
            this.$set(this.content, '11', body.username);
          });
        }
      }
    },
    methods: {
      addBeginNode() {
        let subItems = [];
        this.schema.items.splice(12, 0, {
          id: '14',
          type: 'select',
          label: '项目开始节点',
          items: subItems,
        });
        this.$set(this.rule, '14', [{
          type: 'string',
          required: true,
          message: '必填',
          trigger: 'change',
        }]);
        this.$post('api/app/matter/getIndustrialNodes').then(({body}) => {
          localStorage.setItem('beginNodeMap', JSON.stringify(body.baseInfo));
          let arr = Object.keys(body.baseInfo).sort((a, b) => a.split(',')[0] - b.split(',')[0]).map((key, index) => {
            this.extraNodeData[key] = {
              nodes: body.baseInfoNodes[key],
              days: body.baseInfoNodeDays[key],
              selected: key,
            };
            return {
              id: index,
              label: body.baseInfo[key],
              value: key,
            };
          });
          subItems.push(...arr);
        });
      },
    },
    // beforeRouteEnter(to, from, next) {
    //   next(vm => vm.fromPath = from.path);
    // },
  };
</script>

<style scoped>
  .title {
    width: 100vw;
    color: #333;
    font-size: 17px;
    font-weight: 900;
    margin: 16px 0;
    text-align: center;
  }
  .form >>> .item-label {
    font-weight: bold;
  }
</style>

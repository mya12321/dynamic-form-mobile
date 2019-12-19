<template>
  <div id="app">
    <keep-alive>
      <router-view v-bind="propsData" :key="`${$route.path}?_=${$route.query.t}`"></router-view>
    </keep-alive>
    <!--<router-view @stepChange="stepChange" @flowVisibleChange="flowVisibleChange" @regCodeChange="regCodeChange" v-bind="propsData"></router-view>-->
    <!--<div :class="['layer', stepStatus ? 'expand' : 'collapse']" v-if="flowVisible && stepList.length" id="flow">-->
      <!--<div class="flow-button" @click="() => flowStatusChange(!stepStatus)">-->
        <!--<span>{{stepStatus ? '收起流程》' : '《查看流程'}}</span>-->
      <!--</div>-->
      <!--<div class="reg-code" @click="changeRegCode">-->
        <!--<span>输入推广码</span>-->
      <!--</div>-->
      <!--<div class="steps">-->
        <!--<el-steps :active="stepIndex" direction="vertical" :space="40">-->
          <!--<el-step v-for="(step, index) in stepList" :key="step.id" :title="step.title" @click.native="() => goStep(index)"></el-step>-->
        <!--</el-steps>-->
      <!--</div>-->
    <!--</div>-->
    <!--<div class="mask" v-if="flowVisible && stepList.length && stepStatus" @click="() => flowStatusChange(false)"></div>-->
  </div>
</template>

<script>
  export default {
    name: 'app',
    data() {
      return {
        matterId: 0,
        userMatterId: 0,
        matterName: '',
        userId: 0,
        userName: '',
        userPhone: '',
        applyMode: '',
        createdTime: 0,
        regCode: '',
        noTree: false,
        stepList: [],
        stepIndex: 0,
        stepStatus: false,
        stepFake: true,
        flowVisible: true,
        prePage: '',
        top: 0,
        payAmount: 0,
        payRemark: '',
        hasPayAmount: 0,
        needPay: false,
      };
    },
    computed: {
      propsData() {
        return {
          matterId: this.matterId,
          userMatterId: this.userMatterId,
          matterName: this.matterName,
          userName: this.userName,
          userPhone: this.userPhone,
          applyMode: this.applyMode,
          userId: this.userId,
          createdTime: this.createdTime,
          noTree: this.noTree,
          stepList: this.stepList,
          prePage: this.prePage,
          payAmount: this.payAmount,
          payRemark: this.payRemark,
          hasPayAmount: this.hasPayAmount,
          needPay: this.needPay,
        };
      },
    },
    mounted() {
      setTimeout(() => {
        if (this.$route.path === '/') {
          this.init();
        }
      }, 300);
    },
    methods: {
      init() {
        let data = this.$route.query;
        this.matterId = data.matterId;
        this.userMatterId = data.userMatterId;
        this.noTree = data.noTree && JSON.parse(data.noTree) ? true : false;
        if (data.stepChange) this.stepChange(JSON.parse(data.stepChange));
        if (this.$route.path === '/uploadAvatar') return;
        if (this.matterId == 1430) {
          document.title = '永川区工业项目100天开工计划';
          if (this.$route.path === '/previewInner' || this.$route.path === '/preview') {
            let query = {
              matterId: this.matterId,
              industrialId: this.userMatterId,
            };
            this.$router.replace({
              path: '/matterGroupPreview',
              query: query,
            });
          } else if (this.$route.path === '/') {
            if (this.userMatterId) {
              let query = {
                matterId: this.matterId,
                industrialId: this.userMatterId,
              };
              this.$router.push({
                path: '/matterGroup',
                query: query,
              });
            } else {
              let query = {
                matterId: this.matterId,
              };
              this.$router.push({
                path: '/matterGroup',
                query: query,
              });
            }
          }
          return;
        } else if (this.$route.path === '/') {
          if (this.userMatterId) {
            this.$router.replace({
              path: '/matterTree',
              query: data,
            });
          } else {
            this.$router.replace({
              path: '/matterParticleChoose',
              query: data,
            });
          }
        }
        // if (this.matterId) {
        //   let treeStatus = this.$post('api/matter/trees/' + this.matterId);
        //   let matterDetail;
        //   if (this.userMatterId) {
        //     this.prePage = `${location.origin}/h5/#/userMatterDetail?userMatterId=${this.userMatterId}&token=${sessionStorage.getItem('token')}`;
        //     matterDetail = this.$get('user/matter/detail/' + this.userMatterId);
        //   } else {
        //     this.prePage = `${location.origin}/h5/#/matterNotice?matterId=${this.matterId}&token=${sessionStorage.getItem('token')}`;
        //     matterDetail = this.$post('api/user/matter/input', {
        //       matterId: this.matterId,
        //       applyMode: '02',
        //     });
        //   }
        //   Promise.all([treeStatus, matterDetail]).then(res => {
        //     if (res[0].body.trees.length === 1 && res[0].body.trees[0].isGroup === 'Y') {
        //       this.noTree = true;
        //     }
        //     this.userMatterId = res[1].body.id;
        //     this.matterName = res[1].body.matterName;
        //     this.userName = res[1].body.userName;
        //     this.userPhone = res[1].body.userPhone;
        //     this.applyMode = res[1].body.applyMode;
        //     this.createdTime = res[1].body.createdTime;
        //     this.userId = res[1].body.userId;
        //     this.regCode = res[1].body.regCode;
        //     this.payAmount = res[1].body.payAmount;
        //     this.payRemark = res[1].body.payRemark;
        //     this.hasPayAmount = res[1].body.hasPayAmount;
        //     this.needPay = (res[1].body.payAmount - res[1].body.hasPayAmount) > 0;
        //     document.title = this.matterName;
        //     if (this.$route.path === '/') {
        //       this.$nextTick(() => {
        //         let query = {
        //           matterId: this.matterId,
        //           userMatterId: this.userMatterId,
        //         };
        //         this.$router.replace({
        //           path: '/matterTree',
        //           query: query,
        //         });
        //       });
        //     }
        //   });
        //   this.$post('api/app/free/matter/getUserMatterFormById', {id: this.matterId}).then(({body}) => {
        //     if (this.stepFake) {
        //       let list = [];
        //       if (!this.noTree) {
        //         list.unshift('类型选择');
        //       }
        //       list.push(...body.map(each => each.name));
        //       list.push('表单项预览');
        //       list.push('实名/签名');
        //       this.stepList = list.map(title => {return {id: this.generateId(), title: title}});
        //       this.stepIndex = 0;
        //     }
        //   });
        // }
      },
      stepChange(data) {
        if (data.steps) {
          this.stepFake = false;
          let list = data.steps;
          let index = data.index;
          if (!this.noTree) {
            list.unshift('类型选择');
          }
          list.push('表单项预览');
          list.push('实名/签名');
          this.stepList = list.map(title => {return {id: this.generateId(), title: title}});
          this.stepIndex = index;
        } else if (data.index < 0) {
          this.stepIndex = data.index + this.stepList.length;
        } else {
          this.stepIndex = data.index;
        }
      },
      flowStatusChange(status) {
        this.stepStatus = status;
        if (status) {
          this.top = (document.scrollingElement || document.documentElement).scrollTop;
          document.body.style.position = 'fixed';
          document.body.style.top = -this.top + 'px';
        } else {
          document.body.style.position = '';
          document.body.style.top = '';
          document.body.scrollTop = this.top;
        }
      },
      changeRegCode() {
        document.title = '推广码';
        let query = {
          matterId: this.matterId,
          userMatterId: this.userMatterId,
          regCode: this.regCode,
        };
        // this.$router.push({
        //   path: '/inputRegCode',
        //   query: query,
        // });
        this.$router.replace({
          path: '/inputRegCode',
          query: query,
        });
      },
      flowVisibleChange(visible) {
        this.flowVisible = visible;
      },
      regCodeChange(code) {
        this.regCode = code;
      },
      generateId() {
        return Math.floor(Math.random() * (1<<30)).toString(36);
      },
    },
    watch: {
      // '$route': {
      //   deep: true,
      //   handler: function(val) {
      //     if (this.matterId != 1430 && (!val.query.userMatterId || val.query.userMatterId !== this.userMatterId)) {
      //       this.init();
      //     }
      //   },
      // },
    },
  }
</script>

<style scoped>
  .layer {
    position: fixed;
    left: 100vw;
    top: 0;
    background-color: #fff;
    box-shadow:-4px 0px 8px 0px rgba(0,0,0,0.1);
    width: 70vw;
    height: 100vh;
    z-index: 100;
  }
  .expand {
    left: 30vw;
  }
  .collapse {
    left: 100vw;
  }
  .flow-button {
    position: absolute;
    left: -100px;
    bottom: 150px;
    background-color: #4672f6;
    border-radius: 100px 0 0 100px;
    width: 100px;
    height: 50px;
    text-align: center;
  }
  .flow-button span {
    line-height: 50px;
    color: #fff;
  }
  .mask {
    position: fixed;
    z-index: 50;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0,0,0,0.3);
  }
  .steps {
    margin: 16px;
    height: calc(100vh - 76px);
    overflow-y: auto;
  }
  .steps >>> .el-step__head {
    color: white;
  }
  .steps >>> .el-step__icon {
    width: 20px;
    height: 20px;
  }
  .steps >>> .is-vertical .el-step__line {
    top: 2px;
    left: 10px;
  }
  .steps >>> .el-step__head.is-finish {
    border-color: #67C23A;
  }
  .steps >>> .el-step__head.is-finish>.el-step__icon {
    background-color: #67C23A;
  }
  .steps >>> .el-step__title {
    font-size: 13px;
  }
  .steps >>> .el-step__title.is-finish {
    color: #67C23A;
    overflow: hidden;
    text-overflow:ellipsis;
    white-space: nowrap;
    max-width: 52vw;
  }
  .steps >>> .el-step__head.is-process {
    border-color: #0589FF;
  }
  .steps >>> .el-step__head.is-process>.el-step__icon {
    background-color: #0589FF;
  }
  .steps >>> .el-step__title.is-process {
    color: #0589FF;
    overflow: hidden;
    text-overflow:ellipsis;
    white-space: nowrap;
    max-width: 52vw;
  }
  .steps >>> .el-step__head.is-wait {
    border-color: #999;
  }
  .steps >>> .el-step__head.is-wait>.el-step__icon {
    background-color: #999;
  }
  .steps >>> .el-step__title.is-wait {
    color: #999;
    overflow: hidden;
    text-overflow:ellipsis;
    white-space: nowrap;
    max-width: 52vw;
  }
  .reg-code {
    width: 150px;
    height: 32px;
    background-color: rgba(70, 114, 246, 0.08);
    border-radius: 16px;
    margin: 12px auto;
  }
  .reg-code>span {
    display: inline-block;
    line-height: 32px;
    color: #4672F6;
    width: 100%;
    font-size: 13px;
    text-align: center;
  }
</style>

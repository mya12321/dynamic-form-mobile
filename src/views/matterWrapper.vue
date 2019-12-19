<template>
  <div>
    <HeaderSteps2 v-show="showTab" :stepList="stepList" :activeIndex="stepIndex"></HeaderSteps2>
    <div class="content" :style="styleObj">
      <keep-alive>
        <router-view v-bind="propsData" :key="`${$route.path}?_=${$route.query.t}`" @buttonChange="changeButton" @stepActiveChange="changeStepIndex" @showTab="changeTabStatus" ref="childPage"></router-view>
      </keep-alive>
    </div>
    <div class="bottom-area" v-if="buttonList.length">
      <el-button class="bottom-button" v-for="button in buttonList" :key="button.id" type="primary" :plain="button.plain"
                 @click="button.click" :disabled="button.status == 'disabled'">{{button.text}}</el-button>
    </div>
  </div>
</template>

<script>
  import HeaderSteps2 from '@/components/HeaderSteps2';
  export default {
    name: 'matterWrapper',
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
        showTab: true,
        stepList: [
          {
            id: this.generateId(),
            title: '类型',
          },
          {
            id: this.generateId(),
            title: '资料',
          },
          {
            id: this.generateId(),
            title: '预览',
          },
          {
            id: this.generateId(),
            title: '签章',
          },
          {
            id: this.generateId(),
            title: '提交',
          },
        ],
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
        buttonList: [],
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
          stepList: this.stepList,
          prePage: this.prePage,
          payAmount: this.payAmount,
          payRemark: this.payRemark,
          hasPayAmount: this.hasPayAmount,
          needPay: this.needPay,
        };
      },
      styleObj() {
        let hasTab = this.stepList.length && this.showTab;
        let hasButton = this.buttonList.length;
        let outerHeight = 0;
        if (hasTab) {
          outerHeight += 40;
        }
        if (hasButton) {
          outerHeight += 80;
        }
        return {
          height: `calc(100vh - ${outerHeight}px)`,
        };
      },
    },
    components: {
      HeaderSteps2,
    },
    created() {
      let query = this.$route.query;
      this.matterId = query.matterId;
      this.userMatterId = query.userMatterId;
      if (this.matterId) {
        let matterDetail;
        if (this.userMatterId) {
          matterDetail = this.$get('user/matter/detail/' + this.userMatterId);
          this.$store.commit('setIsNewMatter', false);
        } else {
          matterDetail = this.$post('api/user/matter/input', {
            matterId: this.matterId,
            applyMode: '02',
          });
          this.$store.commit('setIsNewMatter', true);
        }
        this.$loading({
          lock: true,
          text: '正在加载',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.3)'
        });
        matterDetail.then(({body}) => {
          this.userMatterId = body.id;
          this.matterName = body.matterName;
          this.userName = body.userName;
          this.userPhone = body.userPhone;
          this.applyMode = body.applyMode;
          this.createdTime = body.createdTime;
          this.userId = body.userId;
          this.regCode = body.regCode;
          this.payAmount = body.payAmount;
          this.payRemark = body.payRemark;
          this.hasPayAmount = body.hasPayAmount;
          this.needPay = (body.payAmount - body.hasPayAmount) > 0;
          document.title = this.matterName;
          if (this.$store.state.isNewMatter) {
            let params = {
              matterId: this.matterId,
              userMatterId: this.userMatterId,
            };
            this.$router.replace({
              path: this.$route.path,
              query: Object.assign({}, this.$route.query, params)
            });
            this.$nextTick(this.$refs.childPage.init);
          }
        });
      }
    },
    methods: {
      generateId() {
        return Math.floor(Math.random() * (1<<30)).toString(36);
      },
      changeButton(buttonList) {
        this.buttonList = buttonList;
      },
      changeStepIndex(step) {
        this.stepIndex = step;
      },
      changeTabStatus(status) {
        this.showTab = status;
      },
    },
  };
</script>

<style scoped>
  .content {
    /*height: calc(100vh - 120px);*/
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
  .bottom-area {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 80px;
    padding: 0 16px;
    background-color: white;
  }
  .bottom-button {
    flex: 1;
    border-radius: 20px;
  }
</style>

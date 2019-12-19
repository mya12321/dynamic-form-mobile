<template>
  <div class="wrapper">
    <div class="icon">
      <img src="@/assets/img/success@2x.png">
    </div>
    <div class="successText">{{successTitle}}</div>
    <div class="describeText">{{successDescription}}</div>
    <div class="buttonArea">
      <el-button v-if="this.matterId != 1430" type="primary" plain @click="backHome">返回首页</el-button>
      <el-button type="primary" @click="toDetail">查看详情</el-button>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Finish',
    data() {
      return {
        matterName: '',
        userMatterId: 0,
        matterId: 0,
        successTitle: '',
        successDescription: '',
      };
    },
    mounted() {
      this.$emit('flowVisibleChange', false);
      this.matterName = this.$route.query.matterName;
      this.userMatterId = this.$route.query.userMatterId;
      if (this.$route.query.matterId) {
        this.matterId = this.$route.query.matterId;
      }
      if (this.matterId == 1430) {
        this.successTitle = '事项提交成功';
        this.successDescription = `请在“个人中心-我的办理”中管理项目进度`;
      } else {
        this.successTitle = '提交成功';
        this.successDescription = `尊敬的用户，您的【${this.matterName}】业务已提交成功`;
      }
    },
    methods: {
      backHome() {
        if (window.__wxjs_environment || navigator.userAgent.includes("miniProgram")) {
          wx.miniProgram.navigateBack({
            delta: 1
          });
        } else {
          window.location.href = this.baseUrl + '/backIndex';
        }
      },
      toDetail() {
        if (window.__wxjs_environment || navigator.userAgent.includes("miniProgram")) {
          let url = `${location.origin}/h5/#/userMatterDetail?matterId=${this.matterId}&userMatterId=${this.userMatterId}&token=${sessionStorage.getItem('token')}`;
          location.replace(url);
        } else {
          let isNewMatter = this.$store.state.isNewMatter;
          if (isNewMatter) {
            let url = this.baseUrl + '/gotoDetail?userBusId=' + this.userMatterId;
            if (this.matterId) {
              url += '&matterId=' + this.matterId;
            }
            window.location.href = url;
          } else {
            window.location.href = this.baseUrl + '/backIndex';
          }
        }
      },
    },
  }
</script>

<style>
  .icon {
    width: 100%;
    height: 120px;
    line-height: 120px;
    margin-top: 20px;
    text-align: center;
  }
  .icon>img {
    width: 80px;
    height: 80px;
    vertical-align: middle;
  }
  .successText {
    font-size: 24px;
    color: #4672F6;
    text-align: center;
    font-weight: 900;
    margin: 8px;
  }
  .describeText {
    padding: 8px 40px;
    color: #999;
  }
  .buttonArea {
    display: flex;
    flex-grow: 1;
    justify-content: space-evenly;
    position: absolute;
    bottom: 15vh;
    width: 100%;
  }
  .buttonArea>button {
    flex: 1;
    margin: 0 10px;
    border-radius: 20px;
  }
</style>

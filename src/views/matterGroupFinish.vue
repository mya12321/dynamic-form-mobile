<template>
  <div>
    <div class="content">
      <img src="../assets/img/chenggong@2x.png">
      <div class="title">事项提交成功</div>
      <div class="desc">请在“个人中心-工业项目100天”模块进行查看</div>
    </div>
    <div class="commit-area">
      <el-button type="primary" plain @click="gotoDetail">查看详情</el-button>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'matterGroupFinish',
    data() {
      return {
        industrialId: 0,
        times: 0,
        role: '',
        name: '',
      };
    },
    mounted() {
      let query = this.$route.query;
      if (query.industrialId) {
        this.industrialId = query.industrialId;
        this.name = query.name;
        this.$post('api/user/matter/worker/userMatterStatus/query', {userMatterId: this.industrialId}).then(({body}) => {
          this.times = body.times;
          this.role = body.role;
        });
      }
    },
    methods: {
      gotoDetail() {
        location.href = `${this.baseUrl}/industrialDetail?industrialId=${this.industrialId}&times=${this.times}&roleType=${this.role}&name=${this.name}`;
      },
    },
  };
</script>

<style scoped>
  .content {
    margin-top: 81px;
    text-align: center;
  }
  .content>img {
    width: 240px;
    height: 186px;
  }
  .title {
    color: #4672F6;
    font-size: 18px;
    font-weight: 700;
  }
  .desc {
    margin-top: 8px;
    color: #999;
    font-size: 14px;
  }
  .commit-area {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 35px 16px;
  }
  .commit-area>button {
    width: 100%;
    border-radius: 20px;
  }
</style>

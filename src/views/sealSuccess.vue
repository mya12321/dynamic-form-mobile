<template>
  <div class="content" :style="{height: clientHeight+'px'}">
    <div class="header">
      <img class="icon" src="@/assets/img/zhengwu_zizhu_zhifu_chengg@2x.png"/>
      <div class="text">盖章成功</div>
      <div class="time">盖章时间：{{time}}</div>
    </div>
    <div class="preview">
      <div class="title">盖章预览</div>
      <img class="previewimg" :src="url"/>
    </div>
    <div class="btn">
      <div class="chunk" @click="goBack">返回</div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'sealSucces',
    data() {
      return {
        clientHeight: '',
        matterId: '',
        userMatterId: '',
        url: '',
        time:''
      };
    },
    props:{},
    mounted() {
      this.clientHeight = document.documentElement.clientHeight;
      this.matterId = this.$route.query.matterId;
      this.userMatterId = this.$route.query.userMatterId;
      this.url = this.$route.query.url;
      var now  = new Date();
      var year = now.getFullYear(); //获取年份
      var month = now.getMonth(); //获取月份 月份要+1
      var date = now.getDate(); //获取日期
      var hour = now.getHours(); //获取时
      var minu = ''; //获取分钟
      if (minu>=10){
        minu = now.getMinutes();
      } else {
        minu = '0'+now.getMinutes();
      }
      this.time = year+'年'+month+'月'+date+'日'+ hour+':'+minu;
    },
    methods: {
      goBack(){
        this.$router.replace({
          path: 'signAndVerify',
          query: {
            matterId: this.matterId,
            userMatterId: this.userMatterId
          }
        })
      }
    }
  };
</script>

<style scoped>
  .content{
    background-color: #F5F5F5;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
  }
  .header{
    height: 120px;
    background-color: #ffffff;
    text-align: center;
    font-size: 12px;
    color: #999999;
  }
  .header .icon{
    width: 36px;
    height: 36px;
    margin-top: 20px;
  }
  .header .text{
    color: #11D08B;
    font-size: 20px;
  }
  .preview{
    background-color: #ffffff;
    padding: 0 16px;
    height: 316px;
    margin-top: 16px;
    text-align: center;
  }
  .preview .title{
    font-size: 14px;
    color: #000;
    padding-top: 15px;
    text-align: left;
  }
  .preview .previewimg{
    width: 240px;
    height: 240px;
    margin-top: 20px;
  }
  .btn{
    height:44px;

    text-align: center;
    line-height: 44px;
    font-size: 16px;
    color: #ffffff;
    position: fixed;
    bottom: 16px;
    left: 0px;
    width: 100%;
  }
  .btn .chunk{
    background:rgba(70,114,246,1);
    border-radius:22px;
    margin: 0 16px;
  }
</style>

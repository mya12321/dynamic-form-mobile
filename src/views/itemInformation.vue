<template>
  <div class="content" :style="{height: clientHeight+'px'}">
    <div class="header">
      <div :class="tab == 0?'active ly-50':'ly-50'" @click="chunkTab(0)">事项信息</div>
      <div :class="tab == 1?'active ly-50':'ly-50'" @click="chunkTab(1)">事项正文</div>
    </div>
    <div v-if="tab == 0">
      <div class="chunk">
        <div class="list-li">
          <div class="name">事项名称</div>
          <div class="text">{{matterName}}</div>
        </div>
        <div class="list-li">
          <div class="name">创建时间</div>
          <div class="text">2019-05-28</div>
        </div>
        <div class="list-li">
          <div class="name">状&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;态</div>
          <div class="text"><span class="type">{{status}}</span></div>
        </div>
        <div class="list-li">
          <div class="name">来&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;源</div>
          <div class="text">{{userName}}，{{userPhone}}<span class="source">服务公社用户</span></div>
        </div>
      </div>
      <div class="plan">
        <div class="title">项目进度</div>
        <div class="ul">
          <div class="li active" v-for="(item, index) in timeList.filter(each => each.active)" :key="index">
            <img class="icon" src="@/assets/img/diAN@2x.png"/>
            <div class="name">{{item.name}}</div>
            <div class="time">{{item.time}}</div>
          </div>
          <div class="li" v-for="(item, index) in timeList.filter(each => !each.active)" :key="index">
            <img class="icon" src="@/assets/img/HUIDIAN@2x.png"/>
            <div class="name">{{item.name}}</div>
            <div class="time">{{item.time}}</div>
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="tab == 1">
      1111
    </div>
    <div class="btn" v-if="show == true">立即盖章</div>
  </div>
</template>

<script>
  export default {
    name: 'itemInformation',
    data() {
      return {
        clientHeight: '',
        userMatterId: '',
        itemId: '',
        matterName: '',
        tab: 0,
        userName: '',
        userPhone: '',
        status: '',
        show: false,
        timeList: ''
      };
    },
    props:{},
    mounted() {
      this.clientHeight = document.documentElement.clientHeight;
      document.title = '事项预览';
      this.userMatterId = this.$route.query.userMatterId;
      this.itemId = this.$route.query.itemId;
      this.status = this.$route.query.status;
      if (this.status == "已签章"){
        this.show == false
      } else {
        this.show == true
      }
      this.itemDetail();
    },
    methods: {
      //事项详情
      itemDetail(){
        var list = [];
        this.$post('user/matter/info?itemId='+JSON.parse(this.itemId)+'&userMatterId='+JSON.parse(this.userMatterId)+'').then((res) => {
          for (let i=0;i<res.body.times.length;i++){
            res.body.times[i].active = false;
          }
          res.body.times[res.body.times.length-1].active = true;
          for(let i=res.body.times.length-1;i>=0;i--){
            list.push(res.body.times[i]);
          }
          this.userName = res.body.userMatter.createdBy;
          this.userPhone = res.body.userMatter.userPhone;
          this.matterName = res.body.userMatter.matterName;
          this.timeList = list;
        });
      },
      //切换
      chunkTab(e){
        this.tab = e;
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
    height: 50px;
    line-height: 50px;
    text-align: center;
    font-size: 14px;
    color: #000000;
    background-color: #ffffff;
  }
  .header .ly-50{
    width: 49.8%;
    float: left;
    height: 100%;
    border-right: 1px solid #EEEEEE;
  }
  .header .ly-50:last-child{
    border-right: 0;
  }
  .header .ly-50.active{
    color: #4672F6;
    border-bottom: 2px solid #4672F6;
  }
  .chunk{
    background-color: #ffffff;
    position: relative;
    padding: 0 0 0 16px;
    margin-top: 16px;
  }
  .chunk .list-li{
    padding: 16px 16px 16px 0;
    border-bottom: 1px solid #F5F5F5;
    position: relative;
  }
  .chunk .list-li .name{
    font-size: 14px;
    color: #999999;
    padding: 16px 0;
    position: absolute;
    top: 0px;
    left: 0px;
  }
  .chunk .list-li .text{
    padding-left: 80px;
    font-size: 14px;
    color: #000000;
  }
  .chunk .list-li .text .source{
    font-size: 12px;
    color: #999999;
    border: 1px solid #CCCCCC;
    border-radius: 4px;
    padding: 0px 4px;
    margin-left: 8px;
  }
  .chunk .list-li .text .type{
    font-size: 12px;
    color: #FFA149;
    border: 1px solid #FFA149;
    padding: 0 4px;
    border-radius: 4px;
  }
  .plan{
    background-color: #ffffff;
    margin-top: 16px;
    padding: 0 16px;
    padding-bottom: 70px;
    position: relative;
  }
  .plan .title{
    padding: 16px 0 16px 0;
    color: #999999;
    font-size: 14px;
  }
  .plan .ul{
    height: 100%;
    border-left: 1px dashed #DDDDDD;
    margin-left: 16px;
  }
  .plan .ul .li{
    position: relative;
    padding-left: 16px;
    margin-bottom: 16px;
  }
  .plan .ul .li .name{
    font-size: 14px;
    color: #000000;
    padding-top: 3px;
  }
  .plan .ul .li .time{
    font-size: 12px;
    color: #999999;
    margin-top: 3px;
    padding-bottom: 3px;
  }
  .plan .ul .li .icon{
    width: 16px;
    height: 16px;
    position: absolute;
    top: 5px;
    left: -8px;
  }
  .plan .ul .li.active .name{
    color: #4672F6;
  }
  .btn{
    width:100px;
    height:44px;
    background:rgba(70,114,246,1);
    box-shadow:0px 4px 8px 0px rgba(70,114,246,0.3);
    border-radius:25px;
    text-align: center;
    line-height: 44px;
    color: #ffffff;
    font-size: 16px;
    position: fixed;
    bottom: 160px;
    right: 16px;
  }
</style>

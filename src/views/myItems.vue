<template>
  <div class="content" :style="{height: clientHeight+'px'}">
    <div class="header">
      <div class="ly-50">
        <div class="pending">1</div>
        <div class="stues">待处理</div>
      </div>
      <div class="ly-50">
        <div class="achieve">1</div>
        <div class="stues">已完成</div>
      </div>
    </div>
    <div class="item">
      <div class="user">
        <div class="user-magges">
          <div class="name">因修建铁路、机场、供电、 水因修建铁路、机场、供电、 水<div class="status">待盖章</div></div>
          <div class="number">办理人：向先龙 时间：2019-05-28</div>
        </div>
      </div>
      <div class="matter">
        <span>事项预览</span>
        <img class="icon" src="@/assets/img/wode_banli_xia.png"/>
      </div>
      <div class="signature">
        <div class="name">立即盖章</div>
      </div>
    </div>
    <div class="item">
      <img class="type" src="@/assets/img/zw_qz_lb_yigaizhang@2x.png"/>
      <div class="user">
        <div class="user-magges">
          <div class="name">因修建铁路、机场、供电、 水因修建铁路、机场、供电、 水</div>
          <div class="number">办理人：向先龙 时间：2019-05-28</div>
        </div>
      </div>
      <div class="matter">
        <span>事项预览</span>
        <img class="icon" src="@/assets/img/wode_banli_xia.png"/>
      </div>
      <div class="preview">
        <div class="title">盖章预览</div>
        <div class="seal">
          <img src="@/assets/img/chapter.png"/>
        </div>
        <img class="icon" src="@/assets/img/wode_banli_xia.png"/>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'myItems',
    data() {
      return {
        clientHeight: ''
      };
    },
    props:{},
    mounted() {
      this.clientHeight = document.documentElement.clientHeight;
      document.title = '我的事项';
    },
    methods: {

    }
  };
</script>

<style scoped>
  .content{
    background-color: #F5F5F5;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 16px;
  }
  .header{
    background-color: #ffffff;
    height: 60px;
    padding: 30px 0;
  }
  .header .ly-50{
    width: 49.8%;
    height: 100%;
    float: left;
    border-right: 1px solid #EEEEEE;
    text-align: center;
    font-size: 12px;
    color: #999999;
  }
  .header .ly-50:last-child{
    border-right: 0;
  }
  .header .ly-50 .pending{
    font-size: 32px;
    color: #4672F6;
  }
  .header .ly-50 .achieve{
    font-size: 32px;
    color: #000000;
  }
  .content .item{
    background-color: #ffffff;
    border-radius: 8px;
    padding: 0 16px;
    position: relative;
    margin: 16px 16px 0px 16px;
  }
  .content .item .type{
    width: 88px;
    height: 66px;
    position: absolute;
    top: 0px;
    right: 0px;
  }
  .content .item .user{
    padding: 16px 0;
    position: relative;
  }
  .content .item .user .user-magges .name{
    color: #000;
    font-size: 16px;
    padding-right: 50px;
    position: relative;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
  }
  .content .item .user .user-magges .number{
    color: #999999;
    font-size: 12px;
    margin-top: 5px;
  }
  .content .item .user .user-magges .name .status{
    width: 44px;
    height: 18px;
    text-align: center;
    line-height: 18px;
    border-radius: 4px;
    display: inline-block;
    border: 1px solid #FFA149;
    font-size: 12px;
    color: #FFA149;
    position: absolute;
    top: 0px;
    right: 0px;
  }
  .content .item .matter{
    padding: 16px 0;
    color: #000000;
    font-size: 14px;
    border-top: 1px solid #F5F5F5;
    border-bottom: 1px solid #F5F5F5;
    position: relative;
    padding-right: 16px;
  }
  .content .item .matter .icon{
    width: 7px;
    position: absolute;
    top: 20px;
    right: 0px;
  }
  .content .item .signature{
    position: relative;
    padding: 16px 0;
    overflow: hidden;
  }
  .content .item .signature .name{
    color: #4672F6;
    font-size: 16px;
    float: right;
  }
  .content .item .preview{
    height: 72px;
    position: relative;
    padding: 16px 16px 16px 0;
    border-bottom: 1px solid #F5F5F5;
  }
  .content .item .preview .title{
    font-size: 14px;
    color: #000000;
    line-height: 72px;
  }
  .content .item .preview .icon{
    width: 7px;
    position: absolute;
    top: 47px;
    right: 0px;
  }
  .content .item .preview .autonym{
    width: 116px;
    height: 62px;
    padding: 10px 16px;
    border: 1px solid #F5F5F5;
    border-radius: 4px;
    position: absolute;
    top: 10px;
    right: 16px;
  }
  .content .item .preview .autonym img{
    width: 100%;
    height: 100%;
  }
  .content .item .preview .seal{
    width: 62px;
    height: 62px;
    padding: 8px 8px;
    border: 1px solid #F5F5F5;
    border-radius: 4px;
    position: absolute;
    top: 8px;
    right: 16px;
  }
  .content .item .preview .seal img{
    width: 100%;
    height: 100%;
  }
  .content .item .preview .authentication{
    width: 124px;
    height: 80px;
    position: absolute;
    top: 8px;
    right: 16px;
  }
  .content .item .preview .authentication .chunk{
    width: 60px;
    height: 80px;
    float: left;
    margin-right: 4px;
  }
  .content .item .preview .authentication .chunk:last-child{
    margin-right: 0;
  }
  .content .item .preview .authentication .chunk .lump{
    width: 60px;
    height: 38px;
    margin-bottom: 4px;
  }
  .content .item .preview .authentication img{
    width: 100%;
    height: 100%;
    border-radius: 4px;
  }
</style>

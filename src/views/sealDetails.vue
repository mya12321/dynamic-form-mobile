<template>
  <div class="content" :style="{height: clientHeight+'px'}">
    <div v-for="item in sealdetail" :key="item.secCode">
      <div class="item">
        <div class="title">横向文字 (印章类型)</div>
        <div class="input"><div class="name">{{item.name}}</div></div>
      </div>
      <div class="item">
        <div class="title">防伪码</div>
        <div class="input"><div class="name">{{item.secCode}}</div></div>
      </div>
      <div class="item">
        <div class="title">印章预览</div>
        <div class="example">
          <img :src="item.url"/>
        </div>
      </div>
      <div class="btn" @click="delet(item)">删除</div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'sealDetails',
    data() {
      return {
        clientHeight: '',
        sealdetail: ''
      };
    },
    props:{},
    mounted() {
      var list = [];
      this.clientHeight = document.documentElement.clientHeight;
      document.title = '印章详情';
      list.push(JSON.parse(this.$route.query.data));
      this.sealdetail = list;
    },
    methods: {
      //删除印章
      delet(e){
        this.$post('api/user/company/del', {
          id: e.id,
          type: 'yz'
        }).then(() => {
          this.$alert("删除成功");
          this.$router.replace({
            path: 'mycorporateSeal',
          })
        });
      },
    }
  };
</script>

<style scoped>
  .content{
    background-color: #F5F5F5;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
  }
  .item{
    background-color: #ffffff;
    padding: 0 16px;
    margin-top: 16px;
  }
  .item .title{
    font-size: 14px;
    color: #000000;
    padding: 16px 0;
  }
  .item .input{
    padding-bottom: 16px;
    font-size: 16px;
    color: #000000;
    position: relative;
  }
  .item .input .name{
    font-size: 16px;
    color: #000000;
  }
  .item .input input{
    font-size: 16px;
    color: #000000;
    border: 0;
    padding-left: 0;
    margin-left: 0;
    background-color: #ffffff;
  }
  .item .input .exhibition img{
    width: 8px;
    height: 6px;
    position: relative;
    top: -2px;
    margin-right: 4px;
  }
  .item .example{
    text-align: center;
    padding-bottom: 30px;
  }
  .item .example img{
    width: 238px;
  }
  .btn{
    height: 44px;
    margin: 20px 16px 16px 16px;
    text-align: center;
    line-height: 44px;
    border-radius: 22px;
    font-size: 16px;
    color: #ffffff;
    background-color: #4672F6;
  }
</style>

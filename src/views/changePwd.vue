<template>
  <div class="content" :style="{height: clientHeight+'px'}">
    <div class="item">
      <div class="title">新印章密码</div>
      <div class="input"><input type="password" v-model="newPwd" oninput="value=value.replace(/[^\d]/g,'')" maxlength="6" placeholder="使用印章时需要的密码，6位数字"></div>
    </div>
    <div class="btn btns" @click="submit">确认</div>
  </div>
</template>

<script>
  export default {
    name: 'changePwd',
    data() {
      return {
        clientHeight: '',
        orderNum: '',
        companyId: '',
        newPwd: ''
      };
    },
    props:{},
    mounted() {
      this.clientHeight = document.documentElement.clientHeight;
      document.title = '修改密码';
      this.companyId = this.$route.query.companyId;
      this.orderNum = this.$route.query.orderNum;
    },
    methods: {
      submit(){
        if (this.newPwd == "" || this.newPwd.length<6){
          this.$alert("请输入正确的6位数密码");
        }else{
          var remit = this.$post('api/user/company/auth/pwd', {
            companyId: this.companyId,
            orderNum: this.orderNum,
            newPwd: this.newPwd
          });Promise.all([remit]).catch(msg => {
            this.$alert(msg);
            return Promise.reject(msg);
          }).then(() => {
            this.$alert("修改密码成功");
            this.$router.push({
              path: 'mycorporateSeal',
            })
          });
        }
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
    color: #999999;
  }
  .item .input input{
    font-size: 16px;
    color: #000000;
    border: 0;
    padding-left: 0;
    margin-left: 0;
    background-color: #ffffff;
    width: 100%;
  }
  .item .input .exhibition{
    display: inline-block;
    font-size: 16px;
    color: #4672F6;
    position: absolute;
    top: 0px;
    right: 0px;
  }
  .item .input .exhibition img{
    width: 8px;
    height: 6px;
    position: relative;
    top: -2px;
    margin-right: 4px;
  }
  .btn{
    height: 44px;
    margin: 20px 16px 16px 16px;
    border: 1px solid #4672F6;
    text-align: center;
    line-height: 44px;
    border-radius: 22px;
    font-size: 16px;
    color: #4672F6;
  }
  .btns{
    background-color: #4672F6;
    color: #ffffff;
  }
</style>

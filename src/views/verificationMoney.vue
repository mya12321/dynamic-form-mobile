<template>
  <div class="content" :style="{height: clientHeight+'px'}">
    <div class="hint">系统会自动打一笔随机金额的验证款到这个企业银行卡中，请注意查看打款方为“浙江律讯网络科技有限公司”的一笔验证款，并在本页面输入金额进行验证</div>
    <div class="item">
      <div class="title">验证金额（分）</div>
      <div class="input"><input typeof="number" oninput="value=value.replace(/[^\d]/g,'')" placeholder="0.00" v-model="money"></div>
    </div>
    <div class="chunk">
      <div class="ly-50"><div class="btn" @click="cancel">取消创建</div></div>
      <div class="ly-50"><div class="btn btns" @click="moneyCheck">确认创建</div></div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'verificationMoney',
    data() {
      return {
        clientHeight: '',
        orderCode: '',
        money: '',
        companyId: '',
        type: ''//type=1为修改密码
      };
    },
    props:{},
    mounted() {
      this.clientHeight = document.documentElement.clientHeight;
      document.title = '验证金额';
      this.orderCode = this.$route.query.orderCode;
      this.companyId = this.$route.query.companyId;
      this.type = this.$route.query.type;
    },
    methods: {
      //对公账户打款金额对比
      moneyCheck(){
        if (this.money == ''){
          this.$alert("打款金额不能为空");
          return;
        }
        var remit = this.$post('api/user/company/money/check', {
          orderCode: this.orderCode,
          money: this.money
        });
        Promise.all([remit]).catch(msg => {
          this.$alert(msg);
          return Promise.reject(msg);
        }).then(() => {
          if (this.type == 1){
            this.$alert("金额比对成功");
            this.$router.replace({
              path: 'changePwd',
              query: {
                orderNum: this.orderCode,
                companyId: this.companyId
              }
            })
          }else{
            this.$alert("金额比对成功");
            this.$router.replace({
              path: 'mycorporateSeal',
            })
          }
        });
      },
      //取消创建
      cancel(){
        this.$post('api/user/company/del',{
          id: this.companyId,
          type: 'gs'
        }).then(() => {
          this.$alert("取消成功");
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
  .hint{
    padding: 0 16px;
    font-size: 12px;
    color: #999999;
    margin-top: 16px;
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
  .chunk .ly-50{
    width: 50%;
    float: left;
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

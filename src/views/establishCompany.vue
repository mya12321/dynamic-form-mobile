<template>
  <div class="content" :style="{height: clientHeight+'px'}">
    <div class="item">
      <div class="title">企业名称</div>
      <div class="input"><input type="text" v-model="name" placeholder="请输入企业名称"></div>
    </div>
    <div class="item">
      <div class="title">社会统一信用代码</div>
      <div class="input"><input type="text" v-model="sucCode" placeholder="请输入社会统一信用代码"></div>
    </div>
    <div class="item">
      <div class="title">法人</div>
      <div class="input"><input type="text" v-model="legal" placeholder="请输入法人姓名"></div>
    </div>
    <div class="item">
      <div class="title">法人电话</div>
      <div class="input"><input typeof="number" oninput="value=value.replace(/[^\d]/g,'')" maxlength="11" v-model="legalPhone" placeholder="请输入法人电话"></div>
    </div>
    <div class="item">
      <div class="title">印章密码</div>
      <div class="input"><input type="password" oninput="value=value.replace(/[^\d]/g,'')" maxlength="6" v-model="pwd" placeholder="印章密码"></div>
    </div>
    <div class="chunk">
      <div class="ly-50"><div class="btn" @click="cancel">取消创建</div></div>
      <div class="ly-50"><div class="btn btns" @click="nextStep">下一步</div></div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'establishCompany',
    data() {
      return {
        clientHeight: '',
        name: '',
        sucCode: '',
        legal: '',
        legalPhone: '',
        pwd: ''
      };
    },
    mounted() {
      this.clientHeight = document.documentElement.clientHeight;
      document.title = '创建企业';
    },
    methods: {
        //取消创建
        cancel(){
          this.$router.replace({
            path: 'mycorporateSeal',
          })
        },
        //下一步
        nextStep(){
          if (this.name == ""){
            this.$alert('企业名称不能为空');
          }else if (this.sucCode == "" || this.sucCode.length != 18){
            this.$alert('请输入正确社会统一信用代码');
          }else if (this.legal == ""){
            this.$alert('法人不能为空');
          }else if (!/^1[0-9]{10}$/.test(this.legalPhone)){
            this.$alert('请输入正确的手机号');
          }else if (this.pwd == "" || this.pwd <= 5){
            this.$alert('请输入6位数字印章密码');
          }else{
            var remit = this.$post('api/user/company/base/auth', {
              name: this.name,
              sucCode: this.sucCode,
              legal: this.legal,
              legalPhone: this.legalPhone,
              pwd: this.pwd
            });
            Promise.all([remit]).catch(msg => {
              this.$alert(msg);
              return Promise.reject(msg);
            }).then((res) => {
              this.$alert("创建成功");
              this.$router.replace({
                path: 'authenticationCompany',
                query: {
                  companyId: res[0].body.id
                }
              })
            });
          }
        },
    }
  };
</script>

<style scoped>
  body{
    overflow: hidden;
  }
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
  .item .input input{
    font-size: 16px;
    color: #000000;
    border: 0;
    padding-left: 0;
    margin-left: 0;
    width: 100%;
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

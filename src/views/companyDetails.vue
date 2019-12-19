<template>
  <div class="content" :style="{height: clientHeight+'px'}">
    <div v-for="item in baseAuth" :key="item.sucCode">
      <div class="item">
        <div class="title">企业名称</div>
        <div class="input"><div class="name">{{item.name}}</div></div>
      </div>
      <div class="item">
        <div class="title">社会统一信用代码</div>
        <div class="input"><div class="name">{{item.sucCode}}</div></div>
      </div>
      <div class="item">
        <div class="title">法人</div>
        <div class="input"><div class="name">{{item.legal}}</div></div>
      </div>
      <div class="item">
        <div class="title">法人电话</div>
        <div class="input"><div class="name">{{item.legalPhone}} </div></div>
      </div>
      <div class="item">
        <div class="title">印章密码<span class="amend" @click="amend">修改</span><span class="amend" @click="amends">重置</span></div>
        <div class="input"><div class="name">******</div></div>
      </div>
      <div class="btn" @click="delet(item)">删除</div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'companyDetails',
    data() {
      return {
        clientHeight: '',
        baseAuth: []
      };
    },
    props:{},
    mounted() {
      var list = [];
      this.clientHeight = document.documentElement.clientHeight;
      document.title = '企业详情';
      list.push(JSON.parse(this.$route.query.data));
      this.baseAuth = list;
    },
    methods: {
      amend(){
        this.$router.replace({
          path: 'authPwd',
          query: {
            companyId: this.baseAuth[0].id
          }
        })
      },
      amends(){
        this.$router.replace({
          path: 'authenticationCompany',
          query: {
            companyId: this.baseAuth[0].id,
            type: 1
          }
        })
      },
      //删除企业
      delet(e){
        /*this.$confirm('确定要删除吗？',null,{callback:(action,instance)}).then((res) => {
          console.log(res);
          this.$post('api/user/company/del', {
            id: e.id,
            type: 'gs'
          }).then(() => {
            this.$alert("删除成功");
            this.$router.replace({
              path: 'mycorporateSeal',
            })
          });
        }).catch((res) => {
          console.log(res);
        });*/
        this.$confirm('确定要删除吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(() => {
          this.$post('api/user/company/del', {
            id: e.id,
            type: 'gs'
          }).then(() => {
            this.$alert("删除成功");
            this.$router.replace({
              path: 'mycorporateSeal',
            })
          });
        }).catch(() => {

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
  .item .title .amend{
    float: right;
    color: #4672F6;
    margin-left: 20px;
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

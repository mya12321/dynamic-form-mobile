<template>
  <div class="content" :style="{height: clientHeight+'px'}">
    <div class="hint">系统会自动打一笔随机金额的验证款到这个企业银行卡中，请注意查看打款方为“浙江律讯网络科技有限公司”的一笔验证款</div>
    <div class="item">
      <div class="title">企业开户行</div>
      <div class="input inputs">
        <div class="name" @click="down(0)">{{bankBank}}</div>
        <div class="exhibition" @click="down(0)" v-if="show0 == false"><img class="icon-del" src="@/assets/img/icon_ty_xiala@2x.png"/></div>
        <div class="exhibition" @click="up(0)" v-else-if="show0 == true"><img class="icon-del" src="@/assets/img/zw_qz_shouqi@2x.png"/>收起</div>
      </div>
    </div>
    <div class="item" v-if="rest == true">
      <div class="title">开户行名称</div>
      <div class="input"><input @focus="choosetBank" typeof="text" v-model="importText" placeholder="请输入开户行名称"></div>
    </div>
    <div class="item">
      <div class="title">开户行所在市</div>
      <div class="input inputs">
        <div class="name" @click="down(1)">{{areaName}}</div>
        <div class="exhibition" @click="down(1)" v-if="show1 == false"><img class="icon-del" src="@/assets/img/icon_ty_xiala@2x.png"/></div>
        <div class="exhibition" @click="up(1)" v-else-if="show1 == true"><img class="icon-del" src="@/assets/img/zw_qz_shouqi@2x.png"/>收起</div>
      </div>
    </div>
    <div class="item" v-if="rest == true">
      <div class="title">开户行支行名称</div>
      <div class="input"><input typeof="text" placeholder="请输入开户行支行名称" v-model="braBank"></div>
    </div>
    <div class="item">
      <div class="title">开户行卡号</div>
      <div class="input"><input typeof="number" oninput="value=value.replace(/[^\d]/g,'')" maxlength="19" placeholder="请输入开户行卡号" v-model="cardNo"></div>
    </div>
    <div class="item">
      <div class="title">开户姓名</div>
      <div class="input"><input typeof="text" placeholder="请输入开户姓名" v-model="acctName"></div>
    </div>
    <div class="chunk">
      <div class="ly-50"><div class="btn" @click="cancel">取消创建</div></div>
      <div class="ly-50"><div class="btn btns" @click="verification">获取验证金额</div></div>
    </div>
    <div class="cmp" v-if="show0 == true">
      <div class="chunk">
        <div class="li" v-for="(item, index) in bankList" :key="index" @click="selectBank(item)"><img class="icon" :src="item.icon"/>{{item.name}}</div>
        <div class="li" @click="selectBank(0)">其他银行</div>
      </div>
    </div>
    <div class="cmps" v-if="show1 == true">
      <div class="contents" :style="{height: clientHeight-200+'px'}">
        <div class="title">请选择开户行所在市<img class="close" @click="close" src="@/assets/img/zw_qz_mm_gb@2x.png"/></div>
        <div class="address">
          <span :class="province == '请选择'?'active':''" @click="newselect">{{province}}</span>
          <img v-if="show2 == true" class="next" src="@/assets/img/icon_ty_xiayiji@2x.png"/>
          <span v-if="show2 == true"  :class="city == '请选择'?'active':''">{{city}}</span>
        </div>
        <div class="item" :style="{height: clientHeight-298+'px'}">
          <div class="item-li" v-for="item in cityList" :key="item.areaName" @click="selectCity(item)">{{item.areaName}}</div>
        </div>
      </div>
    </div>
    <div class="pop" :style="{height: clientHeight-241+'px'}" v-if="pop == true">
      <div class="li" v-for="(item, index) in listBank" :key="index" @click="option(item)">{{item.name}}</div>
    </div>
  </div>
</template>

<script>
  var areaId,orderCode;
  export default {
    name: 'authenticationCompany',
    data() {
      return {
        clientHeight: '',
        show0: false,
        show1: false,
        show2: false,
        rest: false,
        pop: false,
        bankBank: '请选择企业开户行',
        cityCode: '',
        cardNo: '',
        acctName: '',
        areaName: '请选择开户行所在市',
        companyId: '',
        bankList: '',
        cityList: '',
        bankCode: '',
        provinceCode: '',
        province: '请选择',
        city: '请选择',
        braBank: '',
        Banksol: '',
        importText: '',
        listBank: '',
        type: ''//type=1为修改密码
      };
    },
    props:{},
    mounted() {
      this.clientHeight = document.documentElement.clientHeight;
      document.title = '企业认证';
      this.companyId = this.$route.query.companyId;
      this.type = this.$route.query.type;
      /*this.bankInfo();*/
    },
    methods: {
      /*bankInfo(){
        var remit = this.$get('api/user/company/bank/info/'+this.companyId+'', {

        });
        Promise.all([remit]).catch(msg => {
          this.$alert(msg);
        }).then((res) => {
            this.cardNo = res[0].body[0].bankCard;
            this.acctName = res[0].body[0].bankAccountName;
            this.bankCode = res[0].body[0].bankCode;
            this.cityCode = res[0].body[0].bankCity;
            this.braBank = res[0].body[0].bankAccountName;
            this.bankBank = '光大银行';
            this.areaName = '重庆 重庆市';
        });
      },*/
      //展开企业开户行
      down(e){
        if (e == 0){
          var code = "code=01";
          this.show0 = true;
          this.$post('api/config/list', code ).then((res) => {
            this.bankList = res.body;
          });
        }else if (e == 1){
          this.show1 = true;
          areaId = 0;
          this.area();
        }
      },
      //收起企业开户行
      up(e){
        if (e == 0){
          this.show0 = false;
        }else if (e == 1){
          this.show1 = false;
        }
      },
      //企业开户行选择
      selectBank(e){
        if (e == 0){
          this.bankBank = "其他银行";
          this.show0 = false;
          this.rest = true;
          this.bankCode = "";
        }else{
          this.bankBank = e.name;
          this.bankCode = e.value;
          this.show0 = false;
          this.rest = false;
        }
      },
      //开户行所在城市
      selectCity(e){
        if (e.level == 1){
          this.provinceCode == e.areaId;
          this.province = e.areaName;
          this.show2 = true;
          areaId = e.areaId;
          this.city = "请选择";
          this.area();
        }else{
          this.show2 = true;
          this.show1 = false;
          this.city = e.areaName;
          this.cityCode = e.areaId;
          this.areaName = this.province+"  "+e.areaName;
        }
      },
      //重新选择
      newselect(){
        this.province = "请选择";
        this.city = "请选择";
        this.show2 = false;
        this.provinceCode = '',
        this.cityCode = '',
        this.areaName = '请选择开户行所在市';
        areaId = 0;
        this.area();
      },
      //获取省市区
      area(){
        this.$get('api/area/'+areaId+'', ).then((res) => {
          this.cityList = res.body;
        });
      },
      //关闭城市选择
      close(){
        this.show1 = false;
      },
      //选择其他银行时获取银行列表
      choosetBank(){
        var code = "code=02";
        this.$post('api/config/list', code ).then((res) => {
          this.Banksol = res.body;
        });
      },
      //选择其他银行时选择银行
      option(e){
        this.pop = false;
        this.importText = e.name;
        this.bankCode = e.value;
      },
      //获取验证金额
      verification(){
        if (this.bankBank == "请选择企业开户行") {
          this.$alert("请选择企业开户行");
        } else if (this.areaName == "请选择开户行所在城市"){
          this.$alert("请选择开户行所在城市");
        } else{
          var remit = this.$post('api/user/company/bank/remit', {
            companyId: this.companyId,
            cardNo: this.cardNo,
            acctName: this.acctName,
            bankCode: this.bankCode,
            cityCode: this.cityCode,
            braBank: this.braBank,
            provinceCode: this.provinceCode
          });
          Promise.all([remit]).catch(msg => {
            this.$alert(msg);
            return Promise.reject(msg);
          }).then((res) => {
            orderCode = res[0].body;
            if (this.type == 1){
              let remit = this.$post('api/user/company/remit/check', {
                orderCode: res[0].body
              });
              Promise.all([remit]).catch(msg => {
                this.$alert(msg);
                return Promise.reject(msg);
              }).then(() => {
                this.$router.replace({
                  path: 'verificationMoney',
                  query: {
                    orderCode: orderCode,
                    companyId: this.companyId,
                    type: this.type
                  }
                })
              });
            }else{
              let remit = this.$post('api/user/company/remit/check', {
                orderCode: res[0].body
              });
              Promise.all([remit]).catch(msg => {
                this.$alert(msg);
                return Promise.reject(msg);
              }).then(() => {
                this.$router.replace({
                  path: 'verificationMoney',
                  query: {
                    orderCode: orderCode,
                    companyId: this.companyId
                  }
                })
              });
            }
          });
        }
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
    },
    watch: {
      importText(e) {
        var data = [];
        var Banksol = this.Banksol;
        for (var i=0;i<Banksol.length;i++){
          if (Banksol[i].name.substring(0,Banksol.length).indexOf(e) != -1){
            data.push(Banksol[i]);
          }
        }
        this.listBank = data;
        if (e == ""){
          this.pop = false;
        } else{
          this.pop = true;
        }

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
    color: #000000;
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
  .cmp{
    width: 100%;
    background-color: #ffffff;
    position: absolute;
    top: 165px;
    left: 0px;
  }
  .cmp .chunk{
    padding: 0 16px;
    color: #000;
    font-size: 16px;
  }
  .cmp .chunk .li{
    padding: 10px 0;
    position: relative;
    padding-left: 25px;
  }
  .cmp .chunk .li .icon{
    width: 16px;
    height: 16px;
    position: absolute;
    top: 14px;
    left: 0px;
  }
  .cmps{
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0px;
    left: 0px;
    background: rgba(0,0,0,0.6);
  }
  .cmps .contents{
    background-color: #ffffff;
    position: absolute;
    width: 100%;
    bottom: 0px;
    left: 0px;
  }
  .cmps .contents .title{
    height: 52px;
    line-height: 52px;
    font-size: 20px;
    font-weight: 600;
    padding: 0 16px;
    position: relative;
  }
  .cmps .contents .title .close{
    width: 40px;
    height: 40px;
    position: absolute;
    top: 6px;
    right: 0px;
  }
  .cmps .contents .address{
    height: 46px;
    line-height: 46px;
    padding: 0 16px;
    border-bottom: 1px solid #F5F5F5;
    font-size: 14px;
  }
  .cmps .contents .address .active{
    color: #4672F6;
    border-bottom: 4px solid #4672F6;
    padding-bottom: 7px;
  }
  .cmps .contents .address .next{
    width: 30px;
    height: 30px;
    position: relative;
    top: 9px;
  }
  .cmps .contents .item{
    overflow: auto;
    -webkit-overflow-scrolling: touch;
  }
  .cmps .contents .item .item-li{
    padding: 10px 0;
    font-size: 14px;
  }
  .pop{
    background-color: #ffffff;
    width: 100%;
    position: fixed;
    top: 241px;
    left: 0px;
    overflow: auto;
  }
  .pop .li{
    font-size: 14px;
    color: #000000;
    padding: 10px 16px;
  }
</style>

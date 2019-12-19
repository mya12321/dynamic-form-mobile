<template>
  <div class="content" :style="{height: clientHeight+'px'}">
    <div class="sky" v-if="allList.length == 0">
      <img src="@/assets/img/ty_qs_wushuju@2x.png"/>
      <div class="text">您还未添加企业印章</div>
    </div>
    <div class="btn" v-if="allList.length == 0" @click="sealAdd">添加印章</div>
    <div v-for="(item, index) in companyList" :key="index" v-else-if="allList.length != 0">
      <div class="tab">
        <span class="name">{{item.name}}</span>
        <div class="change" @click="tabshows">更换</div>
        <div class="list" v-if="tabshow == true">
          <div class="list-li" v-for="(item, index) in allList" :key="index" @click="selectCompany(item)">{{item.name}}</div>
        </div>
      </div>
      <div class="item">
        <div class="item-block" v-for="item in item.stamps" :key="item.url" @click="select(item)">
          <div class="chunk">
            <div class="img">
              <img :src="item.url"/>
            </div>
            <div class="name">{{item.name}}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="cmp" v-if="passwordshow == true">
      <div class="pay-tool">
        <div class="pay-tool-title border-bottom">
          <span class="name">请输入印章密码</span>
          <div class="close" @click="close"><img src="@/assets/img/zw_qz_mm_gb@2x.png"/></div>
        </div>
        <div class="hint" v-for="(item, index) in companyList" :key="index">将使用“{{item.name}}”，签署“{{matterName}}”事项，请确认。</div>
        <div class="pay-tool-content">
          <div class="pay-tool-inputs">
            <div class="item" v-for="i in items" :key="i"><span class="icon_dot" v-if="password[i]"></span></div>
          </div>
        </div>
        <div class="reminder"><span @click="amend">忘记密码?</span></div>
        <div class="pay-tool-keyboard">
          <ul>
            <li @click="keyUpHandle($event)" v-for="val in keys" :key="val">
              {{ val }}
            </li>
            <li class="del" @click="delHandle"><img class="icon-del" src="@/assets/img/Cannel@2x.png"/></li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  const keys = () => [1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0];
  export default {
    name: 'corporateSeal',
    data() {
      return {
        show: true,
        clientHeight: '',
        items: [0, 1, 2, 3, 4, 5],
        keys: keys(),
        password: [],
        passwordshow: false,
        companyId: '',
        stampId: '',
        userMatterId: '',
        userMatterItemId: '',
        matterId: '',
        matterName: '',
        companyList: '',
        allList: '',
        tabshow: false,
        url: '',
        name: '',
        sucCode: ''
      };
    },
    props:{},
    mounted() {
      this.clientHeight = document.documentElement.clientHeight;
      document.title = '企业印章';
      this.userMatterId = this.$route.query.userMatterId;
      this.userMatterItemId = this.$route.query.userMatterItemId;
      this.matterName = this.$route.query.matterName;
      this.matterId = this.$route.query.matterId;
      this.name = this.$route.query.name;
      this.sucCode = this.$route.query.sucCode;
      this.list();
    },
    methods: {
      //公司切换
      tabshows(){
        if(this.tabshow == false){
          this.tabshow = true;
        }else if (this.tabshow == true){
          this.tabshow = false;
        }
      },
      //选择企业
      selectCompany(e){
        this.list(e.id);
        this.companyId = e.id;
        this.tabshow = false;
      },
      //获取公司用户公司印章
      list(e){
        this.$post('api/user/company/list', {

        }).then((res) => {
          var list = [];
          this.allList = res.body;
          if (e == undefined){
            list.push(res.body[0]);
            this.companyList = list;
            this.companyId = res.body[0].id;
          }else{
            for (var i=0;i<res.body.length;i++){
              if (e == res.body[i].id){
                list.push(res.body[i]);
                this.companyList = list;
              }
            }
          }
        });
      },
      //使用印章
      select(e){
        this.passwordshow = true;
        this.stampId = e.id;
        this.url = e.url;
      },
      //关闭密码输入
      close(){
        this.passwordshow = false
        this.password = []
      },
      //密码框
      backHandle () {
        this.clearPasswordHandle() // 返回时清除password
        this.$emit('backFnc') // 返回上级
      },
      keyUpHandle (e) {
        let text = e.currentTarget.innerText;
        let len = this.password.length;
        if (!text || len >= 6) return;
        this.password.push(text);
        this.ajaxData();
      },
      delHandle () {
        if (this.password.length <= 0) return false
        this.password.shift()
      },
      ajaxData () {
        if (this.password.length >= 6) {
          this.passwordshow = false;
          this.signStamp(parseInt(this.password.join(' ').replace(/\s/g, '')));
          this.password = []
        }
        return false
      },
      clearPasswordHandle: function () {
        this.password = []
      },
      //事项签章
      signStamp(e){
        var remit = this.$post('api/user/company/sign/stamp', {
          companyId: this.companyId,
          stampId: this.stampId,
          userMatterId: this.userMatterId,
          userMatterItemId: this.userMatterItemId,
          pwd: e,
          name: this.name,
          sucCode: this.sucCode
        });
        Promise.all([remit]).catch(msg => {
          this.$alert(msg);
          return Promise.reject(msg);
        }).then((res) => {
          if (res[0].err_code == 0){
            this.$router.replace({
              path: 'sealSuccess',
              query: {
                matterId: this.matterId,
                userMatterId: this.userMatterId,
                url: this.url
              }
            })
          }
        });
      },
      //忘记密码
      amend(){
        this.$router.replace({
          path: 'authenticationCompany',
          query: {
            companyId: this.companyId,
            type: 1
          }
        })
      },
      //添加印章
      sealAdd(){
        this.$router.replace({
          path: 'mycorporateSeal',
        })
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
  .content .sky{
    padding-top: 100px;
    text-align: center;
    font-size: 16px;
    color: #BAC3D0;
  }
  .content .sky img{
    width: 240px;
    height: 160px;
  }
  .tab{
    width: 100%;
    height: 50px;
    background-color: #ffffff;
    position: relative;
    line-height: 50px;
    font-size: 14px;
    color: #000000;
    position: fixed;
    top: 0px;
    left: 0px;
  }
  .tab .name{
    margin-left: 16px;
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    padding-right: 80px;
  }
  .tab .change{
    display: inline-block;
    float: right;
    position: relative;
    color: #4672F6;
    margin-right: 16px;
    padding-right: 15px;
    margin-top: -50px;
  }
  .tab .change:after{
    display:block;
    content:'';
    border-width:4px 4px 4px 4px;
    border-style:solid;
    border-color:#4672F6 transparent transparent transparent;
    position:absolute;
    right:0px;
    top:23px;
  }
  .tab .list{
    background-color: #ffffff;
    position: absolute;
    top: 51px;
    left: 0px;
    width: 100%;
    text-align: center;
  }
  .tab .list .list-li{
    border-bottom: 1px solid #F5F5F5;
  }
  .item{
    overflow: hidden;
    padding: 0 8px;
    margin-bottom: 16px;
    margin-top: 51px;
  }
  .item .item-block{
    width: 50%;
    height: auto;
    float: left;
    margin-top: 16px;
  }
  .item .item-block .chunk{
    margin: 0 8px;
    background-color: #ffffff;
    border-radius: 8px;
  }
  .item .item-block .chunk .img{
    padding: 8px;
  }
  .item .item-block .chunk .img img{
    width: 100%;
    height: 100%;
  }
  .item .item-block .chunk .name{
    height: 40px;
    line-height: 40px;
    font-size: 14px;
    color: #000000;
    padding: 0px 16px;
    border-top: 1px solid #F5F5F5;
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
  }

  .pay-tool {
    width: 100%;
    position: absolute;
    height: 415px;
    background-color: #fff;
    overflow: hidden;
    left: 0px;
    bottom: 0px;
  }
  .pay-tool-inputs {
    height: 54px;
    margin: 0px 16px;
    border: 1px solid #E0E0E1;
    box-shadow: 0 0 1px #E0E0E1;
    display: flex;
    background-color: #F6F6F7;
  }
  .pay-tool-inputs .item {
    width: 16.66666666%;
    height: 54px;
    border-right: 1px solid #E0E0E1;
    line-height: 54px;
    text-align: center;
    margin-top: 0;
    margin-bottom: 0;
  }
  .pay-tool-inputs:last-child {
     border-right: none;
   }
  .pay-tool-inputs .icon_dot {
    display: inline-block;
    width: 10px;
    height: 10px;
    background: url("../assets/img/xiaoheidian@2x.png") no-repeat;
    background-size: cover;
  }
  .pay-tool-keyboard{
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
  }
  .pay-tool-keyboard ul {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    list-style-type: none;
    padding-left: 0;
    margin: 0;
    background-color: #F6F6F7;
  }
  .pay-tool-keyboard ul .icon-del{
    width: 28px;
    height: 20px;
  }
  .pay-tool-keyboard li {
    width: 33.15%;
    height: 50px;
    line-height: 50px;
    text-align: center;
    border-right: 1px solid #E0E0E1;
    border-bottom: 1px solid #E0E0E1;
    font-size: 26px;
    font-weight: bold;
    color: #2A2B2C;
    font-weight: 400;
  }
  .pay-tool-keyboard li:nth-child(10){
    /*background: url("../assets/img/XIAOJIANPAN@2x.png") no-repeat;
    background-size: cover;*/
  }
  .pay-tool-keyboard :nth-child(3), .pay-tool-keyboard :nth-child(6), .pay-tool-keyboard :nth-child(9), .pay-tool-keyboard :nth-child(12) {
     border-right: none;
   }
  .pay-tool-keyboard :nth-child(10), .pay-tool-keyboard :nth-child(11), .pay-tool-keyboard :nth-child(12) {
     border-bottom: none;
   }
  .pay-tool-keyboard :nth-child(10), .pay-tool-keyboard :nth-child(12), .pay-tool-keyboard :active {
     background-color: #F6F6F7;
   }
  .pay-tool-keyboard :nth-child(12):active {
     background-color: #fff;
   }
  .pay-tool .border-bottom{
    padding: 24px 0px 0px 16px;
    font-size: 20px;
    color: #000000;
  }
  .pay-tool .border-bottom .close{
    width: 40px;
    height: 40px;
    float: right;
    margin-top: -5px;
  }
  .pay-tool .border-bottom .close img{
    width: 100%;
    height: 100%;
  }
  .pay-tool .hint{
    margin: 0 16px;
    font-size: 12px;
    color: #CCCCCC;
    margin-top: 5px;
    margin-bottom: 10px;
  }
  .pay-tool .reminder{
    text-align: right;
    font-size: 14px;
    color: #000;
    margin: 0 16px;
    margin-top: 15px;
  }
  .cmp{
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0px;
    left: 0px;
    background:rgba(0,0,0,0.5);
  }
  .content .btn{
    position: fixed;
    bottom: 10px;
    left: 2.5%;
    width: 95%;
    height: 43px;
    line-height: 43px;
    text-align: center;
    color: #4672F6;
    border-radius: 43px;
    font-size: 16px;
    border: 1px solid #4672F6;
  }
</style>

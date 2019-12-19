<template>
  <div class="content">
    <div class="lump" :style="{height: clientHeight-61+'px'}">
      <div class="sky" v-if="show == false">
        <img src="@/assets/img/ty_qs_wushuju@2x.png"/>
        <div class="text">您还未添加企业印章</div>
      </div>
      <div class="main" v-for="item in companyList.filter(each => show && each.status != 1)" :key="item.name">
        <div class="tab" @click="next(item)">
          <span class="name">{{item.name}}</span>
          <span class="type" v-if="item.status != 4">创建中</span>
          <img class="pull-right" src="@/assets/img/icon_ty_xiayiji@2x.png"/>
        </div>
        <div class="item" v-if="item.status == 4">
          <div class="item-block" v-for="item in item.stamps" :key="item.url" @click="lookSeal(item)">
            <div class="chunk">
              <div class="img">
                <img :src="item.url"/>
              </div>
              <div class="name">{{item.name}}</div>
            </div>
          </div>
          <div class="item-block add" @click="addSeal(item)">
            <div class="chunk">
              <img class="icon" src="@/assets/img/zw_qz_tianjiayz@2x.png"/>
              <div class="text">添加印章</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="btn"><div class="chunk" @click="addCompany">创建企业</div></div>
  </div>
</template>

<script>
  export default {
    name: 'mycorporateSeal',
    data() {
      return {
        show: '',
        clientHeight: '',
        companyList: ''
      };
    },
    props:{},
    mounted() {
      this.clientHeight = document.documentElement.clientHeight;
      document.title = '企业印章';
      //获取公司用户公司印章
      var remit = this.$post('api/user/company/list', {

      });
      Promise.all([remit]).catch(msg => {
        this.$alert(msg);
        return Promise.reject(msg);
      }).then((res) => {
        if (res[0].body.length == 0){
          this.show = false
        }else{
          this.show = true
        }
        this.companyList = res[0].body;
      });
    },
    methods: {
      //去创建企业
      addCompany(){
        this.$router.push({
          path: 'establishCompany',
        })
      },
      //添加印章
      addSeal(e){
        this.$router.push({
          path: 'addSeal',
          query: {
            name: e.name,
            id: e.id
          }
        })
      },
      //查看印章详情
      lookSeal(e){
        this.$router.push({
          path: 'sealDetails',
          query: {
            data: JSON.stringify(e)
          }
        })
      },
      //继续认证
      next(e){
        if (e.status == "01"){
          this.$router.push({
            path: 'establishCompany',
            query: {
              companyId: e.id
            }
          })
        }else if (e.status == "02"){
          this.$router.push({
            path: 'authenticationCompany',
            query: {
              companyId: e.id
            }
          })
        }else if (e.status == "03"){
          var remit = this.$post('api/user/company/remit/check', {
            orderCode: e.orderNum
          });
          Promise.all([remit]).catch(msg => {
            this.$alert(msg);
            return Promise.reject(msg);
          }).then(() => {
            this.$router.push({
              path: 'verificationMoney',
              query: {
                orderCode: e.orderNum,
                companyId: e.id
              }
            })
          });
        }else if (e.status == "031"){
          this.$router.push({
            path: 'verificationMoney',
            query: {
              orderCode: e.orderNum,
              companyId: e.id
            }
          })
        }else if (e.status == "032"){
          this.$router.push({
            path: 'authenticationCompany',
            query: {
              companyId: e.id
            }
          })
        }else if (e.status == "04"){
          this.$router.push({
            path: 'companyDetails',
            query: {
              data: JSON.stringify(e)
            }
          })
        }
      },
    }
  };
</script>

<style scoped>
  .content{
    background-color: #F5F5F5;
    -webkit-overflow-scrolling: touch;
  }
  .content .lump{
    overflow: auto;
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
    height: 50px;
    padding: 0 0 0 16px;
    background-color: #ffffff;
    position: relative;
    line-height: 50px;
    font-size: 14px;
    color: #000000;
    border-bottom: 1px solid #F5F5F5;
    margin-top: 16px;
    padding-right: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .tab .pull-right{
    width: 40px;
    height: 40px;
    position: absolute;
    top: 5px;
    right: 0px;
  }
  .tab .type{
    color: #FFA149;
    font-size: 12px;
    border:1px solid #FFA149;
    border-radius: 4px;
    padding: 0 4px;
    margin-left: 4px;
    position: absolute;
    top: 13px;
    right: 30px;
    line-height: 20px;
  }
  .tab .change{
    display: inline-block;
    float: right;
    position: relative;
    color: #4672F6;
    padding-right: 15px;
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
  .item{
    overflow: hidden;
    padding: 0 8px;
    margin-bottom: 16px;
    background-color: #ffffff;
    padding-bottom: 16px;
  }
  .item .item-block{
    width: 50%;
    float: left;
    margin-top: 16px;
  }
  .item .item-block .chunk{
    margin: 0 8px;
    background-color: #F5F5F5;
    border-radius: 8px;
    height: 100%;
    text-align: center;
  }
  .item .item-block .chunk .img{
    width: 135px;
    height: 145px;
    margin: 0 auto;
  }
  .item .item-block .chunk .img img{
    width: 100%;
    margin-top: 5px;
  }
  .item .item-block .chunk .name{
    height: 40px;
    line-height: 40px;
    font-size: 14px;
    color: #000000;
    padding: 0px 16px;
    border-top: 1px solid #EEEEEE;
    text-align: left;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .item .item-block .chunk .text{
    font-size: 14px;
    color: #4672F6;
    margin-top: -40px;
  }
  .btn{
    height: 61px;
    width: 100%;
    position: fixed;
    bottom: 0px;
    left: 0px;
    background-color: #ffffff;
  }
  .btn .chunk{
    margin: 0 16px;
    height: 45px;
    text-align: center;
    line-height: 45px;
    border: 1px solid #4672F6;
    color: #4672F6;
    font-size: 16px;
    border-radius: 23px;
    background-color: #ffffff;
    margin-top: 8px;
  }
  .add{
    height: 186px;
  }
  .add .icon{
    width: 135px;
    height: 135px;
  }
</style>

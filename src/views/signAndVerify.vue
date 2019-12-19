<template>
  <div class="content" :style="{height: clientHeight+'px'}">
    <div class="no-result" v-if="!resultList.length">无实名/签名数据</div>
    <div :style="{height: clientHeight-63+'px'}" class="content-block">
      <div class="item" v-for="(item, index) in resultList" :key="index">
        <img v-if="(item.itemType == 'qyqz' && item.url) || ((item.itemType == 'qmsm' && item.url)&&(item.itemType == 'qyqz' && item.url)&&(item.result == 'Y')) || ((item.itemType == 'qyqz' && item.url)&&(item.itemType == 'qmsm' && item.url)) || ((item.itemType == 'qyqz' && item.url)&&(item.result == 'Y'))" class="identification" src="@/assets/img/zw_qz_lb_yigaizhang@2x.png"/>
        <img v-if="(item.itemType == 'qm' && item.url) || ((item.itemType == 'qmsm' && item.url)&&(item.result == 'Y'))" class="identification" src="@/assets/img/zw_qz_lb_yiqian@2x.png"/>
        <img v-if="item.result == 'Y' && item.itemType == 'sm'" class="identification" src="@/assets/img/zw_qz_lb_yishiming@2x.png"/>
        <div class="user">
          <div class="user-img"><img src="@/assets/img/tou.png"/></div>
          <div class="user-magges">
            <div class="name">{{item.itemValue}}<div class="status" v-if="item.statusText.charAt(0) !== '已'">{{item.statusText}}</div></div>
            <div class="number" v-if="item.idCardText">{{item.idCardText}}</div>
          </div>
        </div>
        <div class="matter" @click="itemDetail(item)">
          <span>事项预览</span>
          <span class="name">{{item.matterName}}</span>
          <img class="icon" src="@/assets/img/wode_banli_xia.png"/>
        </div>
        <div class="preview" v-if="(item.itemType === 'sm' || item.itemType === 'qmsm') && item.result == 'Y'">
          <div class="title">活体检测</div>
          <div class="authentication">
            <div class="chunk"><img :src="item.liveImg"/></div>
          </div>
          <img class="icon" src="@/assets/img/wode_banli_xia.png"/>
        </div>
        <div class="preview" v-if="(item.itemType === 'sm' || item.itemType === 'qmsm') && item.result == 'Y'">
          <div class="title">实名认证</div>
          <div class="authentication">
            <div class="chunk add" v-if="item.ocrImg.split(',').length == 1">
              <img class="add_imgcsss" :src="item.ocrImg.split(',')[0]"/>
            </div>
            <div class="chunk" v-else-if="item.ocrImg.split(',').length == 2" style="width: 250px;">
              <img class="add_imgcss" :src="item.ocrImg.split(',')[1]"/>
              <img class="add_imgcss" :src="item.ocrImg.split(',')[0]"/>
            </div>
          </div>
          <img class="icon" src="@/assets/img/wode_banli_xia.png"/>
        </div>
        <div class="preview" v-if="(item.itemType === 'qm' || item.itemType === 'qmsm') && item.url">
          <div class="title">签名预览</div>
          <div class="autonym">
            <img :src="item.url"/>
          </div>
          <img class="icon" src="@/assets/img/wode_banli_xia.png"/>
        </div>
        <div class="preview" v-if="item.itemType == 'qyqz' && item.url">
          <div class="title">盖章预览</div>
          <div class="seal">
            <img :src="item.url"/>
          </div>
          <img class="icon" src="@/assets/img/wode_banli_xia.png"/>
        </div>
        <div class="signature">
          <div class="name" @click="operationItem(item)">{{item.nextStepText}}</div>
        </div>
      </div>
    </div>
    <!--<div class="bar">-->
      <!--<div class="flow">-->
        <!--<img class="icon" src="@/assets/img/zhengwu_zizhu_banli_liucheng1@2x.png"/>-->
        <!--<div class="name">流程</div>-->
      <!--</div>-->
      <!--<el-button type="primary" plain round @click="goBack">上一步</el-button>-->
      <!--<el-button :disabled="!finalCommit" type="primary" round @click="commitOrder">提交</el-button>-->
    <!--</div>-->
  </div>
</template>

<script>
  import {fetch as fetchPolyfill} from 'whatwg-fetch';

  export default {
    name: 'SignAndVerify',
    data() {
      return {
        resultList: [],
        clientHeight: '',
        finalCommit: false,
        // 永川测试
        appId: '2018011415435000074',
        appKey: 'OZDNi1vd0wJ6VpH',
        // 嘉鱼测试
        // appId: '2017122817385300047',
        // appKey: 'Yu6zZSDJmxTrRgWw',
        interval: 0,
        buttons: [],
      };
    },
    props: ['matterId', 'userMatterId', 'matterName', 'userId', 'noTree', 'stepList', 'prePage', 'payAmount', 'payRemark', 'hasPayAmount', 'needPay'],
    beforeDestroy() {
      clearInterval(this.interval);
    },
    mounted() {
      this.clientHeight = document.documentElement.clientHeight;
      // let verifyStatusStr = this.$route.query.verifyStatus;
      // if (verifyStatusStr) {
      //   this.verifyStatus = JSON.parse(verifyStatusStr);
      // }
      // let currentStatus = this.$route.query.currentStatus;
      // let userMatterItemId = this.$route.query.userMatterItemId;
      // if (currentStatus === 'true' && userMatterItemId) {
      //   this.$set(this.verifyStatus, userMatterItemId, true);
      // }
      let stepData = {
        index: -1,
      };
      this.$emit('stepChange', stepData);
      let loading = this.$loading({
        lock: true,
        text: '正在加载',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.3)'
      });
      this.getData().then(() => loading.close());
      this.interval = setInterval(() => this.getData(), 1000);
      YHTVF.init(this.appId, then => {
        this.getToken(token => {
          YHTVF.setToken(token);
          YHTVF.do(then);
        });
      });
      let returnButton = {
        id: 'xxxxxxxxxx1',
        type: 'primary',
        text: '上一步',
        plain: true,
        click: this.goBack,
      };
      let commitButton = {
        id: 'xxxxxxxxxxx2',
        type: 'primary',
        text: '提交',
        status: this.finalCommit ? 'edit' : 'disabled',
        click: this.commitOrder,
      };
      this.buttons = [returnButton, commitButton];
      this.$emit('buttonChange', this.buttons);
      this.$emit('stepActiveChange', 3);
    },
    methods: {
      getData() {
        return this.$get('user/matter/sign/' + this.userMatterId).then(({body}) => {
          if (body.length) {
            let tempCommit = true;
            this.resultList = body.sort((a, b) => a.itemId - b.itemId).map(item => {
              let initObj = {
                idCardText: '',
                statusText: '',
                isOk: false,
                timeText: '',
                nextStepText: '',
              };
              let newItem = Object.assign(initObj, item);
              if (item.itemType === 'qm') {
                if (item.url) {
                  newItem.isOk = true;
                  newItem.statusText = '已签名';
                  newItem.nextStepText = '重新签名';
                  if (newItem.sigDate) {
                    newItem.timeText = new Date(newItem.sigDate).format('yyyy-MM-dd HH:mm');
                  }
                } else {
                  tempCommit = false;
                  newItem.statusText = '待签名';
                  newItem.nextStepText = '立即签名';
                }
              } else if (item.itemType === 'sm') {
                if (item.certNo) {
                  let text = item.certNo + '';
                  let arr = text.split('');
                  for (let i = 9; i < 14; i++) {
                    arr[i] = '*';
                  }
                  newItem.idCardText = arr.join('');
                }
                if (item.result === 'Y') {
                  if (item.name === item.itemValue && item.idCard === item.certNo) {
                    newItem.isOk = true;
                    newItem.statusText = '已实名';
                    newItem.nextStepText = '重新实名';
                    if (newItem.ocrDate) {
                      newItem.timeText = new Date(newItem.ocrDate).format('yyyy-MM-dd HH:mm');
                    }
                  } else {
                    tempCommit = false;
                    newItem.statusText = '实名失败';
                    newItem.nextStepText = '重新实名';
                    let params = {
                      notifyId: item.notifyId,
                      result: false,
                    };
                    this.$post('api/ocr/updateResult', params);
                    this.$confirm(`实名认证失败, 身份证信息不匹配, 请使用身份证号为${newItem.idCardText}的身份证重新认证.`, '提示', {
                      confirmButtonText: '重新认证',
                    }).then(() => this.verify(newItem));
                  }
                } else {
                  tempCommit = false;
                  newItem.statusText = '待实名';
                  newItem.nextStepText = '立即实名';
                }
              } else if (item.itemType === 'qmsm') {
                if (item.certNo) {
                  let text = item.certNo + '';
                  let arr = text.split('');
                  for (let i = 9; i < 14; i++) {
                    arr[i] = '*';
                  }
                  newItem.idCardText = arr.join('');
                }
                if (item.url && item.result === 'Y') {
                  if (item.name === item.itemValue && item.idCard === item.certNo) {
                    newItem.isOk = true;
                    newItem.statusText = '已签名';
                    newItem.nextStepText = '重新签名';
                    if (newItem.sigDate) {
                      newItem.timeText = new Date(newItem.sigDate).format('yyyy-MM-dd HH:mm');
                    }
                  } else {
                    tempCommit = false;
                    newItem.statusText = '签名失败';
                    newItem.nextStepText = '重新签名';
                    newItem.url = '';
                    let params = {
                      notifyId: item.notifyId,
                      result: false,
                    };
                    this.$post('api/ocr/updateResult', params);
                    this.$confirm(`实名认证失败, 身份证信息不匹配, 请使用身份证号为${newItem.idCardText}的身份证重新认证.`, '提示', {
                      confirmButtonText: '重新认证',
                    }).then(() => this.verify(newItem));
                  }
                } else {
                  tempCommit = false;
                  newItem.statusText = '待签名';
                  newItem.nextStepText = '立即签名';
                }
              } else if (item.itemType === 'qyqz') {
                if (item.certNo) {
                  let text = item.certNo + '';
                  let arr = text.split('');
                  for (let i = 9; i < 14; i++) {
                    arr[i] = '*';
                  }
                  newItem.idCardText = arr.join('');
                }
                if (item.url) {
                  newItem.isOk = true;
                  newItem.statusText = '已签章';
                  newItem.nextStepText = '重新签章';
                  if (newItem.sigDate) {
                    newItem.timeText = new Date(newItem.sigDate).format('yyyy-MM-dd HH:mm');
                  }
                } else {
                  tempCommit = false;
                  newItem.statusText = '待签章';
                  newItem.nextStepText = '立即签章';
                }
              }
              return newItem;
            });
            this.finalCommit = tempCommit;
          } else {
            this.finalCommit = true;
          }
        // }).catch(err => {
        //   this.$alert(err);
        });
      },
      navigateTo(item) {
        if (item.itemType === 'qm') {
          this.sign(item);
        } else if (item.itemType === 'sm' || item.itemType === 'qmsm') {
          this.verify(item);
        }
      },
      sign(item) {
        // document.title = '签名';
        this.$router.push({
          path: '/drawSign',
          query: {
            userMatterId: this.userMatterId,
            userMatterItemId: item.itemId,
          }
        });
      },
      verify(item) {
        // if (true) {
        if (window.__wxjs_environment || navigator.userAgent.includes("miniProgram")) {
          let params = {
            name: item.itemValue,
            idCard: item.certNo,
            userItemId: item.itemId,
          };
          this.$get('api/ocr/input', {params: params}).then(({body}) => {
            let notifyId = body.notifyId;
            let stepChange = {
              index: -1,
              steps: this.stepList.map(each => each.title).filter(each => each !== '类型选择' && each !== '表单项预览' && each !== '实名/签名'),
            };
            YHTVF.queryVF({
              backURL: `${location.origin}/dynamic-form-mobile/dist/#/signAndVerify?matterId=${this.matterId}&userMatterId=${this.userMatterId}&noTree=${this.noTree}&stepChange=${JSON.stringify(stepChange)}&token=${sessionStorage.getItem('token')}`,
              // backURL: `${location.origin}/#/signAndVerify?matterId=${this.matterId}&userMatterId=${this.userMatterId}&noTree=${this.noTree}&stepChange=${JSON.stringify(stepChange)}&token=${sessionStorage.getItem('token')}`,
              callBackUrl : `${this.baseUrl}/api/ocr/callback`,
              userId: notifyId,
              successFun: url => {
                if (item.itemType === 'sm') {
                  // window.location.href = url;
                  let query = {
                    src: url,
                    matterId: this.matterId,
                    userMatterId: this.userMatterId,
                    userMatterItemId: item.itemId,
                    hideHeader: true,
                  };
                  this.$router.push({
                    path: '/h5Verify',
                    query: query,
                  });
                } else if (item.itemType === 'qmsm') {
                  let query = {
                    src: url,
                    matterId: this.matterId,
                    userMatterId: this.userMatterId,
                    userMatterItemId: item.itemId,
                  };
                  // this.$router.push({
                  //   path: '/h5Verify',
                  //   query: query,
                  // });
                  this.$router.push({
                    path: '/h5Verify',
                    query: query,
                  });
                }
              },
            });
          });
        } else {
          let callbackUrl;
          let url;
          let stepChange = {
            index: -1,
            steps: this.stepList.map(each => each.title).filter(each => each !== '类型选择' && each !== '表单项预览' && each !== '实名/签名'),
          };
          if (item.itemType === 'sm') {
            callbackUrl = `${location.origin}/dynamic-form-mobile/dist/#/signAndVerify?matterId=${this.matterId}&userMatterId=${this.userMatterId}&noTree=${this.noTree}&stepChange=${encodeURIComponent(JSON.stringify(stepChange))}&token=${sessionStorage.getItem('token')}`;
            url = `${this.baseUrl}/ocrhtjcsmrz?isSign=N&idName=${item.itemValue}&idCard=${item.certNo}&userItemId=${item.itemId}&callback=${encodeURIComponent(callbackUrl)}`;
          } else if (item.itemType === 'qmsm') {
            callbackUrl = `${location.origin}/dynamic-form-mobile/dist/#/sign?matterId=${this.matterId}&userMatterId=${this.userMatterId}&userMatterItemId=${item.itemId}&noTree=${this.noTree}&stepChange=${encodeURIComponent(JSON.stringify(stepChange))}&verifyStatus=true&token=${sessionStorage.getItem('token')}`;
            url = `${this.baseUrl}/ocrhtjcsmrz?isSign=Y&idName=${item.itemValue}&idCard=${item.certNo}&userItemId=${item.itemId}&callback=${encodeURIComponent(callbackUrl)}`;
          }
          window.location.href = url;
        }
      },
      commitOrder() {
        let loading = this.$loading({
          lock: true,
          text: '正在加载',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.3)'
        });
        if (this.needPay) {
          this.$post(`user/matter/check/${this.userMatterId}/02`).then(() => {
            loading.close();
            let params = {
              userMatterId: this.userMatterId,
              payAmount: this.payAmount,
              payRemark: this.payRemark,
              hasPayAmount: this.hasPayAmount,
              token: sessionStorage.getItem('token'),
            };
            location.replace(`${location.origin}/h5/#/beforeMatterPayment?${this.$utils.toUrlParamsStr(params)}`);
          }, err => {
            loading.close();
            if (err === '表单数据不完整') {
              this.$alert('前面流程的申请表全部填写完成后才可以进行提交');
              return Promise.reject('校验未通过, 请先检查表单数据.');
            }
          });
        } else {
          this.$post('user/matter/submission/' + this.userMatterId).then(() => {
            loading.close();
            document.title = '提交成功';
            let query = {
              matterName: this.matterName,
              userMatterId: this.userMatterId
            };
            this.$router.replace({
              path: '/finish',
              query: query
            });
          }, err => {
            if (err === '表单数据不完整') {
              this.$alert('前面流程的申请表全部填写完成后才可以进行提交');
              return Promise.reject('校验未通过, 请先检查表单数据.');
            } else {
              this.$alert(err);
            }
          });
        }
      },
      getToken(callback) {
        let params = {
          appId: this.appId,
          appKey: this.appKey,
        };
        const fetch = window.fetch || fetchPolyfill;
        fetch('https://api.yunhetong.com/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            'Accept': 'application/json'
          },
          body: JSON.stringify(params),
        }).then(res => {
          if (callback && typeof callback === 'function') {
            callback(res.headers.get('token'));
          }
        });
      },
      goBack() {
        // document.title = '预览';
        // this.$router.push({
        //   path: '/previewInner',
        //   query: Object.assign({}, this.$route.query, {isInFlow: true}),
        // });
        this.$router.replace({
          path: '/previewInner',
          query: Object.assign({}, this.$route.query, {isInFlow: true}),
        });
      },
      //操作
      operationItem(e){
        if (e.itemType === 'qm') {
          this.sign(e);
        } else if (e.itemType === 'sm' || e.itemType === 'qmsm') {
          this.verify(e);
        } else if (e.nextStepText == "立即签章"){
          this.$emit('flowVisibleChange', false);
          this.$router.push({
            path: 'corporateSeal',
            query:{
              userMatterId: this.userMatterId,
              userMatterItemId: e.itemId,
              matterName: e.matterName,
              matterId: this.matterId,
              name: e.itemValue,
              sucCode: e.certNo
            }
          })
        }else if (e.nextStepText == "重新签章"){
          this.$emit('flowVisibleChange', false);
          this.$router.push({
            path: 'corporateSeal',
            query:{
              userMatterId: this.userMatterId,
              userMatterItemId: e.itemId,
              matterName: e.matterName,
              matterId: this.matterId,
              name: e.itemValue,
              sucCode: e.certNo
            }
          })
        }
      },
      //事项预览
      itemDetail(){
        // this.$router.push({
        //   path: 'itemInformation',
        //   query:{
        //     userMatterId: this.userMatterId,
        //     itemId: e.itemId,
        //     status: e.statusText
        //   }
        // })
        let query = {
          matterId: this.matterId,
          userMatterId: this.userMatterId,
          isSignPreview: true,
        };
        this.$router.push({
          path: '/previewInner',
          query: query,
        });
      },
    },
    watch: {
      finalCommit(val) {
        let status = val ? 'edit' : 'disabled';
        this.$set(this.buttons[1], 'status', status);
        this.$emit('buttonChange', this.buttons);
      },
    },
  };
</script>

<style scoped>
  body{
    background-color: #F5F5F5;
  }
  .content{
    background-color: #F5F5F5;
    padding: 0 16px;
  }
  .content-block{
    overflow: auto;
  }
  .content .item{
    background-color: #ffffff;
    border-radius: 8px;
    padding: 0 16px;
    margin-top: 16px;
    position: relative;
  }
  .content .item .identification{
    width: 88px;
    height: 66px;
    position: absolute;
    top: 0px;
    right: 0px;
    z-index: 9999;
  }
  .content .item .user{
    padding: 28px 0;
    position: relative;
  }
  .content .item .user .user-img{
    width: 45px;
    height: 45px;
    position: absolute;
    top: 16px;
    left: 0px;
  }
  .content .item .user .user-img img{
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
  .content .item .user .user-magges{
    padding-left: 61px;
  }
  .content .item .user .user-magges .name{
    color: #000;
    font-size: 16px;
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
  }
  .content .item .user .user-magges .number{
    color: #999999;
    font-size: 12px;
    margin-top: 5px;
  }
  .content .item .user .user-magges .name .status{
    padding: 0 5px;
    height: 18px;
    text-align: center;
    line-height: 18px;
    border-radius: 4px;
    display: inline-block;
    border: 1px solid #FFA149;
    font-size: 12px;
    color: #FFA149;
    float: right;
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
  .content .item .matter .name{
    color: #999999;
    float: right;
    overflow: hidden;
    text-overflow:ellipsis;
    white-space: nowrap;
    max-width: 220px;
  }
  .content .item .matter .icon{
    width: 7px;
    position: absolute;
    top: 20px;
    right: 0px;
    height: 14px;
    margin-top: 0;
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
    height: 80px;
    position: absolute;
    top: 8px;
    right: 16px;
  }
  .content .item .preview .authentication .add{
    width: 120px !important;
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
    border-radius: 4px;width: 100%;
    height: 100%;
    border-radius: 4px;
  }
  .content .item .preview .authentication .add_imgcss{
    width: 100px;
    height: 63px;
    float: right;
    margin-bottom: 5px;
    margin-left: 5px;
  }
  .content .item .preview .authentication .add_imgcsss{
    width: 100%;
    height: 100%;
    border-radius: 4px;
  }
  .content .item .preview .authentication .add_imgcss:last-child{
    margin-bottom: 0;
  }
  .bar{
    width: 100%;
    background-color: #ffffff;
    padding: 8px 0px;
    position: fixed;
    bottom: 0px;
    left: 0px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    text-align: center;
    overflow: hidden;
    border-top: 1px solid #F5F5F5;
  }
  .bar .flow{
    flex: 1;
    text-align: center;
    font-size: 12px;
    color: #000000;
    margin: 0 12px;
  }
  .bar .flow .icon{
    width: 24px;
    height: 24px;
    margin-top: 2px;
  }
  .bar .flow .name{
    margin-top: -5px;
  }
  .bar button {
    flex: 4;
    margin: 0 12px;
  }
  .no-result {
    padding-top: 16px;
    text-align: center;
  }
</style>

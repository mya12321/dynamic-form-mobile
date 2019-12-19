<template>
  <div>
    <div class="outer-wrapper">
      <div class="title-layout">
        <div>项目基本信息表</div>
        <!--<el-button v-if="showEdit" size="mini" @click="editBase">编辑</el-button>-->
      </div>
      <div class="base-wrapper">
        <div>
          <div class="item-label required">项目名称</div>
          <div class="item-value">{{baseData.projectName}}</div>
        </div>
        <div>
          <div class="item-label">项目备案号</div>
          <div class="item-value">{{baseData.projectNo}}</div>
        </div>
        <div>
          <div class="item-label required">所属园区</div>
          <div class="item-value">{{baseData.ownPark}}</div>
        </div>
        <div>
          <div class="item-label required">投资总额(万元)</div>
          <div class="item-value">{{baseData.totalInvestment}}</div>
        </div>
        <div>
          <div class="item-label required">用地面积(亩)</div>
          <div class="item-value">{{baseData.landArea}}</div>
        </div>
        <div>
          <div class="item-label required">项目地址</div>
          <div class="item-value">{{baseData.projectAddress}}</div>
        </div>
        <div>
          <div class="item-label">企业名称</div>
          <div class="item-value">{{baseData.enterpriseName}}</div>
        </div>
        <div>
          <div class="item-label required">业主单位</div>
          <div class="item-value">{{baseData.ownerUnit}}</div>
        </div>
        <div>
          <div class="item-label required">项目业主姓名</div>
          <div class="item-value">{{baseData.projectOwnerName}}</div>
        </div>
        <div>
          <div class="item-label required">项目业主电话</div>
          <div class="item-value">{{baseData.projectOwnerPhone}}</div>
        </div>
        <div>
          <div class="item-label required">代办员姓名</div>
          <div class="item-value">{{baseData.projectSecretaryName}}</div>
        </div>
        <div>
          <div class="item-label required">代办员电话</div>
          <div class="item-value">{{baseData.projectSecretaryPhone}}</div>
        </div>
        <div v-if="baseData.beginNodeId">
          <div class="item-label required">项目开始节点</div>
          <div class="item-value">{{beginNodeMap[baseData.beginNodeId]}}</div>
        </div>
        <div>
          <div class="item-label required">项目开始时间</div>
          <div class="item-value">{{new Date(baseData.beginTime).format('yyyy-MM-dd')}}</div>
        </div>
      </div>
    </div>
    <div class="outer-wrapper">
      <div class="title-layout">
        <div>完成项目计划时间表</div>
        <el-button v-if="showEdit" type="mini" @click="editDetail">编辑</el-button>
      </div>
      <div>
        <div class="base-wrapper separate" v-for="level1 in structureData.children.filter(each => contentData[each.id])" :key="level1.id">
          <div class="level1-layout">
            <div>
              <img class="title-img" v-if="specialList.includes(level1.id)" src="../assets/img/bingxing@2x.png">
              <img class="title-img" v-else src="../assets/img/wancheng@2x.png">
              <div class="level1-title">{{level1.nameOther || level1.name}}</div>
              <div class="small-flag" v-if="level1.children.length > 1 && level1.type == 2 && !specialList.includes(level1.id)">同步</div>
            </div>
            <!--<div class="date">{{contentData[level1.id]}}</div>-->
          </div>
          <div class="level2-wrapper" v-for="level2 in level1.children.filter(each => contentData[each.id])" :key="level2.id">
            <div class="level2-layout">
              <div>
                <span v-if="level2.nameOther">{{level2.nameOther}}.&nbsp;</span>
                <span>{{level2.name}}</span>
                <div class="small-flag" v-if="level2.children.length > 1 && level2.type == 2">同步</div>
              </div>
              <div class="date" v-if="!level2.children.length" :style="contentData[level2.id] === '已完成' ? {color: '#00d585', fontWeight: 600} : {}">{{contentData[level2.id]}}</div>
            </div>
            <div class="level3-layout" v-for="(level3, index_3) in level2.children" :key="level3.id">
              <div v-if="contentData[level3.id]">
                <span v-if="level2.children.length > 1">{{index_3 + 1}}.</span>
                <span>{{level3.name}}</span>
              </div>
              <div class="date" :style="contentData[level3.id] === '已完成' ? {color: '#00d585', fontWeight: 600} : {}">{{contentData[level3.id]}}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div>
      <div class="placeholder"></div>
      <!--<div class="tip">请仔细确认项目计划完成日期，如不能按期完成可能会造成不良影响</div>-->
      <div class="bottom"></div>
    </div>
    <div class="commit-area">
      <!--<div class="commit-wrapper" v-if="this.fromPath === '/preview' || this.fromPath === '/previewInner'">-->
        <!--<el-button type="primary" @click="returnClick">返回</el-button>-->
      <!--</div>-->
      <div class="commit-wrapper">
        <el-button type="primary" plain @click="goBack">上一步</el-button>
        <el-button type="primary" @click="commit">提交</el-button>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'matterGroupPreview',
    data() {
      return {
        industrialId: 0,
        baseData: {},
        structureData: {},
        contentData: {},
        showEdit: true,
        // fromPath: '',
        planStartTime: {},
        specialList: [8, 25, 28, 30, 33, 36, 39],
        beginNodeMap: JSON.parse(localStorage.getItem('beginNodeMap')),
      };
    },
    props: ['matterId', 'userMatterId'],
    mounted() {
      let query = this.$route.query;
      this.industrialId = query.industrialId;
      document.documentElement.scrollTop = 0;
      let localContent = localStorage.getItem(`industrialData|${this.industrialId}`);
      if (localContent) {
        this.contentData = JSON.parse(localContent);
      }
      let localPlanStartTime = localStorage.getItem(`planStartTime|${this.industrialId}`);
      if (localPlanStartTime) {
        this.planStartTime = JSON.parse(localPlanStartTime);
      }
      let baseRequest = this.$post('api/app/matter/getIndustrialProjectsBaseInfo', {id: this.industrialId});
      let structureRequest = this.$post('api/app/matter/getIndustrialProjects', {id: this.industrialId});
      // let contentRequest = this.$post('api/app/matter/getUserIndustrialProjects', {industrialProjectsBaseInfoId: this.industrialId});
      Promise.all([baseRequest, structureRequest]).then(res => {
        this.baseData = res[0].body;
        if (this.baseData.createdBy != this.baseData.localUser) {
          this.showEdit = false;
        }
        this.structureData = res[1].body;
        // if (res[2].body.children.length) {
        //   this.showEdit = false;
        //   let content = {};
        //   res[2].body.children.forEach(level1 => {
        //     content[level1.industrialProjectsId] = new Date(level1.planTime).format('yyyy-MM-dd');
        //     level1.children.forEach(level2 => {
        //       if (level2.children.length) {
        //         level2.children.forEach(level3 => {
        //           content[level3.industrialProjectsId] = new Date(level3.planTime).format('yyyy-MM-dd');
        //         });
        //       } else {
        //         content[level2.industrialProjectsId] = new Date(level2.planTime).format('yyyy-MM-dd');
        //       }
        //     });
        //   });
        //   this.contentData = content;
        // }
      });
    },
    methods: {
      editBase() {
        let query = {
          matterId: this.matterId,
          industrialId: this.industrialId,
        };
        this.$router.push({
          path: '/matterGroup',
          query: query,
        });
      },
      editDetail() {
        let query = {
          matterId: this.matterId,
          industrialId: this.industrialId,
        };
        this.$router.push({
          path: '/matterGroupDetail',
          query: query,
        })
      },
      goBack() {
        // let query = {
        //   matterId: this.matterId,
        //   industrialId: this.industrialId,
        // };
        // if (this.fromPath == '/matterGroup') {
        //   this.$router.push({
        //     path: '/matterGroup',
        //     query: query,
        //   });
        // } else if (this.fromPath == '/matterGroupDetail') {
        //   this.$router.push({
        //     path: '/matterGroupDetail',
        //     query: query,
        //   });
        // }
        this.$router.back();
      },
      returnClick() {
        if (window.__wxjs_environment || navigator.userAgent.includes("miniProgram")) {
          wx.miniProgram.navigateBack({
            delta: 1
          });
        } else {
          window.location.href = this.baseUrl + '/backIndex';
        }
      },
      commit() {
        this.$confirm('您是否确认提交该项目计划，一旦提交不能撤回').then(() => {
          let listData = Object.keys(this.contentData).map(key => {
            if (this.contentData[key] === '已完成') {
              return {
                industrialProjectsId: key,
                planTime: '',
                planStartTime: '',
              };
            } else {
              return {
                industrialProjectsId: key,
                planTime: this.contentData[key],
                planStartTime: this.planStartTime[key] ? new Date(this.planStartTime[key] + 24 * 60 * 60 * 1000).format('yyyy-MM-dd') : '',
              };
            }
          });
          this.$post('api/app/matter/addUserIndustrialProjects', {list: listData, industrialProjectsBaseInfoId: this.industrialId}).then(() => {
            localStorage.removeItem(`industrialData|${this.industrialId}`);
            localStorage.removeItem(`planStartTime|${this.industrialId}`);
            localStorage.removeItem('industrialBaseInfo');
            localStorage.removeItem('extraNodeData');
            let query = {
              name: this.baseData.projectName,
              industrialId: this.industrialId,
              matterId: 1430,
            };
            this.$router.push({
              path: '/matterGroupFinish',
              query: query,
            });
          }, err => {
            this.$alert(err);
          });
        });
      },
    },
    // beforeRouteEnter(to, from, next) {
    //   next(vm => vm.fromPath = from.path);
    // },
  };
</script>

<style scoped>
  .outer-wrapper {
    background-color: #f5f5f5;
    padding: 0 16px;
  }
  .title-layout {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .title-layout>div {
    font-size: 17px;
    font-color: #333;
    font-weight: 900;
    margin: 16px 0;
  }
  .title-layout>button {
    font-size: 12px;
    padding: 3px 7px;
  }
  .base-wrapper {
    position: relative;
    overflow: hidden;
    background-color: white;
    border-radius: 8px;
    padding: 8px 15px;
  }
  .item-label {
    font-size: 13px;
    font-weight: bold;
    margin: 8px 0;
  }
  .required:before {
    content: '*';
    color: #F56C6C;
    margin-right: 4px;
  }
  .item-value {
    font-size: 13px;
    border: 1px solid #eee;
    padding: 5px 10px;
    margin-bottom: 8px;
    min-height: 18px;
  }
  .separate {
    margin-bottom: 16px;
  }
  .separate:last-child {
    margin-bottom: 0;
  }
  .level1-layout {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 16px;
    font-weight: bold;
    margin: 8px 0;
  }
  .level1-title {
    position: absolute;
    left: 24px;
    top: 15px;
    display: inline-block;
    font-weight: normal;
    color: white;
  }
  .small-flag {
    position: absolute;
    right: -20px;
    top: -5px;
    width: 60px;
    padding-top: 10px;
    padding-bottom: 2px;
    font-size: 12px;
    font-weight: normal;
    color: white;
    text-align: center;
    background-color: #4672F6;
    transform: rotate(45deg);
  }
  .level2-wrapper {
    position: relative;
    overflow: hidden;
    border: 1px solid #eee;
    border-radius: 6px;
    padding: 10px 8px 2px;
    margin-bottom: 16px;
  }
  .level2-wrapper:last-child {
    margin-bottom: 8px;
  }
  .level2-layout {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
    margin-bottom: 8px;
  }
  .date {
    min-width: 80px;
    font-size: 13px;
    text-align: right;
  }
  .level3-layout {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px;
  }
  .level3-layout>div:first-child {
    color: #999;
    font-size: 12px;
  }
  .placeholder {
    height: 20px;
    background-color: #f5f5f5;
  }
  .tip {
    background-color: rgba(255, 180, 0, 0.16);
    padding: 8px 15px;
    color: #ff9d2c;
    font-size: 12px;
  }
  .bottom {
    height: 64px;
  }
  .commit-area {
    position: fixed;
    bottom: 0;
    width: 100vw;
    background-color: white;
    padding: 12px 0;
  }
  .commit-wrapper {
    display: flex;
    justify-content: space-around;
    align-items: center;
  }
  .commit-wrapper button {
    width: 40vw;
    border-radius: 20px;
    height: 40px;
  }
  .title-img {
    height: 20px;
  }
</style>
<style>
  .el-popup-parent--hidden>#app {
    height: 100vh;
    overflow: hidden;
  }
</style>

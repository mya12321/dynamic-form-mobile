<template>
  <div>
    <div class="outer-wrapper">
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
    <div class="bottom"></div>
    <div class="commit-area" v-if="role === 'secretary'">
      <el-button type="primary" @click="edit">编辑</el-button>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'matterGroupPasePreview',
    props: ['matterId', 'userMatterId'],
    data() {
      return {
        industrialId: 0,
        baseData: {},
        beginNodeMap: {},
        role: '',
      };
    },
    mounted() {
      let query = this.$route.query;
      this.industrialId = query.industrialId;
      this.role = query.role;
      document.title = '项目基础信息';
      let iframe = document.createElement('iframe');
      iframe.style.visibility = 'hidden';
      iframe.style.width = '1px';
      iframe.style.height = '1px';
      iframe.onload = function () {
        setTimeout(function () {
          document.body.removeChild(iframe);
        }, 0);
      };
      document.body.appendChild(iframe);
      let baseInfo = this.$post('api/app/matter/getIndustrialProjectsBaseInfo', {id: this.industrialId});
      let nodeInfo = this.$post('api/app/matter/getIndustrialNodes');
      Promise.all([baseInfo, nodeInfo]).then(res => {
        this.baseData = res[0].body;
        this.beginNodeMap = res[1].body.baseInfo;
      });
    },
    methods: {
      edit() {
        let query = {
          matterId: this.matterId,
          industrialId: this.industrialId,
          editBase: true,
          role: this.role,
        };
        this.$router.replace({
          path: '/matterGroup',
          query: query,
        });
      },
    },
  };
</script>

<style scoped>
  .outer-wrapper {
    background-color: #f5f5f5;
    padding: 16px ;
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
  .bottom {
    height: 64px;
  }
  .commit-area {
    display: flex;
    justify-content: space-around;
    align-items: center;
    position: fixed;
    bottom: 0;
    width: 100vw;
    background-color: white;
    padding: 12px 0;
  }
  .commit-area button {
    width: 80vw;
    border-radius: 20px;
    height: 40px;
  }
</style>

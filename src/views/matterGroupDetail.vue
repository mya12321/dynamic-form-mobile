<template>
  <div class="outer-wrapper">
    <!--<DynamicForm class="df" :schema="schema" :content="content" :rule="rule" ref="form" @change="processReference"></DynamicForm>-->
    <div class="title-text">完成项目计划时间表</div>
    <div>
      <div class="base-wrapper separate" v-for="level1 in originData.children.filter(each => content[each.id])" :key="level1.id">
        <div class="level1-layout">
          <div>
            <img class="title-img" v-if="specialList.includes(level1.id)" src="../assets/img/bingxing@2x.png">
            <img class="title-img" v-else src="../assets/img/wancheng@2x.png">
            <div class="level1-title">{{level1.nameOther || level1.name}}</div>
            <div class="small-flag" v-if="level1.children.length > 1 && level1.type == 2 && !specialList.includes(level1.id)">同步</div>
            <img class="del" v-if="level1.canDelete === 'Y'" @click="del(level1)" src="../assets/img/shanchu@2x.png">
          </div>
          <!--<div class="date">{{content[level1.id]}}</div>-->
        </div>
        <div class="level2-wrapper special" v-if="level1.id === 39">
          <div class="level2-layout">
            <div>
              <el-select size="mini" v-model="selected">
                <el-option label="编制环评文件（报告表）" :value="40"></el-option>
                <el-option label="编制环评文件（报告书）" :value="41"></el-option>
              </el-select>
            </div>
            <div class="date">{{content[selected]}}</div>
          </div>
        </div>
        <div class="level2-wrapper" v-for="level2 in level1.children.filter(each => each.id !== 40 && each.id !== 41)" :key="level2.id">
          <div class="level2-layout">
            <div>
              <span v-if="level2.nameOther">{{level2.nameOther}}.&nbsp;</span>
              <span>{{level2.name}}</span>
              <div class="small-flag" v-if="level2.children.length > 1 && level2.type == 2">同步</div>
            </div>
            <div class="date" v-if="!level2.children.length" :style="content[level2.id] === '已完成' ? {color: '#00d585', fontWeight: 600} : {}">{{content[level2.id]}}</div>
          </div>
          <div class="level3-layout" v-for="(level3, index_3) in level2.children" :key="level3.id">
            <div>
              <!--<span v-if="level3.nameOther">{{level3.nameOther}}</span>-->
              <span v-if="level2.children.length > 1">{{index_3 + 1}}.&nbsp;</span>
              <span>{{level3.name}}</span>
            </div>
            <div class="date" :style="content[level3.id] === '已完成' ? {color: '#00d585', fontWeight: 600} : {}">{{content[level3.id]}}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="placeholder"></div>
    <div class="commit-area">
      <div class="tip">{{tip}}</div>
      <div class="commit-wrapper">
        <el-button type="primary" plain @click="back">上一步</el-button>
        <el-button type="primary" @click="next">下一步</el-button>
      </div>
    </div>
  </div>
</template>

<script>
  // import DynamicForm from '@/components/DynamicForm.vue';

  export default {
    name: 'matterGroupDetail',
    data() {
      return {
        originData: {},
        // schema: {
        //   labelPosition: 'left',
        //   labelWidth: '185px',
        //   buttons: [],
        //   items: [],
        // },
        content: {
          '52': '',
        },
        planStartTime: {},
        // rule: {},
        industrialId: 0,
        // fromPath: '',
        // referenceMap: {},
        selected: 40,
        referenceArray: [],
        specialList: [8, 25, 28, 30, 33, 36, 39],
        extraNodeData: {},
      };
    },
    props: ['matterId', 'userMatterId'],
    computed: {
      tip() {
        if (this.originData.beginTime) {
          let beginTime = new Date(this.originData.beginTime).format('yyyy.MM.dd');
          let endTime = new Date(this.content[52]).format('yyyy.MM.dd');
          return '项目开始日期为' + beginTime + ', 计划竣工日期需要在' + endTime + '前';
        } else {
          return '';
        }
      },
    },
    // components: {
    //   DynamicForm
    // },
    mounted() {
      document.documentElement.scrollTop = 0;
      let query = this.$route.query;
      if (query.industrialId) {
        this.industrialId = query.industrialId;
      }
      let extraNodeData = localStorage.getItem('extraNodeData');
      if (extraNodeData) {
        this.extraNodeData = JSON.parse(extraNodeData);
      }
      this.$post('api/app/matter/getIndustrialProjects', {id: this.industrialId}).then(({body}) => {
        this.originData = body;
        // let contentData = localStorage.getItem(`industrialData|${this.industrialId}`);
        // if (contentData) {
        //   this.content = JSON.parse(contentData);
        // }
        // let planStartTime = localStorage.getItem(`planStartTime|${this.industrialId}`);
        // if (planStartTime) {
        //   this.planStartTime = JSON.parse(planStartTime);
        // }
        // let items = [];
        // let currentContent = {};
        // let startTime = this.originData.beginTime;
        // this.originData.children.forEach(level1 => {
        //   let days = 0;
        //   let tempLevel1 = {
        //     id: level1.id + '',
        //     type: 'title',
        //     text: level1.name,
        //   };
        //   if (level1.type == 2) {
        //     tempLevel1.items = [
        //       {
        //         id: 0,
        //         text: '并行',
        //         click: () => {},
        //       }
        //     ];
        //   }
        //   items.push(tempLevel1);
        //   level1.children.forEach((level2, index) => {
        //     let level2StartTime;
        //     let level3Days = 0;
        //     if (level1.type == 1) {
        //       level2StartTime = startTime + days * 24 * 60 * 60 * 1000;
        //       days += level2.days;
        //       currentContent[level2.id] = new Date(startTime + days * 24 * 60 * 60 * 1000).format('yyyy-MM-dd');
        //       if (level1.children.length !== 1) {
        //         level2.name = (index + 1) + '.' + level2.name;
        //       }
        //     } else {
        //       level2StartTime = startTime;
        //       days = Math.max(days, level2.days);
        //       currentContent[level2.id] = new Date(startTime + level2.days * 24 * 60 * 60 * 1000).format('yyyy-MM-dd');
        //     }
        //     this.referenceMap[level2.id] = level1;
        //     if (level2.children.length) {
        //       items.push({
        //         id: level2.id + '',
        //         type: 'text',
        //         text: level2.name,
        //         style: {
        //           display: 'block',
        //           position: 'relative',
        //           top: '12px',
        //           margin: '0 16px',
        //           fontSize: '13px',
        //         },
        //       });
        //       level2.children.forEach((level3, index) => {
        //         if (level2.type == 1) {
        //           level3Days += level3.days;
        //           currentContent[level3.id] = new Date(level2StartTime + level3Days * 24 * 60 * 60 * 1000).format('yyyy-MM-dd');
        //           if (level2.children.length !== 1) {
        //             level3.name = (index + 1) + '.' + level3.name;
        //           }
        //         } else {
        //           currentContent[level3.id] = new Date(level2StartTime + level3.days * 24 * 60 * 60 * 1000).format('yyyy-MM-dd');
        //         }
        //         this.referenceMap[level3.id] = level2;
        //         items.push({
        //           id: level3.id + '',
        //           type: 'date',
        //           label: level3.name,
        //           labelClass: 'level-3-label',
        //         });
        //         let singleRule = {
        //           type: 'string',
        //           required: true,
        //           message: '必填',
        //           trigger: 'blur',
        //         };
        //         this.$set(this.rule, level3.id, []);
        //         this.rule[level3.id].push(singleRule);
        //       });
        //     } else {
        //       items.push({
        //         id: level2.id + '',
        //         type: 'date',
        //         label: level2.name,
        //         labelClass: 'level-2-label',
        //       });
        //       let singleRule = {
        //         type: 'string',
        //         required: true,
        //         message: '必填',
        //         trigger: 'blur',
        //       };
        //       this.$set(this.rule, level2.id, []);
        //       this.rule[level2.id].push(singleRule);
        //     }
        //   });
        //   currentContent[level1.id] = new Date(startTime + days * 24 * 60 * 60 * 1000).format('yyyy-MM-dd');
        //   startTime += days * 24 * 60 * 60 * 1000;
        // });
        // this.schema.items = items;
        // if (!contentData) {
        //   this.content = currentContent;
        // }
        // this.schema.buttons = [
        //   {
        //     id: '0',
        //     type: 'primary',
        //     plain: true,
        //     text: '上一步',
        //     click: () => {
        //       document.title = '永川区工业项目100天开工计划';
        //       let query = {
        //         matterId: this.matterId,
        //         industrialId: this.industrialId,
        //       };
        //       if (this.fromPath == '/matterGroup') {
        //         this.$router.push({
        //           path: '/matterGroup',
        //           query: query,
        //         });
        //       } else if (this.fromPath == '/matterGroupPreview') {
        //         this.$router.push({
        //           path: '/matterGroupPreview',
        //           query: query,
        //         });
        //       }
        //     },
        //   },
        //   {
        //     id: '1',
        //     type: 'primary',
        //     text: '下一步',
        //     click: () => {
        //       this.$refs.form.validate(valid => {
        //         if (valid) {
        //           localStorage.setItem(`industrialData|${this.industrialId}`, JSON.stringify(this.content));
        //           let query = {
        //             matterId: this.matterId,
        //             industrialId: this.industrialId,
        //           };
        //           document.title = '永川区工业项目100天开工计划';
        //           this.$router.push({
        //             path: '/matterGroupPreview',
        //             query: query,
        //           });
        //         } else {
        //           this.$alert('校验未通过, 请检查数据.');
        //         }
        //       });
        //     },
        //   },
        // ];
        let startTime = this.originData.beginTime - 24 * 60 * 60 * 1000;
        this.originData.children.forEach(level1 => {
          if (this.extraNodeData.selected && this.extraNodeData.nodes.includes(level1.id)) {
          } else if (level1.startDatePid === '0') {
            this.planStartTime[level1.id] = startTime;
          } else {
            let pidArr = level1.startDatePid.split(',');
            pidArr.shift();
            pidArr.pop();
            this.planStartTime[level1.id] = Math.max(...pidArr.map(each => new Date(this.content[each].replace(/-/g, '/')).getTime()));
          }
          let level1Time = 0;
          if (level1.children.length) {
            level1.children.forEach(level2 => {
              if (this.extraNodeData.selected && this.extraNodeData.nodes.includes(level2.id)) {
              } else if ((this.extraNodeData.selected && this.extraNodeData.selected.split(',').includes(level2.id + '')) || level2.startDatePid === '0') {
                this.planStartTime[level2.id] = startTime;
              } else if (this.extraNodeData.days && (level2.id === 40 || level2.id === 41)) {
                this.planStartTime[level2.id] = startTime - this.extraNodeData.days * 24 * 60 * 60 * 1000;
              } else if (level2.id === 42) {
                this.planStartTime[level2.id] = new Date(this.content[this.selected].replace(/-/g, '/')).getTime();
              } else {
                let pidArr = level2.startDatePid.split(',');
                pidArr.shift();
                pidArr.pop();
                this.planStartTime[level2.id] = Math.max(...pidArr.map(each => new Date(this.content[each].replace(/-/g, '/')).getTime()));
              }
              let level2Time = 0;
              if (level2.children.length) {
                level2.children.forEach(level3 => {
                  if (this.extraNodeData.selected && this.extraNodeData.nodes.includes(level3.id)) {
                  } else if ((this.extraNodeData.selected && this.extraNodeData.selected.split(',').includes(level3.id + '')) || level3.startDatePid === '0') {
                    this.planStartTime[level3.id] = startTime;
                  } else {
                    let pidArr = level3.startDatePid.split(',');
                    pidArr.shift();
                    pidArr.pop();
                    this.planStartTime[level3.id] = Math.max(...pidArr.map(each => new Date(this.content[each].replace(/-/g, '/')).getTime()));
                  }
                  let level3Time = 0;
                  if (this.planStartTime[level3.id]) {
                    level3Time = new Date(this.planStartTime[level3.id] + level3.days * 24 * 60 * 60 * 1000).getTime();
                  }
                  if (level3Time > level2Time) {
                    level2Time = level3Time;
                  }
                  if (level3Time) {
                    this.content[level3.id] = new Date(level3Time).format('yyyy-MM-dd');
                  } else {
                    this.content[level3.id] = '已完成';
                  }
                });
              } else {
                if (this.planStartTime[level2.id]) {
                  level2Time = new Date(this.planStartTime[level2.id] + level2.days * 24 * 60 * 60 * 1000).getTime();
                }
                if (level2.id === 42 || level2.id === 43 || level2.id === 44 || level2.id === 52) {
                  this.referenceArray.push(level2);
                }
              }
              if (level2Time > level1Time) {
                level1Time = level2Time;
              }
              if (level2.id === this.selected || !(level2.id === 40 || level2.id === 41)) {
                if (level2Time) {
                  this.content[level2.id] = new Date(level2Time).format('yyyy-MM-dd');
                } else {
                  this.content[level2.id] = '已完成';
                }
              }
            });
            if (level1.id === 39 || level1.id === 51) {
              this.referenceArray.push(level1);
            }
          } else {
            level1Time = new Date(this.planStartTime[level1.id] + level1.days * 24 * 60 * 60 * 1000).getTime();
          }
          if (level1Time) {
            this.content[level1.id] = new Date(level1Time).format('yyyy-MM-dd');
          } else {
            this.content[level1.id] = '已完成';
          }
        });
      });
    },
    methods: {
      // diffContent(oldVal, newVal) {
      //   let result = {
      //     add: {},
      //     remove: {},
      //     replace: {},
      //
      //   };
      //   Object.keys(oldVal).forEach(key => {
      //     if (newVal.hasOwnProperty(key)) {
      //       if (oldVal[key] != newVal[key]) {
      //         result.replace[key] = {
      //           old: oldVal[key],
      //           new: newVal[key],
      //         };
      //       }
      //     } else {
      //       result.remove[key] = oldVal[key];
      //     }
      //   });
      //   Object.keys(newVal).filter(key => !oldVal.hasOwnProperty(key)).forEach(key => {
      //     result.add[key] = newVal[key];
      //   });
      //   return result;
      // },
      // processReference(oldVal, newVal) {
      //   let result = this.diffContent(oldVal, newVal);
      //   Object.keys(result.replace).forEach(key => {
      //     let parent = this.referenceMap[key];
      //     if (parent) {
      //       if (parent.type == 1) {
      //         let lastChild = parent.children[-1] || parent.children[0];
      //         this.$set(this.content, parent.id, this.content[lastChild.id]);
      //       } else {
      //         let timeStampsArr = parent.children.map(child => {
      //           return new Date(this.content[child.id].replace(/-/g, '/')).getTime();
      //         });
      //         this.$set(this.content, parent.id, new Date(Math.max(...timeStampsArr)).format('yyyy-MM-dd'));
      //       }
      //     }
      //   });
      // },
      processReference() {
        this.referenceArray.forEach(item => {
          if (item.children.length) {
            let time = Math.max(...item.children.filter(child => this.content[child.id])
              .map(child => new Date(this.content[child.id].replace(/-/g, '/')).getTime()));
            this.$set(this.content, item.id, new Date(time).format('yyyy-MM-dd'));
          } else if (item.id === 42) {
            this.planStartTime[item.id] = new Date(this.content[this.selected].replace(/-/g, '/')).getTime();
            this.$set(this.content, item.id, new Date(this.planStartTime[item.id] + item.days * 24 * 60 * 60 * 1000).format('yyyy-MM-dd'));
          } else {
            let pidArr = item.startDatePid.split(',');
            pidArr.shift();
            pidArr.pop();
            this.planStartTime[item.id] = Math.max(...pidArr.map(each => new Date(this.content[each].replace(/-/g, '/')).getTime()));
            this.$set(this.content, item.id, new Date(this.planStartTime[item.id] + item.days * 24 * 60 * 60 * 1000).format('yyyy-MM-dd'));
          }
        });
      },
      back() {
        // let query = {
        //   matterId: this.matterId,
        //   industrialId: this.industrialId,
        // };
        // if (this.fromPath == '/matterGroup') {
        //   this.$router.push({
        //     path: '/matterGroup',
        //     query: query,
        //   });
        // } else if (this.fromPath == '/matterGroupPreview') {
        //   this.$router.push({
        //     path: '/matterGroupPreview',
        //     query: query,
        //   });
        // }
        this.$router.back();
      },
      next() {
        localStorage.setItem(`industrialData|${this.industrialId}`, JSON.stringify(this.content));
        localStorage.setItem(`planStartTime|${this.industrialId}`, JSON.stringify(this.planStartTime));
        let query = {
          matterId: this.matterId,
          industrialId: this.industrialId,
        };
        this.$router.push({
          path: '/matterGroupPreview',
          query: query,
        });
      },
      del(node) {
        this.$delete(this.planStartTime, node.id);
        this.$delete(this.content, node.id);
        node.children.forEach(child => {
          this.$delete(this.planStartTime, child.id);
          this.$delete(this.content, child.id);
        });
      },
    },
    watch: {
      selected(val, oldVal) {
        let daysMap = {
          '40': 30,
          '41': 60,
        };
        // this.planStartTime[oldVal] = undefined;
        this.content[oldVal] = undefined;
        // this.planStartTime[val] = new Date(this.content['7'].replace(/-/g, '/')).getTime();
        this.$set(this.content, val, new Date(this.planStartTime[val] + daysMap[val] * 24 * 60 * 60 * 1000).format('yyyy-MM-dd'));
        this.processReference();
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
    padding: 1px 16px;
  }
  .title-text {
    font-size: 17px;
    font-color: #333;
    font-weight: 900;
    margin: 16px 0;
  }
  .tip {
    background-color: rgba(255, 180, 0, 0.16);
    padding: 8px 15px;
    margin-bottom: 12px;
    color: #ff9d2c;
    font-size: 12px;
  }
  /*.df >>> .title-item {*/
    /*position: relative;*/
  /*}*/
  /*.df >>> .title-item>div:first-child {*/
    /*display: none;*/
  /*}*/
  /*.df >>> .title-item>span.title-span {*/
    /*display: inline-block;*/
    /*box-sizing: border-box;*/
    /*width: 100vw;*/
    /*max-width: 100vw;*/
    /*margin: 25px 0 0 -8px;*/
    /*padding: 8px 0 0 12px;*/
    /*background-color: white;*/
    /*height: 30px;*/
    /*font-size: 16px;*/
  /*}*/
  /*.df >>> span.level-2-label {*/
    /*font-size: 13px;*/
    /*font-weight: normal;*/
  /*}*/
  /*.df >>> span.level-3-label {*/
    /*font-size: 12px;*/
    /*color: #999;*/
    /*font-weight: normal;*/
  /*}*/
  /*.df >>> .el-form-item {*/
    /*position: relative;*/
  /*}*/
  /*.df >>> .el-form-item__label {*/
    /*position: absolute;*/
    /*top: 50%;*/
    /*transform: translateY(-50%);*/
  /*}*/
  /*.df >>> .el-form-item__label::before {*/
    /*position: absolute;*/
  /*}*/
  /*.df >>> .el-form-item__label>span {*/
    /*margin-left: 10px;*/
  /*}*/
  /*.df >>> .title-item .el-button {*/
    /*position: absolute;*/
    /*right: 8px;*/
    /*top: 8px;*/
    /*background: white;*/
    /*color: #333;*/
    /*border: 1px solid #eee;*/
    /*border-radius: 4px;*/
  /*}*/
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
  .item-value {
    font-size: 13px;
    border: 1px solid #eee;
    padding: 10px;
    margin-bottom: 8px;
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
  .special >>> .el-input__inner {
    font-family: "Microsoft YaHei","微软雅黑","PingFang SC","Helvetica Neue",Helvetica,"Hiragino Sans GB",Arial,sans-serif;
    font-size: 13px;
    color: #000;
    padding-left: 10px;
    width: 190px;
  }
  .placeholder {
    height: 110px;
    /*background-color: #f5f5f5;*/
  }
  .commit-area {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: white;
    padding-bottom: 12px;
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
  .del {
    position: absolute;
    right: 24px;
    width: 24px;
  }
</style>
<style>
  .el-select-dropdown__item {
    font-family: "Microsoft YaHei","微软雅黑","PingFang SC","Helvetica Neue",Helvetica,"Hiragino Sans GB",Arial,sans-serif;
    font-size: 13px;
  }
</style>

<template>
  <div class="outer-wrapper">
    <!--<div class="padding-div" ref="paddingDiv"></div>-->
    <div class="tip">
      <i class="icon-tip"></i>
      <span>请准确填写以下表格</span>
    </div>
    <div class="form-wrapper">
      <!--<div class="matter-name">-->
      <!--<span v-if="itemDemoData.length">【{{itemDemoData[stepIndex].name}}】</span>-->
      <!--</div>-->
      <DynamicForm2 class="form" :schema="schema" :content="content" :rule="rule" bg-color="#f5f5f5" :root="true" ref="form" @change="processReference" @validate="triggerValidate">
        <!--<div slot="footer" v-if="isUploadForm" style="background-color: #f5f5f5; padding: 20px 0;">-->
        <!--<div class="uf-title">上传方式</div>-->
        <!--<div class="uf-methods">-->
        <!--<div class="uf-left">方式一</div>-->
        <!--<div class="uf-right">-->
        <!--<span>请在电脑上登录服务公社官网 http:{{baseUrl.slice(5, -4)}}portal_web/dist/index.html#/ ，找到该事项办理记录，继续编辑，上传文件</span>-->
        <!--<el-button class="uf-copy" type="text" size="mini" :data-clipboard-text="`http:${baseUrl.slice(5, -4)}portal_web/dist/index.html#/`">复制地址</el-button>-->
        <!--</div>-->
        <!--</div>-->
        <!--<div class="uf-methods">-->
        <!--<div class="uf-left">方式二</div>-->
        <!--<div class="uf-right">-->
        <!--<span>在电脑上访问 http:{{baseUrl.slice(5, -4)}}portal_web/dist/#/attachmentUpload ，扫描上传二维码，上传附件，上传完成后请刷新页面</span>-->
        <!--<el-button class="uf-copy" type="text" size="mini" :data-clipboard-text="`http:${baseUrl.slice(5, -4)}portal_web/dist/#/attachmentUpload`">复制地址</el-button>-->
        <!--</div>-->
        <!--</div>-->
        <!--<div class="uf-layout">-->
        <!--<div class="uf-button" @click="scan">-->
        <!--<img src="@/assets/img/saoyisao.svg">-->
        <!--<span>扫一扫</span>-->
        <!--</div>-->
        <!--<div class="uf-button" @click="refresh">-->
        <!--<img src="@/assets/img/shuaxin.svg">-->
        <!--<span>刷新</span>-->
        <!--</div>-->
        <!--</div>-->
        <!--</div>-->
      </DynamicForm2>
    </div>
  </div>
</template>

<script type="text/jsx">
  import Vue from 'vue';
  import DynamicForm2 from '@/components/DynamicForm2.vue';
  import ClipBoard from 'clipboard';

  export default {
    name: 'MatterItem',
    data() {
      return {
        stepIndex: 0,
        schema: [],
        content: {},
        rule: {},
        itemDemoData: [],
        itemListData: [],
        objMapping: {},
        // controlMapping: {},
        calcReferenceMapping: {},
        paramReferenceMapping: {},
        itemReferenceMapping: {},
        inputVisible: false,
        inputId: '',
        isReservation: false,
        reservationText: '',
        reservationLink: '',
        form: [],
        isIOS: false,
        tempPosition: 0,
        tempScroll: 0,
        isUploadForm: false,
        clipboard: {},
        uploadPromiseMap: {},
        asyncCallbackMap: {},
        rejectFuncMap: {},
        dataChanged: false,
        inputInterval: 0,
        updateTaskQueue: [],
        referenceTaskQueue: [],
        windowHeight: 0,
        updateFlag: false,
        infoGroupMap: {},
        infoGroupKeys: [],
        buttons: [],
        finishedIds: [],
        expandIds: [],
        validateIdMap: {},
      };
    },
    props: ['matterId', 'userMatterId', 'matterName', 'userId', 'noTree', 'prePage'],
    provide() {
      return {
        finishedIds: this.finishedIds,
        expandIds: this.expandIds,
        validateIdMap: this.validateIdMap,
      };
    },
    computed: {
    },
    created() {
      let dataParams = this.$route.query;
      this.isReservation = dataParams.submissionType === '2';
      if (this.isReservation) {
        this.reservationText = dataParams.submissionTitle;
        this.reservationLink = dataParams.submissionLink;
      }
      this.$emit('stepActiveChange', 1);
      let loading = this.$loading({
        lock: true,
        text: '正在加载',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.3)'
      });
      let groupList = this.$post('api/user/tree/matterformitem/get/' + this.userMatterId);
      groupList.then(({body}) => {
        this.itemDemoData = body.map(form => {
          form.matterFormItemList = form.matterFormItemList.map(item => {
            item.matterTemplateFormItemId = item.id;
            delete item.id;
            if (item.subMatterFormItemList) {
              item.subUserMatterFormItemList = item.subMatterFormItemList.map(subItem => {
                subItem.matterTemplateFormItemId = subItem.id;
                delete subItem.id;
                return subItem;
              });
              delete item.subMatterFormItemList;
            }
            return item;
          });
          return form;
        });
        if (dataParams.stepIndex) {
          if (dataParams.stepIndex < 0) {
            this.stepIndex = this.itemDemoData.length + parseInt(dataParams.stepIndex);
          } else {
            this.stepIndex = parseInt(dataParams.stepIndex);
          }
        }
        let itemList = this.$post('api/user/tree/usermatterformitem/get/' + this.userMatterId);
        itemList.then(res => {
          loading.close();
          this.itemListData = res.body;
          // let current = this.itemListData.filter(item => item.matterTemplateFormId === this.itemDemoData[this.stepIndex].id);
          // if (!current.length) {
          //   let localStr = localStorage.getItem(this.matterId + '|' + this.userMatterId + '|' + this.itemDemoData[this.stepIndex].id);
          //   if (localStr && localStr !== '[]') {
          //     this.itemListData.push(...JSON.parse(localStr));
          //   }
          // }
          this.renderPage();
        // }).catch(e => {
        //   loading.close();
        //   this.$alert(e);
        //   return Promise.reject(e);
        });
      }).catch(e => {
        loading.close();
        return Promise.reject(e);
      });
      let isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if (isIOS) {
        this.isIOS = true;
      }
      document.addEventListener('touchend', this.triggerBlur);
    },
    components: {
      DynamicForm2,
    },
    beforeDestroy() {
      document.removeEventListener('touchend', this.triggerBlur);
      if (Object.keys(this.clipboard).length) {
        this.clipboard.destroy();
      }
      // if (this.$route.path !== '/previewInner') {
      //   let setData = () => {
      //     let saveData = this.assembleData();
      //     // localStorage.setItem(this.matterId + '|' + this.userMatterId + '|' + this.stepIndex, JSON.stringify(saveData));
      //     return this.$post('api/user/tree/usermatterformitemForPhone/input/' + this.userMatterId + '/' + this.itemDemoData[this.stepIndex].id, saveData);
      //   };
      //   let setLocal = () => {
      //     let saveData = this.assembleData(true);
      //     localStorage.setItem(this.matterId + '|' + this.userMatterId + '|' + this.itemDemoData[this.stepIndex].id, JSON.stringify(saveData));
      //   };
      //   this.$refs.form.validate(valid => {
      //     if (!this.isUploadForm) {
      //       if (valid) {
      //         setData();
      //       } else {
      //         setLocal();
      //       }
      //     }
      //   });
      // }
    },
    methods: {
      triggerBlur(e) {
        if (e.type === 'touchend' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
          document.activeElement.blur();
          this.$emit('buttonChange', this.buttons);
          setTimeout(() => {
            let scrollHeight = document.documentElement.scrollTop || document.body.scrollTop || 0;
            window.scrollTo(0, Math.max(scrollHeight - 1, 0));
          }, 100);
          // if (document.querySelector('.el-picker-panel') && !document.querySelector('.el-picker-panel').contains(e.target)) {
          //   let refs = this.$refs.form.$refs;
          //   Object.keys(refs).filter(each => each.startsWith('date-')).forEach(each => {
          //     let date = refs[each][0];
          //     date.handleClose();
          //   });
          // }
        // } else if (e.type === 'resize' && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') && (this.windowHeight - window.innerHeight < 50)) {
        //   document.activeElement.blur();
        //   this.$emit('buttonChange', this.buttons);
        //   this.windowHeight = 0;
        //   window.removeEventListener('resize', this.triggerBlur);
        }
      },
      goStep (step) {
        let loading = this.$loading({
          lock: true,
          text: '正在加载',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.3)'
        });
        let getData = () => {
          return this.$post('api/user/tree/usermatterformitem/get/' + this.userMatterId).then(({body}) => {
            this.itemListData = body;
            // let current = this.itemListData.filter(item => item.matterTemplateFormId === this.itemDemoData[step].id);
            // if (!current.length) {
            //   let localStr = localStorage.getItem(this.matterId + '|' + this.userMatterId + '|' + this.itemDemoData[step].id);
            //   if (localStr && localStr !== '[]') {
            //     this.itemListData.push(...JSON.parse(localStr));
            //   }
            // }
            loading.close();
            this.stepIndex = step;
            this.schema = {};
            this.content = {};
            this.rule = {};
            this.objMapping = {};
            // this.controlMapping = {};
            this.calcReferenceMapping = {};
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
            this.$nextTick(() => this.renderPage());
          });
        };
        // let setData = () => {
        //   let saveData = this.assembleData();
        //   // localStorage.setItem(this.matterId + '|' + this.userMatterId + '|' + this.stepIndex, JSON.stringify(saveData));
        //   return this.$post('api/user/tree/usermatterformitemForPhone/input/' + this.userMatterId + '/' + this.itemDemoData[this.stepIndex].id, saveData);
        // };
        // let setLocal = () => {
        //   let saveData = this.assembleData(true);
        //   localStorage.setItem(this.matterId + '|' + this.userMatterId + '|' + this.itemDemoData[this.stepIndex].id, JSON.stringify(saveData));
        // };
        // if (isAbandon) {
        //   setLocal();
        //   getData();
        // } else {
        //   this.$refs.form.validate(valid => {
        //     if (this.isUploadForm) {
        //       getData();
        //     } else if (valid) {
        //       setData().then(() => getData());
        //     } else {
        //       setLocal();
        //       getData();
        //     }
        //   });
        // }
        getData();
      },
      generateHash(str) {
        return str.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
      },
      generateId(obj) {
        let newId;
        if (Object.prototype.toString.call(window.globalUniqueId) !== '[object Set]') {
          window.globalUniqueId = new Set();
        }
        do {
          newId = 'd' + Math.floor(Math.random() * (1<<30)).toString(36);
        } while (window.globalUniqueId.has(newId));
        window.globalUniqueId.add(newId);
        if (obj && obj instanceof Object) {
          this.objMapping[newId] = obj;
        }
        return newId;
      },
      renderPage() {
        this.$nextTick(() => {
          this.clipboard = new ClipBoard('.uf-copy');
          this.clipboard.on('success', () => this.$message({
            message: '已复制',
            duration: 1000,
          }));
        });
        let schema = [];
        this.itemDemoData.map((form, stepIndex) => {
          let titleData = {
            itemType: 'title',
            itemName: form.name,
          };
          let formTitle = this.transformItems([titleData])[0];
          schema.push(formTitle);
          // let startIndex = schema.length;
          let repeat = {};
          let tempSet = new Set();
          // let isUploadForm = true;
          form.matterFormItemList.filter(item => {
            if (item.itemType === 'cfbd' && tempSet.has(item.matterTemplateFormItemId)) {
              return false;
            } else {
              tempSet.add(item.matterTemplateFormItemId);
              return true;
            }
          }).map((item, index) => {
            if ((item.itemType === 'bt' || item.itemType === 'cfbd') && item.subUserMatterFormItemList && item.subUserMatterFormItemList.length) {
              item.subUserMatterFormItemList.forEach(subItem => {
                subItem.parentItem = item;
              });
              let match = this.itemListData.filter(exist => exist.matterTemplateFormItemId === item.matterTemplateFormItemId);
              if (match.length) {
                if (item.itemType === 'bt') {
                  item.id = match[0].id;
                } else {
                  repeat[index] = match.map((each, innerIndex) => {
                    let newItem = Object.assign({}, item);
                    newItem.id = each.id;
                    newItem.repeatIndex = innerIndex + 1;
                    newItem.subUserMatterFormItemList = newItem.subUserMatterFormItemList.map(subItem => {
                      let newSubItem = Object.assign({}, subItem);
                      newSubItem.parentItem = newItem;
                      return newSubItem;
                    });
                    if (innerIndex) {
                      newItem.canDelete = 'Y';
                    }
                    return newItem;
                  });
                }
              } else if (item.itemType === 'cfbd') {
                repeat[index] = [item];
                item.repeatIndex = 1;
                item.isExpand = 'Y';
              }
            }
            return item;
          });
          // this.isUploadForm = isUploadForm;
          // if (this.isUploadForm) {
          //   this.$nextTick(() => {
          //     this.clipboard = new ClipBoard('.uf-copy');
          //     this.clipboard.on('success', () => this.$message({
          //       message: '已复制',
          //       duration: 1000,
          //     }));
          //   });
          // }
          Object.keys(repeat).sort((a, b) => b - a).forEach(key => {
            let index = parseInt(key);
            this.itemDemoData[stepIndex].matterFormItemList.splice(index, 1, ...repeat[key]);
          });
          let level2 = this.transformItems(this.itemDemoData[stepIndex].matterFormItemList);
          formTitle.children = level2;
          Object.keys(repeat).sort((a, b) => b - a).forEach(key => {
            let group = repeat[key];
            let groupIndex = this.itemDemoData[stepIndex].matterFormItemList.findIndex(each => each === group[0]);
            if (groupIndex > -1) {
              let itemId = level2[groupIndex].id;
              let itemLabel = group[0].itemName;
              let tempId = this.generateId();
              let addRepeat = {
                id: tempId,
                type: 'custom',
                render: () => {
                  return (
                    <div class="df-repeat-form-add">
                      <div class="df-button-repeat-form-add" onClick={() => this.addForm(itemId, tempId)}>
                        <span class="df-text-repeat-form-add">
                          <span class="df-icon-repeat-form-add">+</span>
                          &nbsp;添加{itemLabel}
                        </span>
                      </div>
                    </div>
                  )
                },
              };
              level2.splice(groupIndex + group.length, 0, addRepeat);
            }
          });
          let hasAttach = false;
          level2.forEach(level2Each => {
            let item = this.objMapping[level2Each.id];
            if (item) {
              if ((item.itemType === 'bt' || item.itemType === 'cfbd') && item.subUserMatterFormItemList && item.subUserMatterFormItemList.length) {
                level2Each.children = this.transformItems(item.subUserMatterFormItemList, item.id);
                level2Each.children.forEach(level3 => {
                  let tempObj = this.objMapping[level3.id];
                  if (tempObj) {
                    if (tempObj.itemName !== '身份证号码' && (tempObj.itemType === 'qm' || tempObj.itemType === 'sm' || tempObj.itemType === 'qmsm')) {
                      let certNoItem = Object.assign({}, tempObj, {itemName: '身份证号码', regex: '/(^[1-9]\\d{5}(18|19|([23]\\d))\\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\\d{3}[0-9Xx]$)|(^[1-9]\\d{5}\\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\\d{2}$)/', reference: tempObj});
                      level3.children = this.transformItems([certNoItem]);
                    } else if (tempObj.itemName !== '企业名称' && tempObj.itemName !== '统一社会信用代码' && tempObj.itemType === 'qyqz') {
                      let companyName = Object.assign({}, tempObj, {itemName: '企业名称', regex: '^[\u4e00-\u9fa5]{2,50}$', reference: tempObj});
                      let companyCode = Object.assign({}, tempObj, {itemName: '统一社会信用代码', regex: '^[^_IOZSVa-z\\W]{2}\\d{6}[^_IOZSVa-z\\W]{10}$', reference: tempObj});
                      level3.children = this.transformItems([companyName, companyCode]);
                    } else if (tempObj.itemType === 'file') {
                      hasAttach = true;
                    }
                  }
                });
                if (item.itemType === 'cfbd' && item.canDelete === 'Y') {
                  let deleteButton = {
                    id: this.generateId(),
                    type: 'custom',
                    render: () => {
                      return (
                        <div>
                          <span class="delete-button" onClick={() => this.deleteForm(item.id)}>
                            <i class="df-del-icon"></i>
                            删除
                          </span>
                        </div>
                      )
                    },
                  };
                  level2Each.children.push(deleteButton);
                }
              } else if (item.itemType === 'qm' || item.itemType === 'sm' || item.itemType === 'qmsm') {
                let certNoItem = Object.assign({}, item, {itemName: '身份证号码', regex: '/(^[1-9]\\d{5}(18|19|([23]\\d))\\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\\d{3}[0-9Xx]$)|(^[1-9]\\d{5}\\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\\d{2}$)/', reference: item});
                level2Each.children = this.transformItems([certNoItem]);
              } else if (item.itemType === 'qyqz') {
                let companyName = Object.assign({}, item, {itemName: '企业名称', regex: '^[\u4e00-\u9fa5]{2,50}$', reference: item});
                let companyCode = Object.assign({}, item, {itemName: '统一社会信用代码', regex: '^[^_IOZSVa-z\\W]{2}\\d{6}[^_IOZSVa-z\\W]{10}$', reference: item});
                level2Each.children = this.transformItems([companyName, companyCode]);
              } else if (item.itemType === 'file') {
                hasAttach = true;
              }
            }
          });
          if (hasAttach) {
            let status = Vue.observable({
              isCollapse: true,
            });
            let copyUrl = `https://${location.hostname}/portal_web/dist/#/attachmentUpload`;
            let scanQRCode = () => {
              if (window.__wxjs_environment || navigator.userAgent.includes("miniProgram")) {
                wx.miniProgram.navigateTo({
                  url: `/pages/scanCode/scanCode?matterId=${this.matterId}&userMatterId=${this.userMatterId}&stepIndex=${stepIndex}`
                });
              } else {
                window.location.href = `/scan?matterId=${this.matterId}&userMatterId=${this.userMatterId}&stepIndex=${stepIndex}`;
              }
            };
            let refreshPage = () => {
              location.reload(true);
            };
            let changeStatus = () => {
              status.isCollapse = !status.isCollapse;
            };
            let attachDesc = {
              id: this.generateId(),
              type: 'custom',
              status: status,
              render: (h, item) => {
                return (
                  <div class="df-cell">
                    <div class="upload-method-title">上传方法</div>
                    <div class="uf-desc-wrapper">
                      <div class="uf-layout">
                        <div class="uf-button uf-copy" data-clipboard-text={copyUrl}>
                          <i class="um-icon-1"></i>
                          <span>复制网址</span>
                        </div>
                        <div class="uf-button" onClick={() => scanQRCode()}>
                          <i class="um-icon-2"></i>
                          <span>扫码登陆</span>
                        </div>
                        <div class="uf-button" onClick={() => refreshPage()}>
                          <i class="um-icon-3"></i>
                          <span>刷新</span>
                        </div>
                      </div>
                      <div class={item.status.isCollapse ? 'collapse' : 'expand'}>
                        <div class="upload-method-desc">
                          1. 电脑浏览器访问:&nbsp;
                          <span>{copyUrl}</span>
                        </div>
                        <div class="upload-method-desc">
                          2. 点击上方"
                          <span>扫码登录</span>
                          ", 扫描页面二维码登录
                        </div>
                        <div class="upload-method-desc">
                          3. 在电脑上进行附件上传操作
                        </div>
                        <div class="upload-method-desc">
                          4. 上传完毕后, 需点击上方"
                          <span>刷新</span>
                          "按钮, 下方"附件"列表才会更新哦
                        </div>
                        <div class="upload-method-desc">
                          5. 电脑仅支持上传附件资料, 上传完成后, 需要回到手机端继续完成事项办理
                        </div>
                      </div>
                      <div class="more-button" onClick={() => changeStatus()}>
                        <span class="collapse-text">
                          {item.status.isCollapse ? '更多' : '收起'}上传方法
                        </span>
                        <i class={item.status.isCollapse ? 'file-collapse-icon' : 'file-expand-icon'}></i>
                      </div>
                    </div>
                    <div class="upload-method-title">附件列表</div>
                  </div>
                )
              },
            };
            level2.unshift(attachDesc);
          }
        });
        // schema.push(...this.transformItems(arr));
          // Object.keys(addition).sort((a, b) => b - a).forEach(key => {
          //   let index = parseInt(key);
          //   let parent = arr[index];
          //   let isSubForm = false;
          //   if (parent.itemType === 'bt' || parent.itemType === 'cfbd') {
          //     isSubForm = true;
          //   }
          //   let subItems = this.transformItems(addition[key], isSubForm ? arr[index].id : false);
          //   let subAddition = {};
          //   subItems.forEach((subItem, subIndex) => {
          //     let tempObj = this.objMapping[subItem.id];
          //     if (tempObj.itemName !== '身份证号码' && (tempObj.itemType === 'qm' || tempObj.itemType === 'sm' || tempObj.itemType === 'qmsm')) {
          //       let certNoItem = Object.assign({}, tempObj, {itemName: '身份证号码', regex: '/(^[1-9]\\d{5}(18|19|([23]\\d))\\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\\d{3}[0-9Xx]$)|(^[1-9]\\d{5}\\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\\d{2}$)/', reference: tempObj});
          //       subAddition[subIndex] = [certNoItem];
          //     } else if (tempObj.itemName !== '企业名称' && tempObj.itemName !== '统一社会信用代码' && tempObj.itemType === 'qyqz') {
          //       let companyName = Object.assign({}, tempObj, {itemName: '企业名称', regex: '^[\u4e00-\u9fa5]{2,50}$', reference: tempObj});
          //       let companyCode = Object.assign({}, tempObj, {itemName: '统一社会信用代码', regex: '^[^_IOZSVa-z\\W]{2}\\d{6}[^_IOZSVa-z\\W]{10}$', reference: tempObj});
          //       subAddition[subIndex] = [companyName, companyCode];
          //     }
          //   });
            // this.controlMapping[schema[index].id] = subItems.map(sub => sub.id);
            // Object.keys(subAddition).sort((a, b) => b - a).forEach(subKey => {
            //   let subIndex = parseInt(subKey);
            //   subItems[subIndex].children = this.transformItems(subAddition[subKey], arr[index].id);
              // subItems.splice(startIndex + subIndex + 1, 0, ...this.transformItems(subAddition[subKey], arr[index].id));
            // });
            // formTitle.children[index].children = subItems;
            // schema.splice(startIndex + index + 1, 0, ...subItems);
          // });
        // let repeat = {};
        // let tempSet = new Set();
        // let isUploadForm = true;
        // this.itemDemoData[this.stepIndex].matterFormItemList = this.itemDemoData[this.stepIndex].matterFormItemList.filter(item => {
        //   if (item.itemType === 'cfbd' && tempSet.has(item.matterTemplateFormItemId)) {
        //     return false;
        //   } else {
        //     tempSet.add(item.matterTemplateFormItemId);
        //     return true;
        //   }
        // }).map((item, index) => {
        //   if ((item.itemType === 'bt' || item.itemType === 'cfbd') && item.subUserMatterFormItemList && item.subUserMatterFormItemList.length) {
        //     item.subUserMatterFormItemList.forEach(subItem => {
        //       subItem.parentItem = item;
        //       if (subItem.itemType !== 'file') {
        //         isUploadForm = false;
        //       }
        //     });
        //     let match = this.itemListData.filter(exist => exist.matterTemplateFormItemId === item.matterTemplateFormItemId);
        //     if (match.length) {
        //       if (item.itemType === 'bt') {
        //         item.id = match[0].id;
        //       } else {
        //         repeat[index] = match.map((each, innerIndex) => {
        //           let newItem = Object.assign({}, item);
        //           newItem.id = each.id;
        //           newItem.subUserMatterFormItemList = newItem.subUserMatterFormItemList.map(subItem => {
        //             let newSubItem = Object.assign({}, subItem);
        //             newSubItem.parentItem = newItem;
        //             return newSubItem;
        //           });
        //           if (innerIndex) {
        //             newItem.canDelete = 'Y';
        //           }
        //           return newItem;
        //         });
        //       }
        //     }
        //   } else if (item.itemType !== 'bt' && item.itemType !== 'cfbd' && item.itemType !== 'file') {
        //     isUploadForm = false;
        //   }
        //   return item;
        // });
        // this.isUploadForm = isUploadForm;
        // if (this.isUploadForm) {
        //   this.$nextTick(() => {
        //     this.clipboard = new ClipBoard('.uf-copy');
        //     this.clipboard.on('success', () => this.$message({
        //       message: '已复制',
        //       duration: 1000,
        //     }));
        //   });
        // }
        // Object.keys(repeat).sort((a, b) => b - a).map(key => {
        //   let index = parseInt(key);
        //   this.itemDemoData[this.stepIndex].matterFormItemList.splice(index, 1, ...repeat[key]);
        // });
        // let addition = {};
        // let arr = this.itemDemoData[this.stepIndex].matterFormItemList.map((item, index) => {
        //   if ((item.itemType === 'bt' || item.itemType === 'cfbd') && item.subUserMatterFormItemList && item.subUserMatterFormItemList.length) {
        //     addition[index] = item.subUserMatterFormItemList;
        //   } else if (item.itemType === 'qm' || item.itemType === 'sm' || item.itemType === 'qmsm') {
        //     let certNoItem = Object.assign({}, item, {itemName: '身份证号码', regex: '/(^[1-9]\\d{5}(18|19|([23]\\d))\\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\\d{3}[0-9Xx]$)|(^[1-9]\\d{5}\\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\\d{2}$)/', reference: item});
        //     addition[index] = [certNoItem];
        //   } else if (item.itemType === 'qyqz') {
        //     let companyName = Object.assign({}, item, {itemName: '企业名称', regex: '^[\u4e00-\u9fa5]{2,50}$', reference: item});
        //     let companyCode = Object.assign({}, item, {itemName: '统一社会信用代码', regex: '^[^_IOZSVa-z\\W]{2}\\d{6}[^_IOZSVa-z\\W]{10}$', reference: item});
        //     addition[index] = [companyName, companyCode];
        //   }
        //   return item;
        // });
        // schema.items.push(...this.transformItems(arr));
        // Object.keys(addition).sort((a, b) => b - a).map(key => {
        //   let index = parseInt(key);
        //   let parent = arr[index];
        //   let isSubForm = false;
        //   if (parent.itemType === 'bt' || parent.itemType === 'cfbd') {
        //     isSubForm = true;
        //   }
        //   let subItems = this.transformItems(addition[key], isSubForm ? arr[index].id : false);
        //   let subAddition = {};
        //   subItems.map((subItem, subIndex) => {
        //     let tempObj = this.objMapping[subItem.id];
        //     if (tempObj.itemName !== '身份证号码' && (tempObj.itemType === 'qm' || tempObj.itemType === 'sm' || tempObj.itemType === 'qmsm')) {
        //       let certNoItem = Object.assign({}, tempObj, {itemName: '身份证号码', regex: '/(^[1-9]\\d{5}(18|19|([23]\\d))\\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\\d{3}[0-9Xx]$)|(^[1-9]\\d{5}\\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\\d{2}$)/', reference: tempObj});
        //       subAddition[subIndex] = [certNoItem];
        //     } else if (tempObj.itemName !== '企业名称' && tempObj.itemName !== '统一社会信用代码' && tempObj.itemType === 'qyqz') {
        //       let companyName = Object.assign({}, tempObj, {itemName: '企业名称', regex: '^[\u4e00-\u9fa5]{2,50}$', reference: tempObj});
        //       let companyCode = Object.assign({}, tempObj, {itemName: '统一社会信用代码', regex: '^[^_IOZSVa-z\\W]{2}\\d{6}[^_IOZSVa-z\\W]{10}$', reference: tempObj});
        //       subAddition[index] = [companyName, companyCode];
        //     }
        //   });
        //   this.controlMapping[schema.items[index].id] = subItems.map(sub => sub.id);
        //   Object.keys(subAddition).sort((a, b) => b - a).map(subKey => {
        //     let subIndex = parseInt(subKey);
        //     subItems.splice(subIndex + 1, 0, ...this.transformItems(subAddition[subKey], arr[index].id));
        //   });
        //   schema.items.splice(index + 1, 0, ...subItems);
        // });
        let returnButton = {
          id: this.generateId(),
          type: 'primary',
          text: '上一步',
          plain: true,
          click: this.goBack,
        };
        let nextButton = {
          id: this.generateId(),
          type: 'primary',
          text: '下一步',
          click: this.save,
        };
        let reservationButton = {
          id: this.generateId(),
          type: 'primary',
          text: this.reservationText,
          click: () => this.toLink(this.reservationLink),
        };
        // let buttons;
        // if (this.itemDemoData.length === stepIndex + 1) {
        //   if (this.isReservation) {
        //     buttons = [returnButton, reservationButton];
        //   } else {
        //     buttons = [returnButton, saveButton];
        //   }
        // } else {
        //   buttons = [returnButton, nextButton];
        // }
        // if (this.noTree && stepIndex === 0) {
        //   buttons.shift();
        // }
        // schema.buttons = buttons;
        if (this.isReservation) {
          this.buttons = [returnButton, reservationButton];
        } else {
          this.buttons = [returnButton, nextButton];
        }
        this.$emit('buttonChange', this.buttons);
        this.schema = schema;
        this.preCompileFormula();
      },
      next() {
        this.goStep(this.stepIndex + 1);
      },
      save() {
        let loading = this.$loading({
          lock: true,
          text: '正在加载',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.3)'
        });
        // this.$refs.form.validate(valid => {
        //   if (valid) {
        //     let saveData = this.assembleData();
        //     this.$post('api/user/tree/usermatterformitemForPhone/input/' + this.userMatterId + '/' + this.itemDemoData[this.stepIndex].id, saveData).then(() => {
        //       this.$post('user/matter/check/' + this.userMatterId).then(() => {
        //         document.title = '预览';
        //         // this.$router.push({
        //         //   path: '/previewInner',
        //         //   query: Object.assign({}, this.$route.query, {isInFlow: true}),
        //         // });
        //         this.$router.replace({
        //           path: '/previewInner',
        //           query: Object.assign({}, this.$route.query, {isInFlow: true}),
        //         });
        //       }, err => {
        //           loading.close();
        //           this.$alert(err);
        //       });
        //     }, () => {
        //       loading.close();
        //       this.$alert('保存失败, 请重试.');
        //     });
        //   } else {
        //     this.$alert('校验未通过, 请检查表单数据.', '提示', {
        //       confirmButtonText: '确定',
        //     }).then(() => loading.close());
        //     return false;
        //   }
        // });
        this.$refs.form.validate(valid => {
          if (valid) {
            let backendCheck = () => {
              this.$post('user/matter/check/' + this.userMatterId).then(() => {
                this.$router.replace({
                  path: '/previewInner',
                  query: Object.assign({}, this.$route.query, {isInFlow: true}),
                });
              }, err => {
                loading.close();
                if (err === '表单数据不完整') {
                  this.$alert('前面流程的申请表全部填写完成后才可以进行提交');
                  return Promise.reject('校验未通过, 请先检查表单数据.');
                } else {
                  this.$alert(err);
                }
              });
            };
            if (this.updateFlag) {
              this.updateTaskQueue.push(backendCheck);
            } else {
              backendCheck();
            }
          } else {
            loading.close();
            this.$alert('校验未通过, 请检查表单数据.', '提示', {
              confirmButtonText: '确定',
            });
            return false;
          }
        });
      },
      goBack() {
        this.$router.replace({
          path: '/matterTree',
          query: this.$route.query,
        });
      },
      transformItems(arr, parentId) {
        return arr.map(item => {
          let typeMapping = {
            'text': 'input',
            'text_area': 'input',
            'radio': 'radio',
            'checkbox': 'checkbox',
            'select': 'select',
            'img': 'upload',
            'file': 'upload',
            'date': 'date',
            'text_info': 'text',
            'text_title': 'text',
            'spe_text_card_a': 'input',
            'number': 'input',
            'qm': 'input',
            'sm': 'input',
            'qmsm': 'input',
            'title': 'title',
            'bt': 'subTitle',
            'cfbd': 'subTitle',
            'xq': 'select',
            'qyqz': 'text',
          };
          let formItem = {
            id: this.generateId(item),
            type: typeMapping[item.itemType],
            label: item.itemName,
          };
          if (item.itemType === 'qyqz') {
            if (item.itemName === '企业名称' || item.itemName === '统一社会信用代码') {
              formItem.type = 'input';
            } else {
              formItem.style = {
                padding: '8px 8px 0',
                fontWeight: 900,
                fontSize: '16px',
              };
            }
          }
          if (item.itemType === 'xq' && !item.xqId) {
            item.xqId = item.itemValue;
          }
          if (item.itemType === 'infoGroup') {
            formItem.status = 'hidden';
          }
          if ((item.itemType === 'bt' || item.itemType === 'cfbd') && !item.id) {
            item.id = formItem.id;
          }
          let match = [];
          if (parentId) {
            let parent = this.itemListData.filter(exist => exist.id === parentId);
            if (parent.length) {
              match = parent[0].subUserMatterFormItemList.filter(exist => exist.matterTemplateFormItemId === item.matterTemplateFormItemId);
            }
          } else if (!(item.itemType === 'cfbd' && typeof item.id === 'string')) {
            if (item.itemType === 'cfbd') {
              match = this.itemListData.filter(exist => exist.id === item.id);
            } else {
              match = this.itemListData.filter(exist => exist.matterTemplateFormItemId === item.matterTemplateFormItemId);
            }
          }
          let itemValue = '';
          if (match.length && item.itemName === '身份证号码' && (item.itemType === 'qm' || item.itemType === 'sm' || item.itemType === 'qmsm')) {
            itemValue = match[0].certNo;
            item.reference.certNo = itemValue;
          } else if (match.length && item.itemName === '企业名称' && item.itemType === 'qyqz') {
            itemValue = match[0].itemValue;
          } else if (match.length && item.itemName === '统一社会信用代码' && item.itemType === 'qyqz') {
            itemValue = match[0].certNo;
            item.reference.certNo = itemValue;
          } else if (match.length && formItem.type !== 'title' && formItem.type !== 'text') {
            itemValue = match[0].itemValue;
            item.attachList = match[0].attachList;
            item.id = match[0].id;
            if (item.itemType === 'qm' || item.itemType === 'qmsm') {
              item.apiUrl = match[0].apiUrl;
              item.signDate = match[0].signDate;
            } else if (item.itemType === 'qyqz') {
              item.apiUrl = match[0].apiUrl;
            }
          } else if (match.length && item.itemType === 'qyqz') {
            item.id = match[0].id;
          }
          item.itemValue = itemValue;
          if (formItem.type === 'checkbox') {
            itemValue = itemValue ? itemValue.split(',') : [];
          }
          this.$set(this.content, formItem.id, itemValue);
          this.$set(this.rule, formItem.id, []);
          if (parentId) {
            if (item.main === '1') {
              formItem.firstLabel = true;
            } else if (item.main === '2') {
              formItem.secondLabel = true;
            }
          }
          if (item.swatche) {
            formItem.sample = item.swatche;
            formItem.sample.click = () => {
              this.$router.push({
                path: '/samplePreview',
                query: Object.assign({}, formItem.sample, {matterName: this.matterName}),
              });
            };
          }
          if (item.belongId) {
            let belongId = item.belongId + '';
            if (item.parentItem) {
              belongId += item.parentItem.id;
            }
            if (!this.infoGroupMap[belongId]) {
              this.infoGroupMap[belongId] = {};
            }
            if (item.isKey === 'Y') {
              this.infoGroupKeys.push(formItem.id);
            } else {
              this.infoGroupMap[belongId][item.itemName] = formItem.id;
            }
          }
          if (item.itemType === 'cfbd') {
            // let addButton = {
            //   id: this.generateId(),
            //   text: '添加多个',
            //   click: this.addForm,
            // };
            // let deleteButton = {
            //   id: this.generateId(),
            //   text: '删除',
            //   click: this.deleteForm,
            // };
            // formItem.items = [addButton];
            // if (item.canDelete === 'Y') {
            //   formItem.canDelete = true;
            //   formItem.deleteForm = this.deleteForm;
            // }
            formItem.isRepeat = true;
            formItem.label += item.repeatIndex;
            if (item.isExpand === 'Y') {
              formItem.isExpand = true;
            }
          }
          if (item.link && item.linkTitle) {
            formItem.link = {
              href: this.baseUrl + '/newindow?url=' + encodeURIComponent(item.link),
              text: item.linkTitle,
            };
          }
          if (item.itemType === 'number' && item.formula) {
            formItem.readOnly = true;
          }
          if (formItem.type === 'text' || formItem.type === 'title') {
            if (item.itemType === 'text_info') {
              formItem.text = item.textInfo;
              if (item.fontColor) {
                formItem.style = {
                  color: item.fontColor,
                };
              }
            } else {
              formItem.text = item.itemName;
            }
          }
          if (item.reminder) {
            formItem.tip = item.reminder;
            if (item.reminderStyle) {
              formItem.tipStyle = JSON.parse(item.reminderStyle);
            }
          }
          if (item.placeholder) {
            formItem.placeholder = item.placeholder;
          }
          if (item.itemType == 'text_area') {
            formItem.inputType = 'textarea';
            formItem.autosize = {
              minRows: 3,
              maxRows: 9,
            };
          }
          if (item.requird == 'Y' && !(formItem.type === 'text' || formItem.type === 'title' || formItem.status === 'hidden')) {
            if (formItem.type === 'input' || formItem.type === 'date') {
              this.rule[formItem.id].push({
                type: 'string',
                required: true,
                message: '必填',
                trigger: 'blur',
              });
            } else if (formItem.type === 'upload' || formItem.type === 'checkbox') {
              this.rule[formItem.id].push({
                type: 'array',
                required: true,
                message: '必选',
                trigger: 'change',
              });
            } else {
              this.rule[formItem.id].push({
                type: 'string',
                required: true,
                message: '必选',
                trigger: 'change',
              });
            }
          }
          if (formItem.type == 'input') {
            // if (this.isIOS) {
            //   formItem.mouseDown = this.showInputForIOS;
            //   formItem.click = this.focusInputForIOS;
            //   // formItem.click = this.focusInputForIOS;
            //   formItem.noFocus = true;
            // } else {
            //   formItem.click = this.showInputForAndroid;
            // }
            formItem.click = this.hideButtonArea;
            if (item.unit) {
              formItem.unit = item.unit;
            }
            this.rule[formItem.id].push({
              trigger: 'blur',
            });
            if (item.regex) {
              this.rule[formItem.id].push({
                type: 'string',
                pattern: item.regex.replace(/^\//, '').replace(/\/$/, ''),
                message: item.errorTips || '格式错误',
                trigger: 'blur',
              });
            }
            if (item.minLength) {
              this.rule[formItem.id].push({
                type: 'string',
                min: item.minLength,
                message: '请输入最少' + item.minLength + '位',
                trigger: 'blur',
              });
            }
            if (item.maxLength) {
              this.rule[formItem.id].push({
                type: 'string',
                max: item.maxLength,
                message: '请输入最多' + item.maxLength + '位',
                trigger: 'blur',
              });
            }
            if (item.itemType == 'number') {
              this.rule[formItem.id].push({
                validator: (rule, value, callback) => {
                  let errorMsg = '请输入数字';
                  if (isNaN(value)) {
                    callback(new Error(errorMsg));
                  } else {
                    callback();
                  }
                },
                trigger: 'blur',
              });
            }
          } else if (formItem.type == 'date') {
            if (item.fillType === '2') {
              formItem.status = 'hidden';
            }
            this.rule[formItem.id].push({
              trigger: 'change',
            });
            if (item.required == 'Y') {
              this.rule[formItem.id].push({
                type: 'string',
                required: true,
                message: '请选择日期',
                trigger: 'change',
              });
            }
          } else if (formItem.type == 'upload' && formItem.status !== 'hidden') {
            formItem.uploadUrl = this.baseUrl + '/api/file/form/user_matter';
            if (item.itemType == 'img') {
              formItem.listType = 'picture-card';
            } else {
              formItem.listType = 'text';
            }
            if (!item.attachList) {
              item.attachList = [];
            }
            let fileList = item.attachList.filter(file => file.deleted !== 'Y').map(file => {
              let name = file.name ? file.name : file.url.substr(file.url.lastIndexOf('/') + 1);
              let suffix = name.slice(name.lastIndexOf('.'));
              return {
                id: file.id,
                name: name,
                url: file.url,
                serverUrl: file.url,
                uid: this.generateId(),
                suffix: suffix,
              };
            });
            this.$set(this.content, formItem.id, fileList);
            formItem.handleCheck = this.handleCheck;
            formItem.handleSuccess = this.handleSuccess;
            formItem.handleRemove = this.handleRemove;
            formItem.handleError = this.handleError;
            formItem.handlePreview = this.handlePreview;
            formItem.handleConfirm = this.handleConfirm;
            this.rule[formItem.id].push({
              trigger: 'change',
              type: 'array',
            });
            if (item.minLength) {
              this.rule[formItem.id].push({
                validator: (rule, value, callback) => {
                  let rest = item.itemType == 'img' ? '张图片' : '份文档';
                  let errorMsg = '最少上传' + item.minLength + rest;
                  let fileList = value;
                  if (fileList.length < item.minLength) {
                    callback(new Error(errorMsg));
                  } else {
                    callback();
                  }
                },
                trigger: 'change',
              });
            }
            if (item.maxLength) {
              this.rule[formItem.id].push({
                validator: (rule, value, callback) => {
                  let rest = item.itemType == 'img' ? '张图片' : '份文档';
                  let errorMsg = '最多上传' + item.maxLength + rest;
                  let fileList = value;
                  if (fileList.length > item.maxLength) {
                    callback(new Error(errorMsg));
                  } else {
                    callback();
                  }
                },
                trigger: 'change',
              });
            }
            // this.rule[formItem.id].push({
            //   validator: (rule, value, callback) => {
            //     let errorMsg = '请等待图片上传完成.';
            //     if (value.length && value.includes(undefined)) {
            //       callback(new Error(errorMsg));
            //     } else {
            //       callback();
            //     }
            //   },
            //   trigger: 'blur',
            // });
          } else if (formItem.type == 'checkbox' || formItem.type == 'radio' || formItem.type == 'select') {
            let items = [];
            this.rule[formItem.id].push({
              trigger: 'change',
              type: formItem.type === 'checkbox' ? 'array' : 'string',
            });
            if (item.required == 'Y') {
              this.rule[formItem.id].push({
                type: formItem.type === 'checkbox' ? 'array' : 'string',
                required: true,
                message: formItem.type == 'checkbox' ? '请至少选择一项' : '请选择一项',
                trigger: 'change',
              });
            }
            item.matterFormItemParamList.forEach(param => {
              let paramItem = {
                id: this.generateId({
                  paramId: param.matterFormItemParamId,
                }),
                label: param.label,
                value: param.label,
              };
              if (param.reminder) {
                paramItem.tip = param.reminder;
                if (param.reminderStyle) {
                  paramItem.tipStyle = JSON.parse(param.reminderStyle);
                }
              }
              if ((formItem.type == 'radio' || formItem.type == 'select') && param.linkItems) {
                if (!this.paramReferenceMapping[formItem.id]) {
                  this.paramReferenceMapping[formItem.id] = {};
                }
                this.paramReferenceMapping[formItem.id][param.label] = param.id;
              }
              items.push(paramItem);
            });
            formItem.items = items;
            if (item.itemType === 'xq' && item.xqId) {
              this.$post('api/jurisdiction/getByGovernmentId/' + item.xqId).then(({body}) => {
                let remoteParams = body.matterFormItemParamList.map(param => {
                  return {
                    id: this.generateId(),
                    label: param.label,
                    value: param.value + '',
                  };
                });
                formItem.items = remoteParams;
              });
            }
          }
          return formItem;
        });
      },
      // assembleData(isLocal) {
      //   this.schema.items.map(item => {
      //     let obj = this.objMapping[item.id];
      //     if (obj.itemValue != this.content[item.id] || obj.itemType === 'img' || obj.itemType === 'file') {
      //       this.dataChanged = true;
      //       obj.itemValue = this.content[item.id];
      //     }
      //     if (obj.parentItem) {
      //       delete obj.parentItem;
      //     }
      //     if (isLocal && (obj.itemType === 'bt' || obj.itemType === 'cfbd')) {
      //       obj.id = this.generateId();
      //     } else if (Object.prototype.toString.call(obj.id) === "[object String]") {
      //       delete obj.id;
      //     }
      //     if ((obj.itemType === 'img' || obj.itemType === 'file') && Object.prototype.toString.call(obj.itemValue) === '[object Array]') {
      //       let containList = [];
      //       let fileList = obj.itemValue.map(each => {
      //         let tempObj = {
      //           url: each.serverUrl,
      //           name: each.name,
      //         };
      //         if (each.id) {
      //           containList.push(each.id);
      //           tempObj.id = each.id;
      //         }
      //         return tempObj;
      //       });
      //       let deletedList = obj.attachList.filter(each => !containList.includes(each.id)).map(each => {
      //         each.deleted = 'Y';
      //         return each;
      //       });
      //       fileList.push(...deletedList);
      //       obj.attachList = fileList;
      //       obj.itemValue = '';
      //     } else if (obj.itemName === '身份证号码' && obj.reference && (obj.itemType === 'qm' || obj.itemType === 'sm' || obj.itemType === 'qmsm')) {
      //       obj.reference.certNo = this.content[item.id];
      //     } else if (obj.itemName === '企业名称' && obj.reference && obj.itemType === 'qyqz') {
      //       obj.reference.itemValue = this.content[item.id];
      //     } else if (obj.itemName === '统一社会信用代码' && obj.reference && obj.itemType === 'qyqz') {
      //       obj.reference.certNo = this.content[item.id];
      //     }
      //     return obj;
      //   });
      //   return this.itemDemoData[this.stepIndex].matterFormItemList.map(item => {
      //     let obj = JSON.parse(JSON.stringify(item));
      //     delete obj.matterFormItemParamList;
      //     return obj;
      //   });
      // },
      addForm(id, buttonId) {
        let obj = this.objMapping[id];
        // let originIndex = this.itemDemoData[this.stepIndex].matterFormItemList.findIndex(item => item === obj);
        // let newObj = Object.assign({}, obj);
        // delete newObj.id;
        // newObj.canDelete = 'Y';
        // let addition = {};
        // newObj.subUserMatterFormItemList = obj.subUserMatterFormItemList.map((subItem, index) => {
        //   let newSubItem = Object.assign({}, subItem);
        //   delete newSubItem.id;
        //   delete newSubItem.attachList;
        //   delete newSubItem.apiUrl;
        //   newSubItem.parentItem = newObj;
        //   if (newSubItem.itemType === 'qm' || newSubItem.itemType === 'sm' || newSubItem.itemType === 'qmsm') {
        //     let certNoItem = Object.assign({}, newSubItem, {itemName: '身份证号码', regex: '/(^[1-9]\\d{5}(18|19|([23]\\d))\\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\\d{3}[0-9Xx]$)|(^[1-9]\\d{5}\\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\\d{2}$)/', reference: newSubItem});
        //     addition[index] = [certNoItem];
        //   } else if (newSubItem.itemType === 'qyqz') {
        //     let companyName = Object.assign({}, newSubItem, {itemName: '企业名称', regex: '^[\u4e00-\u9fa5]{2,50}$', reference: newSubItem});
        //     let companyCode = Object.assign({}, newSubItem, {itemName: '统一社会信用代码', regex: '^[^_IOZSVa-z\\W]{2}\\d{6}[^_IOZSVa-z\\W]{10}$', reference: newSubItem});
        //     addition[index] = [companyName, companyCode];
        //   }
        //   return newSubItem;
        // });
        // this.itemDemoData[this.stepIndex].matterFormItemList.splice(originIndex + 1, 0, newObj);
        // let schemaIndex = this.schema.findIndex(item => item.id === id);
        // let newArr = this.transformItems([newObj, ...newObj.subUserMatterFormItemList]);
        // Object.keys(addition).sort((a, b) => b - a).map(key => {
        //   let index = parseInt(key);
        //   let subItems = this.transformItems(addition[key]);
        //   newArr.splice(index + 2, 0, ...subItems);
        // });
        // this.schema.splice(schemaIndex + newArr.length, 0, ...newArr);
        let originIndex = -1;
        let stepIndex = -1;
        for (let formIndex in this.itemDemoData) {
          let index = this.itemDemoData[formIndex].matterFormItemList.findIndex(item => item === obj);
          if (index > -1) {
            originIndex = index;
            stepIndex = formIndex;
            break;
          }
        }
        if (originIndex > -1 && stepIndex > -1) {
          let schemaIndex = this.schema[stepIndex].children.findIndex(item => item.id === id);
          let buttonIndex = this.schema[stepIndex].children.findIndex(item => item.id === buttonId);
          let repeatLength = buttonIndex - schemaIndex;
          let newObj = Object.assign({}, obj);
          delete newObj.id;
          newObj.canDelete = 'Y';
          newObj.repeatIndex = repeatLength + 1;
          newObj.isExpand = 'Y';
          let addition = {};
          newObj.subUserMatterFormItemList = obj.subUserMatterFormItemList.map((subItem, index) => {
            let newSubItem = Object.assign({}, subItem);
            delete newSubItem.id;
            delete newSubItem.attachList;
            delete newSubItem.apiUrl;
            newSubItem.parentItem = newObj;
            if (newSubItem.itemType === 'qm' || newSubItem.itemType === 'sm' || newSubItem.itemType === 'qmsm') {
              let certNoItem = Object.assign({}, newSubItem, {itemName: '身份证号码', regex: '/(^[1-9]\\d{5}(18|19|([23]\\d))\\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\\d{3}[0-9Xx]$)|(^[1-9]\\d{5}\\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\\d{2}$)/', reference: newSubItem});
              addition[index] = [certNoItem];
            } else if (newSubItem.itemType === 'qyqz') {
              let companyName = Object.assign({}, newSubItem, {itemName: '企业名称', regex: '^[\u4e00-\u9fa5]{2,50}$', reference: newSubItem});
              let companyCode = Object.assign({}, newSubItem, {itemName: '统一社会信用代码', regex: '^[^_IOZSVa-z\\W]{2}\\d{6}[^_IOZSVa-z\\W]{10}$', reference: newSubItem});
              addition[index] = [companyName, companyCode];
            }
            return newSubItem;
          });
          this.itemDemoData[stepIndex].matterFormItemList.splice(buttonIndex, 0, newObj);
          let newSchema = this.transformItems([newObj])[0];
          newSchema.children = this.transformItems(newObj.subUserMatterFormItemList, newSchema);
          let deleteButton = {
            id: this.generateId(),
            type: 'custom',
            render: () => {
              return (
                <div>
                  <span class="delete-button" onClick={() => this.deleteForm(newSchema.id)}>
                    <i class="df-del-icon"></i>
                    删除
                  </span>
                </div>
              )
            },
          };
          newSchema.children.push(deleteButton);
          Object.keys(addition).sort((a, b) => b - a).forEach(key => {
            let index = parseInt(key);
            let subItems = this.transformItems(addition[key]);
            newSchema.children[index].children = subItems;
          });
          this.schema[stepIndex].children.splice(buttonIndex, 0, newSchema);
        }
        this.preCompileFormula();
      },
      deleteForm(id) {
        let obj = this.objMapping[id];
        this.$confirm('确定删除表' + obj.itemName + '吗?', '删除确认', {}).then(() => {
          // this.itemDemoData[this.stepIndex].matterFormItemList.findIndex(item => item === obj);
          // delete this.controlMapping[id];
          // this.schema.slice(schemaIndex, schemaIndex + obj.subUserMatterFormItemList.length + 1).forEach(each => {
          //   delete this.objMapping[each.id];
          //   delete this.content[each.id];
          // });
          // this.schema.splice(schemaIndex, obj.subUserMatterFormItemList.length + 1);
          let originIndex = -1;
          let stepIndex = -1;
          for (let formIndex in this.itemDemoData) {
            let index = this.itemDemoData[formIndex].matterFormItemList.findIndex(item => item === obj);
            if (index > -1) {
              originIndex = index;
              stepIndex = formIndex;
              break;
            }
          }
          if (originIndex > -1 && stepIndex > -1) {
            this.itemDemoData[stepIndex].matterFormItemList.splice(originIndex, 1);
            let schemaIndex = this.schema[stepIndex].children.findIndex(item => item.id === id);
            let thisSchema = this.schema[stepIndex].children[schemaIndex];
            delete this.objMapping[id];
            delete this.content[id];
            thisSchema.children.forEach(each => {
              delete this.objMapping[each.id];
              delete this.content[each.id];
            });
            this.schema[stepIndex].children.splice(schemaIndex, 1);
            for (let i = schemaIndex; i < this.schema[stepIndex].children.length; i++) {
              let item = this.schema[stepIndex].children[i];
              if (item.type === 'subTitle' && item.canDelete && item.label.includes(obj.itemName)) {
                let itemIndex = parseInt(item.label.replace(obj.itemName, ''));
                this.$set(item, 'label', obj.itemName + (itemIndex - 1));
              } else {
                break;
              }
            }
            if (obj.id && typeof obj.id === 'number') {
              this.$post(`user/matter/delete/${obj.id}`);
            }
          }
        }).catch(() => false);
      },
      commitDataAfterUpload(id) {
        let obj = this.objMapping[id];
        let containList = [];
        let fileList = this.content[id].map(each => {
          let tempObj = {
            url: each.serverUrl,
            name: each.name,
          };
          if (each.id && typeof each.id === 'number') {
            containList.push(each.id);
            tempObj.id = each.id;
          }
          return tempObj;
        });
        let deletedList = obj.attachList.filter(each => !containList.includes(each.id)).map(each => {
          each.deleted = 'Y';
          return each;
        });
        fileList.push(...deletedList);
        obj.attachList = fileList;
        obj.itemValue = '';
        let parentObj;
        if (obj.parentItem) {
          let newObj = Object.assign({}, obj);
          delete newObj.parentItem;
          parentObj = Object.assign({}, obj.parentItem, {subUserMatterFormItemList: [newObj]});
          if (typeof parentObj.id !== 'number') {
            delete parentObj.id;
          }
        }
        if (parentObj) {
          this.$post(`api/user/tree/usermatterformitem/stepinput/${this.userMatterId}`, [parentObj]).then(({body}) => {
            obj.parentItem.id = body[0].id;
            obj.id = body[0].subUserMatterFormItemList[0].id;
            obj.parentId = body[0].subUserMatterFormItemList[0].parentId;
            obj.attachList = body[0].subUserMatterFormItemList[0].attachList;
            obj.attachList.filter(each => each.deleted === 'N').forEach((each, index) => {
              this.content[id][index].id = each.id;
            });
          });
        } else {
          this.$post(`api/user/tree/usermatterformitem/stepinput/${this.userMatterId}`, [Object.assign({}, obj)]).then(({body}) => {
            obj.id = body[0].id;
            obj.attachList = body[0].attachList;
            obj.attachList.filter(each => each.deleted === 'N').forEach((each, index) => {
              this.content[id][index].id = each.id;
            });
          });
        }
        this.uploadPromiseMap[id] = {};
        this.asyncCallbackMap[id] = {};
        this.rejectFuncMap[id] = () => {};
      },
      handleCheck(item, file) {
        if (item.listType == 'text') {
          // let fileTypes = [
          //   'application/msword',
          //   'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          //   'application/pdf',
          //   'application/x-pdf',
          //   'application/x-bzpdf',
          //   'application/x-gzpdf',
          // ];
          // if (!fileTypes.includes(file.type)) {
          //   this.$alert('不是支持的文档类型.', '上传失败', {
          //     confirmButtonText: '确定',
          //   });
          //   return false;
          if (file.size > 100 * 1024 * 1024) {
            this.$alert('文档太大, 请上传不超过100M的文档.', '上传失败', {
              confirmButtonText: '确定',
            });
            return false;
          } else {
            if (!this.uploadPromiseMap[item.id]) {
              this.uploadPromiseMap[item.id] = {};
              this.asyncCallbackMap[item.id] = {};
            }
            this.uploadPromiseMap[item.id][file.uid] = new Promise(resolve => this.asyncCallbackMap[item.id][file.uid] = resolve);
            this.rejectFuncMap[item.id] && this.rejectFuncMap[item.id]();
            let cancelPromise = new Promise((resolve, reject) => {
              this.rejectFuncMap[item.id] = reject;
            });
            let promiseArr = Object.keys(this.uploadPromiseMap[item.id]).map(key => this.uploadPromiseMap[item.id][key]);
            Promise.race([Promise.all(promiseArr), cancelPromise]).then(() => this.commitDataAfterUpload(item.id), () => {});
          }
        } else {
          if (!file.type.startsWith('image/')) {
            this.$alert('不是支持的图片类型.', '上传失败', {
              confirmButtonText: '确定',
            });
            return false;
          } else if (file.size > 20 * 1024 * 1024) {
            this.$alert('图片太大, 请上传不超过20M的图片.', '上传失败', {
              confirmButtonText: '确定',
            });
            return false;
          } else {
            if (!this.uploadPromiseMap[item.id]) {
              this.uploadPromiseMap[item.id] = {};
              this.asyncCallbackMap[item.id] = {};
            }
            this.uploadPromiseMap[item.id][file.uid] = new Promise(resolve => this.asyncCallbackMap[item.id][file.uid] = resolve);
            this.rejectFuncMap[item.id] && this.rejectFuncMap[item.id]();
            let cancelPromise = new Promise((resolve, reject) => {
              this.rejectFuncMap[item.id] = reject;
            });
            let promiseArr = Object.keys(this.uploadPromiseMap[item.id]).map(key => this.uploadPromiseMap[item.id][key]);
            Promise.race([Promise.all(promiseArr), cancelPromise]).then(() => this.commitDataAfterUpload(item.id), () => {});
          }
        }
        return true;
      },
      handleSuccess(item, file) {
        this.asyncCallbackMap[item.id][file.uid]();
      },
      handleRemove(item) {
        // if (item.listType == 'picture-card') {
        //   this.$refs.preview.removeCurrent();
        // } else {
          this.commitDataAfterUpload(item.id);
        // }
      },
      handleError(item, file, err) {
        this.$alert('网络错误, 请重试.', '上传失败', {
          confirmButtonText: '确定',
        });
        console.log(err);
      },
      handlePreview(item, file) {
        if (item.listType == 'picture-card') {
          // if (file.response) {
          //   this.dialogImageUrl = file.response.body[0].url;
          // } else {
          //   this.dialogImageUrl = file.url;
          // }
          // this.dialogVisible = true;
          let index = this.content[item.id].findIndex(each => each === file);
          let previewImgList = this.content[item.id].map((each, i) => {
            let img = document.querySelector(`#${item.id}-uploaderFiles>li:nth-child(${i + 1})>img`);
            let width;
            let height;
            if ((each.rotate === 90 || each.rotate === 270) && (img.src.startsWith('data:') || img.src.startsWith('blob:'))) {
              width = img.naturalHeight;
              height = img.naturalWidth;
            } else {
              width = img.naturalWidth;
              height = img.naturalHeight;
            }
            return {
              src: each.serverUrl.replace(/^https?:/, location.protocol),
              w: width,
              h: height,
            };
          });
          let previewOptions = {
            index: index,
            deleteImg: index => this.deleteImg(item, index),
            onClose: items => this.uploadRotatedImgs(item.id, items),
          };
          // this.$nextTick(() => this.$refs.preview.show());
          this.$gallery.show({
            imgList: previewImgList,
            options: previewOptions,
          });
        } else {
          let a = document.createElement('a');
          let url = file.raw ? URL.createObjectURL(file.raw) : file.serverUrl;
          let filename = file.name;
          a.href = url;
          a.download = filename;
          a.click();
        }
      },
      handleConfirm(item, file) {
        let word = item.listType == 'text' ? `文档 ${file.name}?` : '图片?';
        if (file && file.status != 'success') {
          return true;
        }
        return this.$confirm('确认删除' + word, '删除确认', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
        });
      },
      deleteImg(item, index) {
        return this.$confirm('确定删除该图片?').then(() => {
          this.content[item.id].splice(index, 1);
          item.handleRemove(item);
          this.$refs.form.validate(item.id, 'change');
        });
      },
      uploadRotatedImgs(id, items) {
        let promiseList = [];
        items.forEach((each, index) => {
          if (each.deg && each.originSrc) {
            let li = document.querySelector(`ul#${id}-uploaderFiles>li:nth-child(${index + 1})`);
            li.style = `transform: rotate(${each.deg}deg)`;
            let url = each.originSrc.replace(/^https?:/, 'https:');
            promiseList.push(this.$post('api/file/rotate/user_matter', {
              url: url,
              angel: each.deg,
            }).then(({body}) => {
              let temp = Object.assign({}, this.content[id][index], {url: body.url, serverUrl: body.url});
              this.$set(this.content[id], index, temp);
              li.querySelector('img').onload = () => li.style = '';
            }));
          }
        });
        Promise.all(promiseList).then(() => {
          this.commitDataAfterUpload(id);
        });
      },
      toLink(url) {
        window.location.href = url;
      },
      preCompileFormula() {
        this.calcReferenceMapping = {};
        this.schema.map(item => {
          let obj = this.objMapping[item.id];
          if (obj.itemType === 'number' && obj.formula) {
            let formula = obj.formula;
            let regExp = /#\{([0-9a-z]+?)\}/g;
            let map = {};
            let match;
            while (match = regExp.exec(formula)) {
              let currentCode = match[1];
              let isStatic = false;
              let arr = this.getCurrentIdsFromCode(currentCode, obj.parentItem);
              let val;
              if (arr.length) {
                if (obj.parentItem) {
                  val = this.content[arr[0]] ? this.content[arr[0]] : 0;
                } else {
                  val = arr.reduce((total, current) => total + parseFloat(this.content[current] ? this.content[current] : 0), 0);
                }
              } else {
                val = this.getLegacyValueFromCode(currentCode, obj.parentItem);
                isStatic = true;
              }
              map[currentCode] = {
                val: val,
                isStatic: isStatic,
                currentIdList: arr
              };
            }
            let compiledFormula = formula;
            Object.keys(map).map(each => {
              let result = map[each];
              if (result.isStatic) {
                compiledFormula = compiledFormula.replace(new RegExp('#\\{' + each + '\\}', 'g'), result.val);
              } else {
                if (obj.parentItem) {
                  compiledFormula = compiledFormula.replace(new RegExp(each, 'g'), result.currentIdList[0]);
                  if (!this.calcReferenceMapping[result.currentIdList[0]]) {
                    this.calcReferenceMapping[result.currentIdList[0]] = new Set();
                  }
                  this.calcReferenceMapping[result.currentIdList[0]].add(item.id);
                } else {
                  let joinId = result.currentIdList.reduce((total, current) => total + ',' + current);
                  compiledFormula = compiledFormula.replace(new RegExp(each, 'g'), joinId);
                  result.currentIdList.forEach(each => {
                    if (!this.calcReferenceMapping[each]) {
                      this.calcReferenceMapping[each] = new Set();
                    }
                    this.calcReferenceMapping[each].add(item.id);
                  });
                }
              }
            });
            obj.compiledFormula = compiledFormula;
            if (!compiledFormula.includes('#')) {
              let calc = new Function('return ' + compiledFormula)();
              if (!isNaN(calc)) {
                let calcStr = calc + '';
                let dotIndex = calcStr.indexOf('.');
                if (dotIndex != -1 && obj.formulaScale && dotIndex < calcStr.length - obj.formulaScale - 1) {
                  calcStr = calcStr.slice(0, dotIndex + obj.formulaScale + 1);
                }
                this.$set(this.content, item.id, calcStr);
              } else {
                this.$set(this.content, item.id, '0');
              }
            }
          }
        });
      },
      getCurrentIdsFromCode(code, parent) {
        let result = [];
        if (parent) {
          let match = parent.subUserMatterFormItemList.find(item => item.code === code);
          if (match) {
            let key = Object.keys(this.objMapping).find(key => this.objMapping[key] === match);
            result.push(key);
          } else {
            let newMatch = this.itemDemoData[this.stepIndex].matterFormItemList.find(item => item.code === code);
            if (newMatch) {
              let key = Object.keys(this.objMapping).find(key => this.objMapping[key] === match);
              result.push(key);
            } else {
              let subTitleList = this.itemDemoData[this.stepIndex].matterFormItemList.filter(item => item.itemType === 'bt');
              subTitleList.some(item => {
                let anotherMatch = item.subUserMatterFormItemList.find(sub => sub.code === code);
                if (anotherMatch) {
                  let key = Object.keys(this.objMapping).find(key => this.objMapping[key] === anotherMatch);
                  result.push(key);
                  return true;
                } else {
                  return false;
                }
              });
            }
          }
        } else {
          let match = this.itemDemoData[this.stepIndex].matterFormItemList.find(item => item.code === code);
          if (match) {
            let key = Object.keys(this.objMapping).find(key => this.objMapping[key] === match);
            result.push(key);
          } else {
            let subTitleList = this.itemDemoData[this.stepIndex].matterFormItemList.filter(item => item.itemType === 'bt');
            let title = subTitleList.some(item => {
              let anotherMatch = item.subUserMatterFormItemList.find(sub => sub.code === code);
              if (anotherMatch) {
                let key = Object.keys(this.objMapping).find(key => this.objMapping[key] === anotherMatch);
                result.push(key);
                return true;
              } else {
                return false;
              }
            });
            if (!title) {
              let subRepeatList = this.itemDemoData[this.stepIndex].matterFormItemList.filter(item => item.itemType === 'cfbd');
              subRepeatList.forEach(item => {
                let newMatch = item.subUserMatterFormItemList.find(sub => sub.code === code);
                if (newMatch) {
                  let key = Object.keys(this.objMapping).find(key => this.objMapping[key] === newMatch);
                  result.push(key);
                }
              });
            }
          }
        }
        return result;
      },
      getLegacyValueFromCode(code, parent) {
        if (parent) {
          let match = this.itemListData.find(item => item.code === code);
          if (match) {
            return parseFloat(match.itemValue);
          } else {
            let subTitleList = this.itemListData.filter(item => item.itemType === 'bt');
            let val = 0;
            subTitleList.some(item => {
              let anotherMatch = item.subUserMatterFormItemList.find(sub => sub.code === code);
              if (anotherMatch) {
                val = parseFloat(anotherMatch.itemValue);
                return true;
              } else {
                return false;
              }
            });
            if (val) {
              return val;
            } else {
              return 0;
            }
          }
        } else {
          let match = this.itemListData.find(item => item.code === code);
          if (match) {
            return parseFloat(match.itemValue);
          } else {
            let subTitleList = this.itemListData.filter(item => item.itemType === 'bt');
            let val = 0;
            subTitleList.some(item => {
              let anotherMatch = item.subUserMatterFormItemList.find(sub => sub.code === code);
              if (anotherMatch) {
                val = parseFloat(anotherMatch.itemValue);
                return true;
              } else {
                return false;
              }
            });
            if (val) {
              return val;
            } else {
              let subRepeatList = this.itemListData.filter(item => item.itemType === 'cfbd');
              let value = 0;
              let isMatched = false;
              subRepeatList.forEach(item => {
                let newMatch = item.subUserMatterFormItemList.find(sub => sub.code === code);
                if (newMatch) {
                  isMatched = true;
                  value += parseFloat(newMatch.itemValue);
                }
              });
              if (isMatched) {
                return value;
              } else {
                return 0;
              }
            }
          }
        }
      },
      getSingleSchemaById(schemaList, itemId) {
        for (let each of schemaList) {
          if (each.children && each.children.length) {
            let result = this.getSingleSchemaById(each.children, itemId);
            if (result) {
              return result;
            } else if (each.id === itemId) {
              return each;
            }
          } else if (each.id === itemId) {
            return each;
          }
        }
        return false;
      },
      addItemsByReference(itemId, paramId) {
        this.$post(`api/user/tree/linkRadio/${paramId}/${this.userMatterId}`).then(({body}) => {
          let reference = this.getSingleSchemaById(this.schema, itemId);
          // let index = this.schema.findIndex(current => current.id === itemId);
          if (this.referenceTaskQueue.length) {
            this.referenceTaskQueue.shift()();
          }
          this.itemListData = this.itemListData.filter(each => !body.map(el => el.id).includes(each.id));
          this.itemListData.push(...body.filter(each => each.id));
          let items = this.transformItems(body);
          this.itemReferenceMapping[itemId] = items.map(each => each.id);
          this.$set(reference, 'children', items);
          // this.schema.splice(index + 1, 0, ...items);
        });
      },
      removeItemsByReference(itemId, arr) {
        let reference = this.getSingleSchemaById(this.schema, itemId);
        let remain = reference.children.filter(each => !arr.includes(each.id));
        this.$set(reference, 'children', remain);
        // let remain = this.schema.filter(each => !arr.includes(each.id));
        // this.$set(this.schema, 'items', remain);
      },
      diffContent(oldVal, newVal) {
        let result = {
          add: {},
          remove: {},
          replace: {},
        };
        Object.keys(oldVal).forEach(key => {
          if (newVal.hasOwnProperty(key)) {
            if (JSON.stringify(oldVal[key]) !== JSON.stringify(newVal[key])) {
              result.replace[key] = {
                old: oldVal[key],
                new: newVal[key],
              };
            }
          } else {
            result.remove[key] = oldVal[key];
          }
        });
        Object.keys(newVal).filter(key => !oldVal.hasOwnProperty(key)).forEach(key => {
          result.add[key] = newVal[key];
        });
        return result;
      },
      processReference(oldVal, newVal) {
        let result = this.diffContent(oldVal, newVal);
        if (Object.keys(result.replace).length) {
          Object.keys(result.replace).forEach(each => {
            if (this.calcReferenceMapping[each]) {
              let set = this.calcReferenceMapping[each];
              set.forEach(id => {
                let compiledFormula = this.objMapping[id].compiledFormula;
                if (compiledFormula) {
                  let regExp = /#\{([0-9a-z,]+?)\}/g;
                  let express = compiledFormula;
                  let match;
                  while (match = regExp.exec(compiledFormula)) {
                    let matchedIds = match[1].split(',');
                    let newVal = matchedIds.reduce((total, current) => total + parseFloat(this.content[current] ? this.content[current] : 0), 0);
                    express = express.replace(new RegExp('#\\{' + match[1] + '\\}', 'g'), newVal);
                  }
                  let calc = new Function('return ' + express)();
                  if (!isNaN(calc)) {
                    let calcStr = calc + '';
                    let dotIndex = calcStr.indexOf('.');
                    if (dotIndex != -1 && this.objMapping[id].formulaScale && dotIndex < calcStr.length - this.objMapping[id].formulaScale - 1) {
                      calcStr = calcStr.slice(0, dotIndex + this.objMapping[id].formulaScale + 1);
                    }
                    this.$set(this.content, id, calcStr);
                  } else {
                    this.$set(this.content, id, '0');
                  }
                }
              });
            }
            if (this.itemReferenceMapping[each] && this.itemReferenceMapping[each].length) {
              this.referenceTaskQueue.push(() => this.removeItemsByReference(each, this.itemReferenceMapping[each]));
            }
            if (this.paramReferenceMapping[each] && this.paramReferenceMapping[each][result.replace[each].new]) {
              this.addItemsByReference(each, this.paramReferenceMapping[each][result.replace[each].new]);
            } else if (this.referenceTaskQueue.length) {
              this.referenceTaskQueue.shift()();
            }
          });
        }
        if (Object.keys(result.add).length) {
          Object.keys(result.add).forEach(each => {
            if (this.paramReferenceMapping[each] && this.paramReferenceMapping[each][result.add[each]]) {
              this.addItemsByReference(each, this.paramReferenceMapping[each][result.add[each]]);
            }
          });
        }
      },
      getInfoGroupData(id) {
        let obj = this.objMapping[id];
        let belongId = obj.belongId + '';
        if (obj.parentItem) {
          belongId += obj.parentItem.id;
        }
        this.updateFlag = true;
        this.$post(`api/reuse/data/get/${this.content[id]}`).then(({body}) => {
          body.forEach(each => {
            if (this.infoGroupMap[belongId] && this.infoGroupMap[belongId][each.itemName]) {
              let eachId = this.infoGroupMap[belongId][each.itemName];
              if (!this.content[eachId]) {
                this.$set(this.content, eachId, each.itemValue);
                this.triggerValidate(eachId, true);
              }
            }
          });
          this.updateFlag = false;
          if (this.updateTaskQueue.length) {
            this.$nextTick(() => this.updateTaskQueue.shift()());
          }
        });
      },
      updateData(id) {
        let val = this.content[id];
        if (Object.prototype.toString.call(val) === '[object Array]') {
          val = val.join(',');
        }
        let obj = this.objMapping[id];
        if (obj.itemValue === val) {
          if (this.infoGroupKeys.includes(id)) {
            this.getInfoGroupData(id);
          }
          if (this.updateTaskQueue.length) {
            this.$nextTick(() => this.updateTaskQueue.shift()());
          }
          return false;
        }
        if (obj.itemType === 'img' || obj.itemType === 'file') {
          if (this.updateTaskQueue.length) {
            this.$nextTick(() => this.updateTaskQueue.shift()());
          }
          return false;
        } else {
          obj.itemValue = val;
        }
        if (Object.prototype.toString.call(obj.id) === "[object String]") {
          delete obj.id;
        }
        if (obj.itemType === 'img' || obj.itemType === 'file') {
          if (this.updateTaskQueue.length) {
            this.$nextTick(() => this.updateTaskQueue.shift()());
          }
          return false;
        } else if (obj.itemName === '身份证号码' && obj.reference && (obj.itemType === 'qm' || obj.itemType === 'sm' || obj.itemType === 'qmsm')) {
          if (obj.reference.certNo != this.content[id]) {
            obj.reference.certNo = this.content[id];
            obj = obj.reference;
          } else {
            if (this.updateTaskQueue.length) {
              this.$nextTick(() => this.updateTaskQueue.shift()());
            }
            return false;
          }
        } else if (obj.itemName === '企业名称' && obj.reference && obj.itemType === 'qyqz') {
          if (obj.reference.itemValue != this.content[id]) {
            obj.reference.itemValue = this.content[id];
            obj = obj.reference;
          } else {
            if (this.updateTaskQueue.length) {
              this.$nextTick(() => this.updateTaskQueue.shift()());
            }
            return false;
          }
        } else if (obj.itemName === '统一社会信用代码' && obj.reference && obj.itemType === 'qyqz') {
          if (obj.reference.certNo != this.content[id]) {
            obj.reference.certNo = this.content[id];
            obj = obj.reference;
          } else {
            if (this.updateTaskQueue.length) {
              this.$nextTick(() => this.updateTaskQueue.shift()());
            }
            return false;
          }
        }
        let parentObj;
        if (obj.parentItem) {
          let newObj = Object.assign({}, obj);
          delete newObj.parentItem;
          parentObj = Object.assign({}, obj.parentItem, {subUserMatterFormItemList: [newObj]});
          if (typeof parentObj.id !== 'number') {
            delete parentObj.id;
          }
        }
        this.updateFlag = true;
        if (parentObj) {
          this.$post(`api/user/tree/usermatterformitem/stepinput/${this.userMatterId}`, [parentObj]).then(({body}) => {
            let oldParentId = obj.parentItem.id;
            obj.parentItem.id = body[0].id;
            let needChange = Object.keys(this.infoGroupMap).filter(each => !/^\d+$/.test(oldParentId) && each.endsWith(oldParentId));
            needChange.forEach(each => {
              let newEach = each.replace(oldParentId, body[0].id);
              this.infoGroupMap[newEach] = this.infoGroupMap[each];
              delete this.infoGroupMap[each];
            });
            obj.id = body[0].subUserMatterFormItemList[0].id;
            obj.parentId = body[0].subUserMatterFormItemList[0].parentId;
            if (this.infoGroupKeys.includes(id)) {
              this.updateTaskQueue.push(() => this.getInfoGroupData(id));
            }
            this.updateFlag = false;
            if (this.updateTaskQueue.length) {
              this.$nextTick(() => this.updateTaskQueue.shift()());
            }
          });
        } else {
          this.$post(`api/user/tree/usermatterformitem/stepinput/${this.userMatterId}`, [obj]).then(({body}) => {
            obj.id = body[0].id;
            if (this.infoGroupKeys.includes(id)) {
              this.updateTaskQueue.push(() => this.getInfoGroupData(id));
            }
            this.updateFlag = false;
            if (this.updateTaskQueue.length) {
              this.$nextTick(() => this.updateTaskQueue.shift()());
            }
          });
        }
      },
      triggerValidate(id, result) {
        let formItem = this.getSingleSchemaById(this.schema, id);
        if (formItem.type === 'input') {
          setTimeout(() => {
            let el = document.activeElement;
            if (!((el.tagName === 'INPUT' && el.parentElement.className.includes('item-instance') && !el.parentElement.className.includes('el-date-editor')) || el.tagName === 'TEXTAREA')) {
              // document.querySelector('.commit-area').style.display = 'flex';
              this.$emit('flowVisibleChange', true);
            }
          }, 10);
        }
        if (result) {
          if (this.updateFlag) {
            this.updateTaskQueue.push(() => this.updateData(id));
          } else {
            this.updateData(id);
          }
        }
      },
      hideButtonArea() {
        // document.querySelector('.commit-area').style.display = 'none';
        // this.$emit('flowVisibleChange', false);
        // if (!this.isIOS) {
          // this.windowHeight = window.innerHeight;
          // setTimeout(() => window.addEventListener('resize', this.triggerBlur), 500);
        // }
        this.$emit('buttonChange', []);
      },
      // showInputForIOS(e, item) {
      //   if (!item.readOnly && item.status !== 'disabled') {
      //     // this.inputClass = 'bottom-input-ios-start';
      //     this.inputVisible = true;
      //     let input = document.querySelector('.input-dialog');
      //     input.classList.remove('bottom-input-android');
      //     input.classList.add('bottom-input-ios-start');
      //   }
      // },
      // showInputForAndroid(e, item) {
      //   if (!item.readOnly && item.status !== 'disabled') {
      //     this.inputVisible = true;
      //     this.inputId = item.id;
      //     this.$emit('flowVisibleChange', false);
      //     let modal = document.querySelector('.inner-modal');
      //     modal.style.display = 'block';
      //     this.$nextTick(() => {
      //       this.$refs.input.focus();
      //     });
      //     let position = e.target.getBoundingClientRect().top;
      //     let scroll = document.body.scrollTop;
      //     document.body.scrollTop = position + scroll - 100;
      //     e.preventDefault();
      //   }
      // },
      // focusInputForIOS(e, item) {
      //   if (!item.readOnly && item.status !== 'disabled') {
      //     this.inputId = item.id;
      //     let input = document.querySelector('.input-dialog');
      //     input.classList.remove('bottom-input-ios-start');
      //     input.classList.add('bottom-input-ios-focus');
      //     document.querySelector('.commit-area').style.display = 'none';
      //     let modal = document.querySelector('.inner-modal');
      //     modal.style.display = 'block';
      //     this.$emit('flowVisibleChange', false);
      //     this.tempScroll = document.scrollingElement.scrollTop;
      //     this.tempPosition = e.target.getBoundingClientRect().top;
      //     this.$refs.input.focus();
      //     let wrapper = document.querySelector('.outer-wrapper');
      //     wrapper.style.height = '100vh';
      //     wrapper.style.overflowY = 'hidden';
      //     let calcScroll = this.tempScroll + this.tempPosition + 200 - wrapper.clientHeight;
      //     this.tempPosition = 0;
      //     if (calcScroll < 0) {
      //       this.$refs.paddingDiv.style.height = `${0 - calcScroll}px`;
      //       calcScroll = 0;
      //     }
      //     wrapper.scrollTop = calcScroll;
      //     let start = null;
      //     let step = timestamp => {
      //       if (!start) {
      //         start = timestamp;
      //       }
      //       document.body.scrollTop = document.body.scrollHeight;
      //       if (timestamp - start < 500) {
      //         requestAnimationFrame(step);
      //       }
      //     };
      //     requestAnimationFrame(step);
      //     // setTimeout(() => {
      //     //   document.body.scrollTop = document.body.scrollHeight;
      //     //   this.tempPosition = 0;
      //     // });
      //     this.inputInterval = setInterval(() => document.body.scrollTop = document.body.scrollHeight, 100);
      //     e.preventDefault();
      //   }
      // },
      // inputBlur() {
      //   setTimeout(() => {
      //     if (this.inputVisible) {
      //       this.triggerValidate();
      //     }
      //   }, 50);
      // },
      // triggerValidate() {
      //   if (this.inputId) {
      //     this.$refs.form.$refs[this.inputId][0].$emit('el.form.blur');
      //     this.inputId = '';
      //     this.$emit('flowVisibleChange', true);
      //     let modal = document.querySelector('.inner-modal');
      //     modal.style.display = 'none';
      //     if (this.isIOS) {
      //       clearInterval(this.inputInterval);
      //       this.inputInterval = 0;
      //       let wrapper = document.querySelector('.outer-wrapper');
      //       wrapper.style.height = 'auto';
      //       wrapper.style.overflowY = 'auto';
      //       this.$refs.paddingDiv.style.height = '0';
      //       document.body.scrollTop = this.tempScroll;
      //       this.tempScroll = 0;
      //       let input = document.querySelector('.input-dialog');
      //       input.classList.remove('bottom-input-ios-focus');
      //       input.classList.add('bottom-input-android');
      //       document.querySelector('.commit-area').style.display = 'flex';
      //     }
      //     this.inputVisible = false;
      //   }
      // },
      // scan() {
      //   window.location.href = `/scan?matterId=${this.matterId}&userMatterId=${this.userMatterId}&stepIndex=${this.stepIndex}`;
      // },
      // refresh() {
      //   this.goStep(this.stepIndex, true);
      // },
    },
    watch: {
      '$route.query.stepIndex'(val) {
        this.goStep(val ? parseInt(val) : 0);
      },
    },
  }
</script>

<style scoped>
  .outer-wrapper {
    background-color: #f5f5f5;
    /*height: 100%;*/
    overflow-x: hidden;
    overflow-y: auto;
    min-height: 100%;
  }
  .padding-div {
    width: 100%;
    height: 0;
  }
  .form-wrapper {
    margin: 0 auto;
    padding-bottom: 16px;
    width: calc(100vw - 32px);
    background-color: #f5f5f5;
    /*min-height: 600px;*/
  }
  .matter-name {
    text-align: center;
    font-size: 16px;
    font-weight: bold;
    line-height: 24px;
    margin: 0 24px;
    padding: 16px 0;
  }
  .matter-name>span {
    position: relative;
    top: 50%;
    transform: translateY(-50%);
    line-height: 30px;
  }
  .form {
    background-color: white;
  }
  .input-dialog {
    z-index: 2000;
    background-color: #fff;
    padding: 19px;
  }
  .input-dialog.bottom-input-android {
    position: fixed;
    left: 0;
    bottom: 0;
    right: 0;
    margin: 0;
  }
  .input-dialog.bottom-input-ios-start {
    display: none;
  }
  .input-dialog.bottom-input-ios-focus {
    position: absolute;
    left: 0;
    bottom: 0;
    right: 0;
    margin: 0;
  }
  .inner-modal {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background-color: #000;
    opacity: 0.5;
    display: none;
  }
  .b-wrapper {
    display: flex;
  }
  .b-input-wrapper {
    flex: 24;
    max-height: 40vh;
    overflow-y: auto;
  }
  .b-space {
    flex: 1;
  }
  .b-button-wrapper {
    display: flex;
    flex: 3;
    flex-direction: column-reverse;
  }
  .b-input >>> .el-textarea__inner {
    background-color: #f5f5f5;
  }
  .b-button {
    font-size: 14px;
    font-weight: 900;
  }
</style>
<style>
  /*.input-dialog .el-dialog__header {*/
  /*padding: 0;*/
  /*margin: 0;*/
  /*overflow: hidden;*/
  /*}*/
  /*.input-dialog .el-dialog__body {*/
  /*padding: 0;*/
  /*margin: 15px 0 15px 15px;*/
  /*}*/
  .img-preview .el-dialog__header {
    padding: 0;
  }
  .img-preview .el-dialog__body {
    display: table-cell;
    height: 100vh;
    padding: 0;
    margin: 0;
    text-align: center;
    vertical-align: middle;
  }
  .img-preview .dialog-img {
    max-width: 100%;
    max-height: 100%;
  }
  .uf-title {
    font-size: 14px;
    font-weight: 900;
  }
  .uf-methods {
  }
  .uf-left {
    font-size: 14px;
    font-weight: 900;
    float: left;
    width: 55px;
    height: 60px;
    margin-top: 10px;
  }
  .uf-right {
    font-size: 12px;
    color: #333;
    word-break: break-all;
    padding: 10px;
  }
  .df-repeat-form-add {
    border-bottom: 1px solid #eee;
    padding: 16px;
  }
  .df-button-repeat-form-add {
    border: 1px dashed #eee;
    padding: 14px;
    text-align: center;
  }
  .df-text-repeat-form-add {
    font-size: 16px;
    color: #ffa149;
  }
  .df-icon-repeat-form-add {
    font-weight: 900;
    font-size: 20px;
    line-height: 20px;
  }
  .tip {
    height: 40px;
    padding: 0 16px;
    background-color: #ffead7;
    color: #ffa149;
    font-size: 14px;
    line-height: 40px;
  }
  .icon-tip {
    display: inline-block;
    width: 14px;
    height: 14px;
    background-image: url("../assets/img/jd_weitw@2x.png");
    background-size: 100%;
    vertical-align: -5%;
  }
  .tip>span {
    margin-left: 8px;
  }
  .df-cell {
    padding: 16px;
    border-bottom: 1px solid #eee;
  }
  .upload-method-title {
    font-size: 14px;
    color: #000;
  }
  .uf-layout {
    display: flex;
    justify-content: space-around;
    margin: 20px 0;
  }
  .uf-button {
    background-color: #f5f5f5;
    border-radius: 4px;
    padding: 12px 8px;
  }
  .uf-button>span {
    color: #4672f6;
  }
  .upload-method-desc {
    font-size: 14px;
    color: #666;
    word-break: break-all;
    margin-bottom: 4px;
  }
  .upload-method-desc>span {
    color: #487fff;
  }
  .um-icon-1 {
    display: inline-block;
    width: 16px;
    height: 16px;
    background-image: url("../assets/img/icon_fuzhiwangzhi@2x.png");
    background-size: 100%;
    margin-right: 4px;
  }
  .um-icon-2 {
    display: inline-block;
    width: 16px;
    height: 16px;
    background-image: url("../assets/img/home_saoyisao copy 2@2x.png");
    background-size: 100%;
    margin-right: 4px;
  }
  .um-icon-3 {
    display: inline-block;
    width: 16px;
    height: 16px;
    background-image: url("../assets/img/icon_shuaxin@2x.png");
    background-size: 100%;
    margin-right: 4px;
  }
  .uf-desc-wrapper {
    margin-left: 8px;
    border-bottom: 1px solid #eee;
    padding-bottom: 16px;
    margin-bottom: 16px;
  }
  .collapse {
    height: 60px;
    overflow: hidden;
  }
  .expand {
    height: auto;
  }
  .more-button {
    margin-top: 16px;
    border: 1px solid #eef3ff;
    border-radius: 4px;
    padding: 12px;
    text-align: center;
  }
  .collapse-text {
    font-size: 14px;
    color: #487fff;
  }
  .file-collapse-icon {
    display: inline-block;
    width: 12px;
    height: 12px;
    margin-left: 4px;
    background-size: 100%;
    background-image: url("../assets/img/icon_fujian_fangfa@2x.png");
  }
  .file-expand-icon {
    display: inline-block;
    width: 12px;
    height: 12px;
    margin-left: 4px;
    background-image: url("../assets/img/icon_fujian_fangfa@2x.png");
    background-size: 100%;
    transform: scaleY(-1);
  }
</style>

<template>
  <div class="outer-wrapper">
    <div class="form-wrapper">
      <!--<div class="matter-name">-->
        <!--<span v-if="itemDemoData.length">【{{itemDemoData[stepIndex].name}}】</span>-->
      <!--</div>-->
      <!--<el-steps :active="stepIndex" align-center>-->
      <!--<el-step :title="step.name" description="" v-for="(step,index) in itemDemoData" :key="index" @click.native="goStep(index)"></el-step>-->
      <!--</el-steps>-->
      <DynamicForm class="form" :schema="schema" :content="content" :rule="rule" ref="form" @change="processReference"></DynamicForm>
      <el-dialog :visible.sync="dialogVisible">
        <img width="100%" :src="dialogImageUrl" alt="">
      </el-dialog>
    </div>
    <PhotoSwipe ref="preview" :imgList="previewImgList" :options="previewOptions"></PhotoSwipe>
  </div>
</template>

<script>
  import DynamicForm from '@/components/DynamicForm.vue';
  import PhotoSwipe from '@/components/PhotoSwipe.vue';

  // let websocket = null;
  export default {
    name: 'Preview',
    data() {
      return {
        stepIndex: 0,
        schema: {},
        content: {},
        rule: {},
        itemDemoData: [],
        itemListData: [],
        objMapping: {},
        controlMapping: {},
        paramReferenceMapping: {},
        itemReferenceMapping: {},
        dialogVisible: false,
        dialogImageUrl: '',
        isReservation: false,
        reservationText: '',
        reservationLink: '',
        form: [],
        isInFlow: false,
        isPush: false,
        isSignPreview: false,
        previewImgList: [],
        previewOptions: {},
        taskQueue: [],
      };
    },
    props: ['matterId', 'userMatterId', 'matterName', 'userId', 'noTree', 'stepList', 'prePage'],
    computed: {
    },
    mounted() {
      let dataParams = this.$route.query;
      this.isReservation = dataParams.submissionType === '2';
      if (this.isReservation) {
        this.reservationText = dataParams.submissionTitle;
        this.reservationLink = dataParams.submissionLink;
      }
      if (dataParams.isInFlow) {
        this.isInFlow = true;
        this.$emit('stepActiveChange', 2);
      } else {
        this.$emit('showTab', false);
      }
      if (dataParams.isPush) {
        this.isPush = true;
      }
      if (dataParams.isSignPreview) {
        this.isSignPreview = true;
      }
      let loading = this.$loading({
        lock: true,
        text: '正在加载',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.3)'
      });
      // let groupList = this.$post('api/user/tree/matterformitem/get/' + this.userMatterId);
      // let itemList = this.$post('api/user/tree/usermatterformitem/get/' + this.userMatterId);
      // Promise.all([groupList, itemList]).then(res => {
      //   loading.close();
      //   this.itemDemoData = res[0].body.map(form => {
      //     let newForm = Object.assign({}, form);
      //     newForm.matterFormItemList = newForm.matterFormItemList.map(item => {
      //       let newItem = Object.assign({}, item);
      //       newItem.matterTemplateFormItemId = newItem.id;
      //       return newItem;
      //     });
      //     return newForm;
      //   });
      //   localStorage.setItem(this.matterId + '|' + this.userMatterId + '|-1', JSON.stringify(res[1].body));
      //   let key = this.matterId + '|' + this.userMatterId + '|' + this.stepIndex;
      //   if (localStorage.getItem(key)) {
      //     this.itemListData = JSON.parse(localStorage.getItem(key));
      //   } else {
      //     this.itemListData = JSON.parse(localStorage.getItem(this.matterId + '|' + this.userMatterId + '|-1'));
      //   }
      //   this.renderPage();
      // }).catch(() => {
      //   loading.close();
      //   this.$alert('网络错误, 请重试.');
      // });
      let groupList = this.$post('api/user/tree/matterformitem/get/' + this.userMatterId);
      let itemList = this.$post('api/user/tree/usermatterformitem/get/' + this.userMatterId);
      Promise.all([groupList, itemList]).then(res => {
        loading.close();
        this.itemDemoData = res[0].body.map(form => {
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
        this.itemListData = res[1].body;
        this.renderPage();
      });
      // this.createWs();
      // this.initEventHandle();
    },
    components: {
      DynamicForm,
      PhotoSwipe,
    },
    methods: {
      generateHash(str) {
        return str.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
      },
      generateId(obj) {
        let newId = Math.floor(Math.random() * (1<<30)).toString(36);
        if (obj && obj instanceof Object) {
          this.objMapping[newId] = obj;
        }
        return newId;
      },
      renderPage() {
        let schema = {
          items: [],
          status: 'disabled',
        };
        this.itemDemoData.map(form => {
          let startIndex = schema.items.length;
          let repeat = {};
          form.matterFormItemList.map((item, index) => {
            if ((item.itemType === 'bt' || item.itemType === 'cfbd') && item.subUserMatterFormItemList && item.subUserMatterFormItemList.length) {
              let match = this.itemListData.filter(exist => exist.matterTemplateFormItemId === item.matterTemplateFormItemId);
              if (match.length) {
                if (item.itemType === 'bt') {
                  item.id = match[0].id;
                } else {
                  repeat[index] = match.map((each, innerIndex) => {
                    let newItem = Object.assign({}, item);
                    newItem.id = each.id;
                    newItem.subUserMatterFormItemList = newItem.subUserMatterFormItemList.map(subItem => Object.assign({}, subItem));
                    if (innerIndex) {
                      newItem.canDelete = 'Y';
                    }
                    return newItem;
                  });
                }
              }
            }
            return item;
          });
          Object.keys(repeat).sort((a, b) => b - a).map(key => {
            let index = parseInt(key);
            form.matterFormItemList.splice(index, 1, ...repeat[key]);
          });
          let addition = {};
          let arr = form.matterFormItemList.map((item, index) => {
            if ((item.itemType === 'bt' || item.itemType === 'cfbd') && item.subUserMatterFormItemList && item.subUserMatterFormItemList.length) {
              addition[index] = item.subUserMatterFormItemList;
            } else if (item.itemType === 'qm' || item.itemType === 'sm' || item.itemType === 'qmsm') {
              let certNoItem = Object.assign({}, item, {itemName: '身份证号码', regex: '/(^[1-9]\\d{5}(18|19|([23]\\d))\\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\\d{3}[0-9Xx]$)|(^[1-9]\\d{5}\\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\\d{2}$)/', reference: item});
              addition[index] = [certNoItem];
            } else if (item.itemType === 'qyqz') {
              let companyName = Object.assign({}, item, {itemName: '企业名称', regex: '[\u4e00-\u9fa5]{2,50}', reference: item});
              let companyCode = Object.assign({}, item, {itemName: '统一社会信用代码', regex: '[^_IOZSVa-z\\W]{2}\\d{6}[^_IOZSVa-z\\W]{10}', reference: item});
              addition[index] = [companyName, companyCode];
            }
            return item;
          });
          schema.items.push(...this.transformItems(arr));
          Object.keys(addition).sort((a, b) => b - a).map(key => {
            let index = parseInt(key);
            let parent = arr[index];
            let isSubForm = false;
            if (parent.itemType === 'bt' || parent.itemType === 'cfbd') {
              isSubForm = true;
            }
            let subItems = this.transformItems(addition[key], isSubForm ? arr[index].id : false);
            let subAddition = {};
            subItems.map((subItem, subIndex) => {
              let tempObj = this.objMapping[subItem.id];
              if (tempObj.itemName !== '身份证号码' && (tempObj.itemType === 'qm' || tempObj.itemType === 'sm' || tempObj.itemType === 'qmsm')) {
                let certNoItem = Object.assign({}, tempObj, {itemName: '身份证号码', regex: '/(^[1-9]\\d{5}(18|19|([23]\\d))\\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\\d{3}[0-9Xx]$)|(^[1-9]\\d{5}\\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\\d{2}$)/', reference: tempObj});
                subAddition[subIndex] = [certNoItem];
              } else if (tempObj.itemName !== '企业名称' && tempObj.itemName !== '统一社会信用代码' && tempObj.itemType === 'qyqz') {
                let companyName = Object.assign({}, tempObj, {itemName: '企业名称', regex: '[\u4e00-\u9fa5]{2,50}', reference: tempObj});
                let companyCode = Object.assign({}, tempObj, {itemName: '统一社会信用代码', regex: '[^_IOZSVa-z\\W]{2}\\d{6}[^_IOZSVa-z\\W]{10}', reference: tempObj});
                subAddition[index] = [companyName, companyCode];
              }
            });
            // this.controlMapping[schema.items[index].id] = subItems.map(sub => sub.id);
            Object.keys(subAddition).sort((a, b) => b - a).map(subKey => {
              let subIndex = parseInt(subKey);
              subItems.splice(subIndex + 1, 0, ...this.transformItems(subAddition[subKey], arr[index].id));
            });
            schema.items.splice(startIndex + index + 1, 0, ...subItems);
          });
          // Object.keys(addition).sort((a, b) => b - a).map(key => {
          //   let index = parseInt(key);
          //   let subItems = this.transformItems(addition[key], arr[index].id);
          //   this.controlMapping[schema.items[index].id] = subItems.map(sub => sub.id);
          //   schema.items.splice(startIndex + index + 1, 0, ...subItems);
          // });
        });
        let buttons;
        if (this.isInFlow) {
          let returnButton = {
            id: this.generateId(),
            type: 'primary',
            text: '上一步',
            plain: true,
            click: this.goBack,
          };
          let commitButton = {
            id: this.generateId(),
            type: 'primary',
            text: '下一步',
            click: this.sign,
          };
          buttons = [returnButton, commitButton];
          this.$emit('buttonChange', buttons);
        } else {
          let returnButton = {
            id: this.generateId(),
            type: 'primary',
            text: '返回',
            plain: true,
            click: () => {
              if (window.__wxjs_environment || navigator.userAgent.includes("miniProgram")) {
                if (this.isPush) {
                  wx.miniProgram.navigateBack({
                    delta: 1
                  });
                } else {
                  this.$router.back();
                }
              } else if (this.isSignPreview) {
                this.$router.back();
              } else {
                window.location.href = this.baseUrl + '/backIndex';
              }
            },
          };
          buttons = [returnButton];
          this.$emit('buttonChange', buttons);
          // schema.buttons = buttons;
        }
        this.schema = schema;
      },
      goBack() {
        // this.$router.push({
        //   path: '/matterItem',
        //   query: query,
        // });
        this.$router.replace({
          path: '/matterItem',
          query: this.$route.query,
        });
      },
      sign() {
        let data = {
          matterId: this.matterId,
          userMatterId: this.userMatterId,
        };
        // if (this.stepList.length) {
        //   let stepChange = {
        //     index: -1,
        //     steps: this.stepList.map(each => each.title).filter(each => each !== '类型选择' && each !== '表单项预览' && each !== '实名/签名'),
        //   };
        //   data.stepChange = JSON.stringify(stepChange);
        // }
        // this.$router.push({
        //   path: '/signAndVerifyInner',
        //   query: data
        // });
        this.$router.replace({
          path: '/signAndVerifyInner',
          query: data
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
            'bt': 'title',
            'cfbd': 'title',
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
          let match = [];
          if (parentId) {
            let parent = this.itemListData.filter(exist => exist.id === parentId);
            if (parent.length) {
              match = parent[0].subUserMatterFormItemList.filter(exist => exist.matterTemplateFormItemId === item.matterTemplateFormItemId);
            }
          } else {
            match = this.itemListData.filter(exist => exist.matterTemplateFormItemId === item.matterTemplateFormItemId);
          }
          let itemValue = '';
          if (match.length && item.itemName === '身份证号码' && (item.itemType === 'qm' || item.itemType === 'sm' || item.itemType === 'qmsm')) {
            itemValue = match[0].certNo;
          } else if (match.length && item.itemName === '企业名称' && item.itemType === 'qyqz') {
            itemValue = match[0].itemValue;
          } else if (match.length && item.itemName === '统一社会信用代码' && item.itemType === 'qyqz') {
            itemValue = match[0].certNo;
          } else if (match.length && formItem.type !== 'title') {
            itemValue = match[0].itemValue;
            item.attachList = match[0].attachList;
            item.id = match[0].id;
            if (item.itemType === 'qm' || item.itemType === 'qmsm') {
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
          if (item.itemType === 'cfbd') {
            let addButton = {
              id: this.generateId(),
              text: '添加多个',
              click: this.addForm,
            };
            let deleteButton = {
              id: this.generateId(),
              text: '删除',
              click: this.deleteForm,
            };
            formItem.items = [addButton];
            if (item.canDelete === 'Y') {
              formItem.items.unshift(deleteButton);
            }
          }
          if (formItem.type === 'text' || formItem.type === 'title') {
            if (item.itemType === 'text_info') {
              formItem.text = item.textInfo;
              if (item.fontColor) {
                formItem.style = {
                  color: item.fontColor
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
          }
          if (item.requird == 'Y' && !(formItem.type === 'text')) {
            if (formItem.type === 'upload' || formItem.type === 'checkbox') {
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
                message: '必填',
                trigger: 'blur',
              });
            }
          }
          if (formItem.type == 'input') {
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
            if (item.regex) {
              this.rule[formItem.id].push({
                type: 'string',
                pattern: item.regex.replace(/^\//, '').replace(/\/$/, ''),
                message: item.errorTips || '格式错误',
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
            if (item.fillType === '2' && !itemValue) {
              formItem.status = 'hidden';
            }
            if (item.required == 'Y') {
              this.rule[formItem.id].push({
                type: 'string',
                required: true,
                message: '请选择日期',
                trigger: 'change',
              });
            }
          } else if (formItem.type == 'upload') {
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
              return {
                id: file.id,
                name: file.name ? file.name : file.url.substr(file.url.lastIndexOf('/') + 1),
                url: file.url,
                serverUrl: file.url,
                // uid: this.generateHash(file.url),
              };
            });
            this.$set(this.content, formItem.id, fileList);
            formItem.handleCheck = this.handleCheck;
            formItem.handleError = this.handleError;
            formItem.handlePreview = this.handlePreview;
            formItem.handleConfirm = this.handleConfirm;
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
          } else if (formItem.type == 'checkbox' || formItem.type == 'radio' || formItem.type == 'select') {
            let items = [];
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
          }
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
          return formItem;
        });
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
          }
        }
      },
      handleError(item, file, err) {
        this.$alert('网络错误, 请重试.', '上传失败', {
          confirmButtonText: '确定',
        });
        console.log(err);
      },
      handlePreview(item, file) {
        if (item.listType == 'picture-card') {
          // this.dialogImageUrl = file.url;
          // this.dialogVisible = true;
          let index = this.content[item.id].findIndex(each => each.uid === file.uid);
          this.previewImgList = this.content[item.id].map((each, index) => {
            let img = this.$refs.form.getImg(index);
            let width = img.naturalWidth;
            let height = img.naturalHeight;
            return {
              src: each.serverUrl,
              w: width,
              h: height,
            };
          });
          this.previewOptions = {
            index: index,
            isPreview: true,
          };
          this.$nextTick(() => this.$refs.preview.show());
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
        let word = item.listType == 'text' ? '文档 ' : '图片 ';
        if (file && file.status != 'success') {
          return true;
        }
        return this.$confirm('确认删除' + word + file.name + '?', '删除确认', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
        });
      },
      toLink(url) {
        window.location.href = url;
      },
      addItemsByReference(itemId, paramId) {
        this.$post(`api/user/tree/linkRadio/${paramId}/${this.userMatterId}`).then(({body}) => {
          if (this.taskQueue.length) {
            this.taskQueue.shift()();
          }
          let index = this.schema.items.findIndex(current => current.id === itemId);
          this.itemListData = this.itemListData.filter(each => !body.map(el => el.id).includes(each.id));
          this.itemListData.push(...body);
          let items = this.transformItems(body);
          this.itemReferenceMapping[itemId] = items.map(each => each.id);
          this.schema.items.splice(index + 1, 0, ...items);
        });
      },
      removeItemsByReference(itemId, arr) {
        let remain = this.schema.items.filter(each => !arr.includes(each.id));
        this.$set(this.schema, 'items', remain);
      },
      diffContent(oldVal, newVal) {
        let result = {
          add: {},
          remove: {},
          replace: {},
        };
        Object.keys(oldVal).forEach(key => {
          if (newVal.hasOwnProperty(key)) {
            if (oldVal[key] != newVal[key]) {
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
            if (this.itemReferenceMapping[each] && this.itemReferenceMapping[each].length) {
              this.taskQueue.push(() => this.removeItemsByReference(each, this.itemReferenceMapping[each]));
            }
            if (this.paramReferenceMapping[each] && this.paramReferenceMapping[each][result.replace[each].new]) {
              this.addItemsByReference(each, this.paramReferenceMapping[each][result.replace[each].new]);
            } else if (this.taskQueue.length) {
              this.taskQueue.shift()();
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
    },
  }
</script>

<style scoped>
  .outer-wrapper {
    background-color: #f5f5f5;
    min-height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
  }
  .form-wrapper {
    margin: 0 auto;
    width: 95%;
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
    padding-bottom: 0;
  }
</style>

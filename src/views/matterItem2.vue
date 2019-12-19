<template>
  <div>
    <DynamicForm2 class="form" :schema="schema" :content="content" :rule="rule" ref="form" @change="processReference" @validate="triggerValidate"></DynamicForm2>
  </div>
</template>

<script>
  import { ref, reactive }  from '@vue/composition-api';
  import DynamicForm2 from '@/components/DynamicForm2';

  function getInitData(props, context, itemDemoData, itemListData) {
    let dataParams = context.$route.query;
    let isReservation = dataParams.submissionType === '2';
    let reservationText;
    let reservationLink;
    if (isReservation) {
      reservationText = dataParams.submissionTitle;
      reservationLink = dataParams.submissionLink;
    }
    let isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS) {
      document.addEventListener('touchend', this.triggerBlur);
    }
    let loading = context.$loading({
      lock: true,
      text: '正在加载',
      spinner: 'el-icon-loading',
      background: 'rgba(0, 0, 0, 0.3)'
    });
    let groupList = context.$post('api/user/tree/matterformitem/get/' + props.userMatterId);
    let itemList = context.$post('api/user/tree/usermatterformitem/get/' + props.userMatterId);
    return Promise.all([groupList, itemList]).then(res => {
      let result = res[0].body.map(form => {
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
      itemDemoData.push(...result);
      itemListData.push(...res[1].body);
    }).catch(() => {
      loading.close();
      context.$alert('网络错误, 请重试.');
    });
  }

  function renderPage(context, itemDemoData, itemListData, schema, content, rule, objMapping) {
    let mySchema = [];
    itemDemoData.map((form, stepIndex) => {
      let titleData = {
        itemType: 'bt',
        itemName: form.name,
      };
      mySchema.push(...transformItems([titleData], false, itemListData));
      let startIndex = mySchema.length;
      let repeat = {};
      let tempSet = new Set();
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
          let match = itemListData.filter(exist => exist.matterTemplateFormItemId === item.matterTemplateFormItemId);
          if (match.length) {
            if (item.itemType === 'bt') {
              item.id = match[0].id;
            } else {
              repeat[index] = match.map((each, innerIndex) => {
                let newItem = Object.assign({}, item);
                newItem.id = each.id;
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
          }
        }
        return item;
      });
      Object.keys(repeat).sort((a, b) => b - a).map(key => {
        let index = parseInt(key);
        itemDemoData[stepIndex].matterFormItemList.splice(index, 1, ...repeat[key]);
      });
      let addition = {};
      let arr = itemDemoData[stepIndex].matterFormItemList.map((item, index) => {
        if ((item.itemType === 'bt' || item.itemType === 'cfbd') && item.subUserMatterFormItemList && item.subUserMatterFormItemList.length) {
          addition[index] = item.subUserMatterFormItemList;
        } else if (item.itemType === 'qm' || item.itemType === 'sm' || item.itemType === 'qmsm') {
          let certNoItem = Object.assign({}, item, {itemName: '身份证号码', regex: '/(^[1-9]\\d{5}(18|19|([23]\\d))\\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\\d{3}[0-9Xx]$)|(^[1-9]\\d{5}\\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\\d{2}$)/', reference: item});
          addition[index] = [certNoItem];
        } else if (item.itemType === 'qyqz') {
          let companyName = Object.assign({}, item, {itemName: '企业名称', regex: '^[\u4e00-\u9fa5]{2,50}$', reference: item});
          let companyCode = Object.assign({}, item, {itemName: '统一社会信用代码', regex: '^[^_IOZSVa-z\\W]{2}\\d{6}[^_IOZSVa-z\\W]{10}$', reference: item});
          addition[index] = [companyName, companyCode];
        }
        return item;
      });
      mySchema.push(...transformItems(arr, false, itemListData));
      Object.keys(addition).sort((a, b) => b - a).map(key => {
        let index = parseInt(key);
        let parent = arr[index];
        let isSubForm = false;
        if (parent.itemType === 'bt' || parent.itemType === 'cfbd') {
          isSubForm = true;
        }
        let subItems = transformItems(addition[key], isSubForm ? arr[index].id : false, itemListData);
        let subAddition = {};
        subItems.map((subItem, subIndex) => {
          let tempObj = objMapping[subItem.id];
          if (tempObj.itemName !== '身份证号码' && (tempObj.itemType === 'qm' || tempObj.itemType === 'sm' || tempObj.itemType === 'qmsm')) {
            let certNoItem = Object.assign({}, tempObj, {itemName: '身份证号码', regex: '/(^[1-9]\\d{5}(18|19|([23]\\d))\\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\\d{3}[0-9Xx]$)|(^[1-9]\\d{5}\\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\\d{2}$)/', reference: tempObj});
            subAddition[subIndex] = [certNoItem];
          } else if (tempObj.itemName !== '企业名称' && tempObj.itemName !== '统一社会信用代码' && tempObj.itemType === 'qyqz') {
            let companyName = Object.assign({}, tempObj, {itemName: '企业名称', regex: '^[\u4e00-\u9fa5]{2,50}$', reference: tempObj});
            let companyCode = Object.assign({}, tempObj, {itemName: '统一社会信用代码', regex: '^[^_IOZSVa-z\\W]{2}\\d{6}[^_IOZSVa-z\\W]{10}$', reference: tempObj});
            subAddition[index] = [companyName, companyCode];
          }
        });
        Object.keys(subAddition).sort((a, b) => b - a).map(subKey => {
          let subIndex = parseInt(subKey);
          subItems.splice(startIndex + subIndex + 1, 0, ...transformItems(subAddition[subKey], arr[index].id, itemListData));
        });
        mySchema.splice(startIndex + index + 1, 0, ...subItems);
      });
    });
    schema.push(mySchema);
    this.preCompileFormula();
  }

  function transformItems(arr, parentId, itemListData, content, rule) {
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
        id: generateId(item),
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
        let parent = itemListData.filter(exist => exist.id === parentId);
        if (parent.length) {
          match = parent[0].subUserMatterFormItemList.filter(exist => exist.matterTemplateFormItemId === item.matterTemplateFormItemId);
        }
      } else {
        match = itemListData.filter(exist => exist.matterTemplateFormItemId === item.matterTemplateFormItemId);
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
      content[formItem.id] = itemValue;
      rule[formItem.id] = [];
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
      if (item.requird == 'Y' && !(formItem.type === 'text' || formItem.type === 'title')) {
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
            // uid: this.generateHash(file.url + (new Date).getTime()),
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
  }

  function preCompileFormula() {
    this.calcReferenceMapping = {};
    this.schema.items.map(item => {
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
  }

  function getCurrentIdsFromCode(code, parent) {
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
  }

  function getLegacyValueFromCode(code, parent) {
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
  }

  function processReference(oldVal, newVal) {
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
  }

  function diffContent(oldVal, newVal) {
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
  }

  function addItemsByReference(itemId, paramId) {
    this.$post(`api/user/tree/linkRadio/${paramId}/${this.userMatterId}`).then(({body}) => {
      let index = this.schema.items.findIndex(current => current.id === itemId);
      if (this.referenceTaskQueue.length) {
        this.referenceTaskQueue.shift()();
      }
      this.itemListData = this.itemListData.filter(each => !body.map(el => el.id).includes(each.id));
      this.itemListData.push(...body.filter(each => each.id));
      let items = this.transformItems(body);
      this.itemReferenceMapping[itemId] = items.map(each => each.id);
      this.schema.items.splice(index + 1, 0, ...items);
    });
  }

  function removeItemsByReference(itemId, arr) {
    let remain = this.schema.items.filter(each => !arr.includes(each.id));
    this.$set(this.schema, 'items', remain);
  }

  function triggerValidate(id, result) {
    let formItem = this.schema.items.find(each => each.id === id);
    if (formItem.type === 'input') {
      setTimeout(() => {
        let el = document.activeElement;
        if (!((el.tagName === 'INPUT' && el.parentElement.className.includes('item-instance') && !el.parentElement.className.includes('el-date-editor')) || el.tagName === 'TEXTAREA')) {
          document.querySelector('.commit-area').style.display = 'flex';
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
  }

  function updateData(id) {
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
  }

  function getInfoGroupData(id) {
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
  }

  function generateId(obj) {
    let newId;
    if (Object.prototype.toString.call(window.globalUniqueId) !== '[object Set]') {
      window.globalUniqueId = new Set();
    }
    do {
      newId = Math.floor(Math.random() * (1<<30)).toString(36);
    } while (window.globalUniqueId.has(newId));
    window.globalUniqueId.add(newId);
    if (obj && obj instanceof Object) {
      this.objMapping[newId] = obj;
    }
    return newId;
  }

  export default {
    setup(props, context) {
      const itemDemoData = [];
      const itemListData = [];
      const init = getInitData(props, context, itemDemoData, itemListData);

      const schema = reactive([]);
      const content = reactive({});
      const rule = reactive({});
      const objMapping = {};
      init.then(() => renderPage(context, itemDemoData, itemListData, schema, content, rule, objMapping));
      return {
        DynamicForm2,
        schema,
        content,
        rule,
        processReference,
        triggerValidate,
      };
    }
  };
</script>

<style scoped>

</style>

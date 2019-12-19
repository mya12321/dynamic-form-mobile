<template>
  <div class="weui-cells weui-cells_form" :style="{backgroundColor: bgColor}">
    <div class="repeat" v-for="item in form.schema.filter(each => each.status !== 'hidden')"
         :key="item.id" @change="validate(item.id, 'change')" @focusout="validate(item.id, 'blur')" :data-id="item.id">
      <div class="df-cell" v-if="item.type === 'input'">
        <div class="df-cell-inner">
          <div class="weui-cell__hd df-cell-hd">
            <label :class="['weui-label', item.isRequired ? 'is-required' : '']">{{item.label}}</label>
            <div>
              <div class="df-link" v-if="item.helpLink" @click="helpLink(item)">
                <i class="df-help-icon"></i>
                <span>{{item.type === 'input' ? '教我填' : '教我选'}}</span>
              </div>
              <div class="button-sample" v-if="item.sample" @click="item.sample.click(item.sample)">
                <span>查看样本</span>
              </div>
            </div>
          </div>
          <div v-if="item.tip" class="df-item-tip" :style="item.tipStyle">{{item.tip}}</div>
          <div :class="['weui-cell__bd', 'df-input', item.validateStatus]" @click="item.click">
            <textarea class="weui-textarea" v-if="item.inputType === 'textarea'" :placeholder="item.placeholder" v-model="content[item.id]" rows="3"></textarea>
            <input v-else class="weui-input" :type="item.inputType" :placeholder="item.placeholder" v-model="content[item.id]"/>
            <div class="df-small-flag"></div>
          </div>
          <div class="df-error-tip"></div>
        </div>
      </div>
      <div class="df-cell" v-if="item.type === 'date'">
        <div class="df-cell-inner">
          <div class="weui-cell__hd df-cell-hd">
            <label :class="['weui-label', item.isRequired ? 'is-required' : '']">{{item.label}}</label>
            <div>
              <div class="df-link" v-if="item.helpLink" @click="helpLink(item)">
                <i class="df-help-icon"></i>
                <span>{{item.type === 'input' ? '教我填' : '教我选'}}</span>
              </div>
              <div class="button-sample" v-if="item.sample" @click="item.sample.click(item.sample)">
                <span>查看样本</span>
              </div>
            </div>
          </div>
          <div v-if="item.tip" class="df-item-tip" :style="item.tipStyle">{{item.tip}}</div>
          <div :class="['weui-cell__bd', 'df-input', item.validateStatus]" @click="showDatePicker(item)">
            <!--<input class="weui-input" type="date" :placeholder="item.placeholder" v-model="content[item.id]"/>-->
            <div :class="['weui-input', content[item.id] ? '' : 'grey']">{{content[item.id] ? content[item.id] : item.placeholder}}</div>
            <div class="df-small-flag"></div>
          </div>
          <div class="df-error-tip"></div>
        </div>
      </div>
      <div class="df-cell" v-if="item.type === 'radio'">
        <div class="df-cell-inner">
          <div class="list-title df-cell-hd">
            <label :class="['weui-label', item.isRequired ? 'is-required' : '']">{{item.label}}</label>
            <div>
              <div class="df-link" v-if="item.helpLink" @click="helpLink(item)">
                <i class="df-help-icon"></i>
                <span>{{item.type === 'input' ? '教我填' : '教我选'}}</span>
              </div>
              <div class="button-sample" v-if="item.sample" @click="item.sample.click(item.sample)">
                <span>查看样本</span>
              </div>
            </div>
          </div>
          <div v-if="item.tip" class="df-item-tip" :style="item.tipStyle">{{item.tip}}</div>
          <div class="weui-cells weui-cells_radio" @change="e => radioChange(e, item.id)">
            <label class="df-cell-hd" v-for="subItem in item.items" :key="subItem.id" :for="subItem.id">
              <input type="radio" class="weui-check" :name="item.id" :id="subItem.id" :value="subItem.value" :checked="content[item.id] === subItem.value"/>
              <div class="df-item-wrapper">
                <p class="df-item-label">{{subItem.label}}</p>
                <p class="df-item-tip">{{subItem.tip}}</p>
                <div class="df-item-select"></div>
              </div>
            </label>
          </div>
          <div class="df-error-tip"></div>
        </div>
      </div>
      <div class="df-cell" v-if="item.type === 'checkbox'">
        <div class="df-cell-inner">
          <div class="list-title df-cell-hd">
            <label :class="['weui-label', item.isRequired ? 'is-required' : '']">{{item.label}}</label>
            <div>
              <div class="df-link" v-if="item.helpLink" @click="helpLink(item)">
                <i class="df-help-icon"></i>
                <span>{{item.type === 'input' ? '教我填' : '教我选'}}</span>
              </div>
              <div class="button-sample" v-if="item.sample" @click="item.sample.click(item.sample)">
                <span>查看样本</span>
              </div>
            </div>
          </div>
          <div v-if="item.tip" class="df-item-tip" :style="item.tipStyle">{{item.tip}}</div>
          <div class="weui-cells weui-cells_checkbox" @change="e => checkboxChange(e, item.id)">
            <label class="df-cell-hd" v-for="subItem in item.items" :key="subItem.id" :for="subItem.id">
              <input type="checkbox" class="weui-check" :name="item.id" :id="subItem.id" :value="subItem.value" :checked="content[item.id] && content[item.id].includes(subItem.value)"/>
              <div class="df-item-wrapper">
                <p class="df-item-label">{{subItem.label}}</p>
                <p class="df-item-tip">{{subItem.tip}}</p>
                <div class="df-item-select"></div>
              </div>
            </label>
          </div>
          <div class="df-error-tip"></div>
        </div>
      </div>
      <div class="df-cell weui-cell_select weui-cell_select-after" v-if="item.type === 'select'">
        <div class="df-cell-inner">
          <div class="weui-cell__hd df-cell-hd">
            <label :class="['weui-label', item.isRequired ? 'is-required' : '']">{{item.label}}</label>
            <div>
              <div class="df-link" v-if="item.helpLink" @click="helpLink(item)">
                <i class="df-help-icon"></i>
                <span>{{item.type === 'input' ? '教我填' : '教我选'}}</span>
              </div>
              <div class="button-sample" v-if="item.sample" @click="item.sample.click(item.sample)">
                <span>查看样本</span>
              </div>
            </div>
          </div>
          <div v-if="item.tip" class="df-item-tip" :style="item.tipStyle">{{item.tip}}</div>
          <div :class="['weui-cell__bd', 'df-input', item.validateStatus]" @click="showPicker(item)">
            <!--<select class="weui-select" :name="item.id">-->
            <!--<option v-for="subItem in item.items" :key="subItem.id" :value="subItem.value">{{subItem.label}}</option>-->
            <!--</select>-->
            <div :class="['weui-input', content[item.id] ? '' : 'grey']">
              {{content[item.id] ? item.items.filter(param => param.value === content[item.id]).map(param => param.label)[0] : item.placeholder}}
            </div>
            <div class="df-small-flag"></div>
          </div>
          <div class="df-error-tip"></div>
        </div>
      </div>
      <div class="df-cell" v-if="item.type === 'title' && item.children && item.children.length">
        <div class="df-title-placeholder"></div>
        <div class="weui-cell df-flex" @click="titleClick(item)">
          <div class="df-cell-hd">
            <i class="df-title-icon"></i>
            <span class="df-title">{{item.text}}</span>
          </div>
          <div :class="[item.finishStatus, 'df-cell-bd']">
            <i class="form-status-icon"></i>
            <span class="form-status-text">{{finishStatusTextMap[item.finishStatus]}}</span>
            <i :class="`form-expand-icon-${item.expandStatus}`"></i>
          </div>
        </div>
      </div>
      <div class="df-subTitle" v-if="item.type === 'subTitle' && item.children && item.children.length">
        <div class="df-cell-inner">
          <div class="df-cell-hd title-subTitle" @click.stop="titleClick(item)">
            <span class="df-title weui-label">
              {{item.label}}
              <span class="first-child-content" v-if="item.isRepeat && item.children.filter(each => each.firstLabel || each.secondLabel).length === 2">
                ({{content[item.children.find(each => each.firstLabel).id]}}-{{content[item.children.find(each => each.secondLabel).id]}})
              </span>
            </span>
            <div :class="[item.finishStatus, 'df-cell-bd']">
              <i class="form-status-icon"></i>
              <span class="form-status-text">{{finishStatusTextMap[item.finishStatus]}}</span>
              <i :class="`form-expand-icon-${item.expandStatus}`"></i>
            </div>
          </div>
          <DynamicForm2 :schema="item.children" :rule="rule" :content="content" bg-color="white" v-show="item.expandStatus === 'expand'" :root="false" @validate="(id, result) => validateBubble(item, id, result)"></DynamicForm2>
        </div>
      </div>
      <div class="df-cell" v-if="item.type === 'text'">
        <div class="df-cell-inner">
          <div class="df-text-item" :style="item.style">
            <span v-html="item.text.replace(/\n/g, '<br/>')"></span>
          </div>
        </div>
      </div>
      <UploadItem class="df-cell" v-if="item.type === 'upload'" :item="item" :content="content" @change="validate(item.id, 'change')"></UploadItem>
      <div v-if="item.type === 'custom'">
        <CustomItem :item="item"></CustomItem>
      </div>
      <div v-if="item.type !== 'subTitle' && item.children && item.children.length" v-show="item.expandStatus === 'expand'">
        <DynamicForm2 :schema="item.children" :rule="rule" :content="content" bg-color="white" :root="false" @validate="(id, result) => validateBubble(item, id, result)"></DynamicForm2>
      </div>
    </div>
  </div>
</template>

<script>
  // import $ from 'zepto';
  import AsyncValidator from 'async-validator';
  import weui from 'weui.js';
  import CustomItem from './CustomItem.js';
  import UploadItem from './UploadItem.vue';

  export default {
    name: 'DynamicForm2',
    props: {
      schema: Array,
      content: Object,
      rule: Object,
      bgColor: String,
      root: Boolean,
    },
    components: {
      CustomItem,
      UploadItem,
    },
    data() {
      return {
        defaults: {
          labelPosition: 'top',
          labelWidth: '50px',
          schema: {
            status: 'edit',
            inline: false,
            type: 'input',
            items: [],
            children: [],
          },
          input: {
            type: 'input',
            placeholder: '请输入',
            tip: '',
            inputType: 'text',
            autosize: true,
          },
          radio: {
            items: [],
          },
          checkbox: {
            items: [],
          },
          select: {
            placeholder: '请选择',
            items: [],
          },
          date: {
            format: 'yyyy-MM-dd',
            placeholder: '请选择日期',
          },
          upload: {
            tip: '',
          },
          title: {},
          text: {},
          radioItem: {
            value: '',
          },
          checkboxItem: {
            value: '',
          },
          selectItem: {
            value: '',
          },
          titleItem: {
            text: '',
            click() {},
          }
        },
        contentCopy: {},
        imgPreviewUl: {},
        finishStatusTextMap: {
          'finished': '已填完',
          'unfinished': '未填完',
        },
        firstFunc: () => {},
        firstFlag: false,
      };
    },
    inject: {
      finishedIds: {default: []},
      expandIds: {default: []},
      validateIdMap: {default: {}},
    },
    computed: {
      form() {
        this.firstFlag = false;
        let newSchema = Array.from(this.schema);
        newSchema = newSchema.map(item => {
          let defaultItem = this.defaults[item.type];
          let newItem = Object.assign({}, this.defaults.schema, defaultItem, item);
          if (newItem.items && newItem.items.length) {
            newItem.items.map(paramItem => {
              let defaultParamItem = this.defaults[newItem.type + 'Item'];
              return Object.assign({}, defaultParamItem, paramItem);
            });
          }
          if (this.rule[newItem.id] && this.rule[newItem.id].some(rule => rule.required)) {
            newItem.isRequired = true;
          }
          if (this.validateIdMap[newItem.id] === 1) {
            newItem.validateStatus = 'valid';
          } else if (this.validateIdMap[newItem.id] === 2) {
            newItem.validateStatus = 'invalid';
          }
          // this.addFormStatusRecursive(newItem);
          if (this.finishedIds.includes(newItem.id)) {
            newItem.finishStatus = 'finished';
          } else {
            newItem.finishStatus = 'unfinished';
          }
          if (newItem.type === 'subTitle' && newItem.isExpand) {
            this.expandIds.push(newItem.id);
            item.isExpand = false;
          }
          if (newItem.type === 'title' && !this.expandIds.includes(newItem.id)) {
            newItem.expandStatus = 'collapse';
          } else if (newItem.type === 'subTitle' && !this.expandIds.includes(newItem.id)) {
            newItem.expandStatus = 'collapse';
          } else {
            newItem.expandStatus = 'expand';
          }
          this.firstFunc();
          return newItem;
        });
        // this.$nextTick(() => {
        //   document.querySelectorAll('.el-upload-list--picture-card').forEach(ul => {
        //     ul.removeEventListener('click', this.listener);
        //     ul.addEventListener('click', this.listener);
        //   });
        // });
        return {
          schema: newSchema,
        };
      },
    },
    mounted() {
      this.firstFunc = this.debounce(this.firstValidate, 10);
    },
    methods: {
      generateHash(str) {
        return str.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
      },
      handleSuccess(item, res, file, fileList) {
        let index = fileList.findIndex(each => each.uid === file.uid);
        this.content[item.id][index] = {
          uid: fileList[index].uid,
          serverUrl: res.url,
          name: file.name,
          url: URL.createObjectURL(file.raw),
        };
        if (typeof item.handleSuccess === 'function') {
          item.handleSuccess(item, file, index);
        }
        let isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        if (!isIOS && res.rotate) {
          this.$nextTick(() => {
            let ul = this.$refs[item.id][0].$children[0].$children[0].$el;
            let img = ul.querySelector('li:nth-child(' + (index + 1) + ')>img');
            img.style.transform = 'rotate(' + res.rotate + 'deg)';
          });
        }
        this.$refs[item.id][0].$emit('el.form.change');
      },
      handleRemove(item, file) {
        let index = this.content[item.id].findIndex(each => each.uid === file.uid);
        this.content[item.id].splice(index, 1);
        if (typeof item.handleRemove === 'function') {
          item.handleRemove(item, file, index);
        }
        this.$refs[item.id][0].$emit('el.form.change');
      },
      radioChange(e, id) {
        let subInputs = e.currentTarget.querySelectorAll('input.weui-check');
        subInputs.forEach(each => {
          if (each.checked) {
            this.$set(this.content, id, each.value);
          }
        });
      },
      checkboxChange(e, id) {
        let subInputs = e.currentTarget.querySelectorAll('input.weui-check');
        let result = [];
        subInputs.forEach(each => {
          if (each.checked) {
            result.push(each.value);
          }
        });
        this.$set(this.content, id, result.sort((a, b) => {
          let params = this.form.schema.find(each => each.id === id).items;
          return params.findIndex(each => each.value === a) - params.findIndex(each => each.value === b);
        }));
      },
      inputClick(e, item) {
        if (typeof item.click === 'function') {
          item.click.call(null, e, item);
        }
      },
      inputMouseDown(e, item) {
        if (typeof item.mouseDown === 'function') {
          item.mouseDown.call(null, e, item);
        }
      },
      showPicker(item) {
        weui.picker(item.items, {
          defaultValue: [this.content[item.id]],
          onConfirm: result => {
            this.$set(this.content, item.id, result[0].value);
            this.validate(item.id, 'change');
          },
          title: item.label,
        });
      },
      showDatePicker(item) {
        let time = new Date();
        weui.datePicker({
          defaultValue: [time.getFullYear(), time.getMonth() + 1, time.getDate()],
          onConfirm: result => {
            let date = `${result[0].value}-${result[1].value}-${result[2].value}`;
            this.$set(this.content, item.id, date);
            this.validate(item.id, 'change');
          },
          title: item.label,
        });
      },
      validate(id, trigger) {
        let success = () => {
          if (Object.prototype.toString.call(id) === '[object String]') {
            this.$set(this.validateIdMap, id, 1);
            let el = document.querySelector(`div[data-id=${id}] div.df-error-tip`);
            if (el) {
              el.innerHTML = '';
            }
          } else {
            this.validateIdMap = this.getIdsFromSchema(this.form.schema).reduce((res, key) => (res[key] = 1, res), {});
            document.querySelectorAll('.df-error-tip').forEach(each => each.innerHTML = '');
          }
          return false;
        };
        let failed = ({errors, fields}) => {
          Object.keys(fields).forEach(key => {
            this.$set(this.validateIdMap, key, 2);
            let el = document.querySelector(`div[data-id=${key}] div.df-error-tip`);
            if (el) {
              el.innerHTML = fields[key][0].message;
            }
          });
          return errors;
        };
        if (Object.prototype.toString.call(id) === '[object Function]') {
          let ids = this.getIdsFromSchema(this.form.schema);
          let descriptor = Object.keys(this.rule).filter(key => ids.includes(key)).reduce((res, key) => (res[key] = this.rule[key], res), {});
          let formValidator = new AsyncValidator(descriptor);
          let validateObj = Object.keys(this.content).filter(key => ids.includes(key)).reduce((res, key) => (res[key] = this.content[key], res), {});
          formValidator.validate(validateObj).then(success, failed).then(errors => id(!errors));
        } else if (this.rule[id]) {
          let descriptor = {
            [id]: this.rule[id].filter(rule => rule.trigger === trigger),
          };
          let singleValidator = new AsyncValidator(descriptor);
          let validateObj = {
            [id]: this.content[id],
          };
          singleValidator.validate(validateObj).then(success, failed).then(errors => this.$emit('validate', id, !errors));
        }
      },
      validateBubble(item, id, result) {
        if ((this.root && item.type === 'title') || item.type === 'subTitle') {
          this.finishStatusChange(item);
        }
        this.$emit('validate', id, result);
      },
      firstValidate() {
        if (this.root && !this.firstFlag) {
          this.schema.filter(each => each.type === 'title').forEach(newItem => {
            this.finishStatusChange(newItem);
            newItem.children.filter(each => each.type === 'subTitle').forEach(subItem => {
              this.finishStatusChange(subItem);
            });
          });
          this.firstFlag = true;
        }
      },
      finishStatusChange(item) {
        let ids = this.getIdsFromSchema(item.children);
        let descriptor = Object.keys(this.rule).filter(key => ids.includes(key)).reduce((res, key) => (res[key] = this.rule[key], res), {});
        let formValidator = new AsyncValidator(descriptor);
        let validateObj = Object.keys(this.content).filter(key => ids.includes(key)).reduce((res, key) => (res[key] = this.content[key], res), {});
        formValidator.validate(validateObj, {first: true}, errors => {
          let index = this.finishedIds.findIndex(each => each === item.id);
          if (errors && index > -1) {
            this.finishedIds.splice(index, 1);
          } else if (!errors && index === -1) {
            this.finishedIds.push(item.id);
          }
        });
      },
      // addFormStatusRecursive(schema) {
      //   if (schema.children && schema.children.length) {
      //     schema.children.forEach(each => this.addFormStatusRecursive(each));
      //     if (schema.children.every(each => this.finishedIds.includes(each.id))
      //     && (schema.type === 'title' || schema.type === 'subTitle' || schema.type === 'text' || this.validateIdMap[schema.id] === 1 || this.content[schema.id])) {
      //       this.finishedIds.push(schema.id);
      //     }
      //   } else {
      //     if (this.content[schema.id] || schema.type === 'text') {
      //       this.finishedIds.push(schema.id);
      //     }
      //   }
      // },
      titleClick(item) {
        if (item.expandStatus === 'collapse') {
          this.expandIds.push(item.id);
        } else {
          let index = this.expandIds.findIndex(each => each === item.id);
          this.expandIds.splice(index, 1);
        }
      },
      helpLink(item) {
        console.log(this.$halfDialog);
        this.$halfDialog.show({
          title: item.helpLink.title,
          content: item.helpLink.content,
        });
      },
      getIdsFromSchema(schema) {
        let ids = schema.map(each => {
          if (each.status === 'hidden') {
            return [];
          } else if (each.children && each.children.length) {
            let children = this.getIdsFromSchema(each.children);
            return [each.id, ...children];
          } else {
            return [each.id];
          }
        });
        return Array.prototype.concat.call(...ids);
      },
      debounce(fn, delay) {
        let timer = null;
        return (...args) =>{
          clearTimeout(timer);
          timer = setTimeout(()=>{
            fn(...args);
          }, delay);
        }
      },
    },
    watch: {
      'content': {
        handler(val) {
          let temp = JSON.parse(JSON.stringify(val));
          this.$emit('change', this.contentCopy, val);
          this.contentCopy = temp;
          if (Object.keys.length) {
            this.firstFunc();
          }
        },
        deep: true,
      },
    },
  }
</script>

<style scoped>
  .repeat {
    background-color: white;
  }
  .weui-cells {
    margin-top: 0;
  }
  .weui-cells:before {
    display: none;
  }
  .weui-cells:after {
    display: none;
  }
  .weui-cell {
    padding: 16px 0;
  }
  .df-cell {
    padding: 0 16px;
    position: relative;
    border-bottom: 1px solid #eee;
  }
  .df-flex {
    justify-content: space-between;
  }
  .df-title-placeholder {
    width: 100vw;
    height: 16px;
    transform: translateX(-16px);
    background-color: #f5f5f5;
  }
  .df-cell-hd {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .df-title-icon {
    display: block;
    min-width: 18px;
    min-height: 18px;
    margin-right: 8px;
    background-image: url("../assets/img/icon_tianxie@2x.png");
    background-size: 100%;
  }
  .df-title {
    font-size: 18px;
    font-weight: 500;
  }
  .df-cell-bd {
    min-width: 80px;
  }
  .finished>.form-status-text {
    color: #11d08b;
    font-size: 12px;
  }
  .unfinished>.form-status-text {
    color: #ffa149;
    font-size: 12px;
  }
  .finished>.form-status-icon {
    display: inline-block;
    width: 12px;
    height: 12px;
    margin: 0 2px;
    background-image: url("../assets/img/jd_yitw@2x.png");
    background-size: 100%;
    vertical-align: middle;
  }
  .unfinished>.form-status-icon {
    display: inline-block;
    width: 12px;
    height: 12px;
    margin: 0 2px;
    background-image: url("../assets/img/jd_weitw@2x.png");
    background-size: 100%;
    vertical-align: middle;
  }
  .form-expand-icon-expand {
    display: inline-block;
    width: 16px;
    height: 16px;
    margin: 0 4px;
    background-image: url("../assets/img/icon_jiantou_xia@2x.png");
    background-size: 100%;
    vertical-align: middle;
  }
  .form-expand-icon-collapse {
    display: inline-block;
    width: 16px;
    height: 16px;
    margin: 0 4px;
    background-image: url("../assets/img/icon_jiantou@2x.png");
    background-size: 100%;
    vertical-align: middle;
  }
  .weui-label {
    font-size: 16px;
    width: 100%;
  }
  .weui-input,.weui-textarea {
    font-size: 14px;
    font-family: "Microsoft YaHei","微软雅黑","PingFang SC","Helvetica Neue",Helvetica,"Hiragino Sans GB",Arial,sans-serif;
  }
  .is-required:before {
    content: "*";
    color: red;
    margin-right: 4px;
  }
  .df-text-item {
    margin: 8px;
    font-size: 14px;
  }
  .df-item-tip {
    display: block;
    line-height: 16px;
    position: relative;
    margin: 4px 0;
    padding-top: 0;
    color: #999;
    font-size: 12px;
  }
  .df-subTitle {
    margin: 16px;
    border: 1px solid #eee;
    border-radius: 4px;
  }
  .df-subTitle .df-cell {
    border-bottom: none;
  }
  .df-cell-inner {
    padding: 16px 0;
  }
  .df-input {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 8px;
    margin-top: 4px;
    overflow: hidden;
  }
  .grey {
    color: #ccc;
  }
  .valid>.df-small-flag {
    position: absolute;
    right: -29px;
    top: -10px;
    width: 60px;
    height: 10px;
    padding-top: 10px;
    font-size: 8px;
    font-weight: 900;
    color: white;
    text-align: center;
    background-color: #11d08b;
    transform: rotate(45deg) scaleX(-1);
  }
  .valid>.df-small-flag:before {
    content: 'L';
  }
  .invalid {
    border: 1px solid #ff5555;
  }
  .invalid>.df-small-flag {
    position: absolute;
    right: -31px;
    top: -12px;
    width: 60px;
    height: 14px;
    padding-top: 10px;
    font-size: 12px;
    font-weight: normal;
    color: white;
    text-align: center;
    background-color: #ff5555;
    transform: rotate(45deg);
  }
  .invalid>.df-small-flag:before {
    content: "+";
  }
  .df-error-tip {
    color: #ff5555;
    font-size: 12px;
  }
  .delete-button {
    float: right;
    font-size: 14px;
    color: #ff041f;
    min-width: 60px;
  }
  .df-del-icon {
    display: inline-block;
    width: 14px;
    height: 14px;
    margin: 0 4px;
    background-image: url("../assets/img/bianzu5@2x.png");
    background-size: 100%;
    vertical-align: -10%;
  }
  .df-link {
    color: #ffa149;
    font-size: 14px;
    min-width: 70px;
  }
  .df-help-icon {
    display: inline-block;
    width: 18px;
    height: 18px;
    margin: 0 4px;
    background-image: url("../assets/img/icon_jiaowoxuan@2x.png");
    background-size: 100%;
    vertical-align: -16%;
  }
  .df-item-wrapper {
    position: relative;
    overflow: hidden;
    margin: 8px 0;
    padding: 12px 16px;
    background-color: #f5f5f5;
    width: 100%;
    border-radius: 4px;
    word-break: break-all;
  }
  .weui-check:checked+.df-item-wrapper {
    background-color: #f3f7ff;
  }
  .df-item-label {
    font-size: 14px;
    color: black;
  }
  .weui-check:checked+.df-item-wrapper>p.df-item-label {
    color: #487fff;
  }
  .df-item-tip {
    font-size: 12px;
    color: #999;
  }
  .weui-check:checked+.df-item-wrapper>p.df-item-tip {
    color: rgba(72, 127, 255, .6);
  }
  .weui-check:checked+.df-item-wrapper>div.df-item-select {
    position: absolute;
    right: -29px;
    top: -10px;
    width: 60px;
    height: 10px;
    padding-top: 10px;
    font-size: 8px;
    font-weight: 900;
    color: white;
    text-align: center;
    background-color: #11d08b;
    transform: rotate(45deg) scaleX(-1);
  }
  .weui-check:checked+.df-item-wrapper>div.df-item-select:before {
    content: 'L';
  }
  .button-sample {
    min-width: 72px;
    height: 20px;
    background-color: #f0f4ff;
    border-radius: 2px;
    text-align: center;
    line-height: 20px;
  }
  .button-sample>span {
    font-size: 14px;
    color: #4672f6;
  }
  .title-subTitle {
    margin: 0 16px;
  }
  .first-child-content {
    color: #999;
  }
</style>

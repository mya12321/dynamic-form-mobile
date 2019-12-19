<template>
  <el-form class="d-form" :model="form.content" :label-position="form.schema.labelPosition" :label-width="form.schema.labelWidth" :rules="form.rule" :validate-on-rule-change="false" ref="form" status-icon @validate="validateBubble">
    <div v-for="item in form.schema.items" :key="item.id">
      <div class="upload-separate" v-if="item.type == 'upload'"></div>
      <el-form-item v-if="item.status !== 'hidden' && item.type != 'title' && item.type != 'text'" :prop="item.id" :ref="item.id" class="el-form-wrapper">
        <span slot="label">
          <span :class="item.labelClass || 'item-label'">{{item.label}}</span>
          <a class="item-link" v-if="item.link" :href="item.link.href">{{item.link.text}}</a>
        </span>
        <span v-if="!(item.type === 'title' || item.type === 'text') && item.tip" class="item-tip" :style="item.tipStyle">{{item.tip}}</span>
        <!--<el-input class="item-instance" v-if="item.type == 'input'" v-model="form.content[item.id]" :maxlength="item.noFocus ? 0 : -1" :readonly="item.noFocus || item.readOnly"-->
                  <!--:placeholder="item.status == 'disabled' ? '' : item.placeholder" :type="item.inputType" :autosize="item.autosize" :disabled="item.status == 'disabled'"-->
                  <!--@click.native="e => inputClick(e, item)" @mousedown.native="e => inputMouseDown(e, item)">-->
        <el-input class="item-instance" v-if="item.type === 'input'" v-model="form.content[item.id]" :readonly="item.readOnly" :placeholder="item.status == 'disabled' ? '' : item.placeholder"
                  :type="item.inputType" :autosize="item.autosize" :disabled="item.status === 'disabled'" @click.native="e => inputClick(e, item)">
        <div slot="append" v-if="item.unit">{{item.unit}}</div>
        </el-input>
        <el-radio-group class="item-instance" v-if="item.type == 'radio'" v-model="form.content[item.id]" :disabled="item.status == 'disabled'">
          <!--<div v-for="paramItem in item.items" :key="paramItem.id">-->
            <!--<el-radio :label="paramItem.value">{{paramItem.label}}</el-radio>-->
            <!--<div class="radio-item-tip" :style="paramItem.tipStyle">{{paramItem.tip}}</div>-->
          <!--</div>-->
          <div v-for="paramItem in item.items" :key="paramItem.id">
            <el-radio :label="paramItem.value">
              <div class="radio-item-tip" :style="paramItem.tipStyle">
                <span class="radio-item-label">{{paramItem.label}}</span>
                {{paramItem.tip}}
              </div>
            </el-radio>
          </div>
        </el-radio-group>
        <el-checkbox-group class="item-instance" v-if="item.type == 'checkbox'"
                           :value="form.content[item.id]" @input="checkboxChange(item.id, $event)"
                           :disabled="item.status == 'disabled'">
          <el-checkbox v-for="paramItem in item.items" :key="paramItem.id" :label="paramItem.value">{{paramItem.label}}</el-checkbox>
        </el-checkbox-group>
        <el-select class="item-instance" v-if="item.type == 'select'" v-model="form.content[item.id]"
                   :placeholder="item.status == 'disabled' ? '' : item.placeholder" :disabled="item.status == 'disabled'">
          <el-option  v-for="paramItem in item.items" :key="paramItem.id" :label="paramItem.label" :value="paramItem.value"></el-option>
        </el-select>
        <el-date-picker class="item-instance" v-if="item.type == 'date'" v-model="form.content[item.id]" :format="item.format" :value-format="item.format"
                   :placeholder="item.status == 'disabled' ? '' : item.placeholder" :disabled="item.status == 'disabled'" :editable="false" :ref="'date-' + item.id"></el-date-picker>
        <el-upload class="upload" v-if="item.type == 'upload'" :list-type="item.listType" multiple
                   :action="item.uploadUrl"
                   :accept="item.listType === 'text' ? '' : 'image/*'"
                   :file-list="form.content[item.id]"
                   :before-upload="file => item.handleCheck(item, file)"
                   :on-success="(res, file, fileList) => handleSuccess(item, res.body[0], file, fileList)"
                   :on-error="(err, file) => item.handleError(item, file, err)"
                   :on-preview="file => item.handlePreview(item, file)"
                   :before-remove="file => item.handleConfirm(item, file)"
                   :on-remove="file => handleRemove(item, file)"
                   :disabled="item.status == 'disabled'">
          <el-button v-if="item.listType=='text'" size="small" type="primary">点击上传</el-button>
          <!--<div v-if="item.listType=='text'" class="upload-file-icon"></div>-->
          <i v-else class="el-icon-plus"></i>
        </el-upload>
      </el-form-item>
      <div v-else-if="item.type == 'title'" class="title-item">
        <div></div>
        <span class="title-span">{{item.text}}</span>
        <span v-if="item.link">
          <a class="item-link" :href="item.link.href">{{item.link.text}}</a>
        </span>
        <span v-if="item.status !== 'disabled'">
          <el-button v-for="button in item.items" :key="button.id" type="primary" size="mini" @click="button.click(item.id)">{{button.text}}</el-button>
        </span>
        <div class="item-tip-title" :style="item.tipStyle">{{item.tip}}</div>
      </div>
      <div v-else-if="item.type == 'text'" class="text-item" :style="item.style">
        <span v-html="item.text.replace(/\n/g, '<br/>')"></span>
      </div>
    </div>
    <slot name="footer"></slot>
    <div class="commit-area" v-if="form.schema.buttons && form.schema.buttons.length">
      <el-button v-for="button in form.schema.buttons" :key="button.id" type="primary" :round="button.round"
                 :plain="button.plain" @click="button.click(form)" :disabled="button.status == 'disabled'" class="commit-button">{{button.text}}</el-button>
    </div>
  </el-form>
</template>

<script>
import 'async-validator';

export default {
  name: 'dynamicForm',
  props: {
    schema: Object,
    content: Object,
    rule: Object,
  },
  data() {
    return {
      defaults: {
        schema: {
          status: 'edit',
          labelPosition: 'top',
          labelWidth: '50px',
          inline: false,
          buttons: [],
          items: [],
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
    };
  },
  computed: {
    form() {
      let newSchema = Object.assign({}, this.defaults.schema, this.schema);
      let itemSchema = newSchema.items.map(item => {
        if (!item.type) {
          item.type = 'input';
        }
        let defaultItem = this.defaults[item.type];
        defaultItem.status = newSchema.status;
        let newItem = Object.assign({}, defaultItem, item);
        if (newItem.items) {
          newItem.items.map(paramItem => {
            let defaultParamItem = this.defaults[newItem.type + 'Item'];
            return Object.assign({}, defaultParamItem, paramItem);
          });
        }
        return newItem;
      });
      newSchema.items = itemSchema;
      this.$nextTick(() => {
        document.querySelectorAll('.el-upload-list--picture-card').forEach(ul => {
          ul.removeEventListener('click', this.listener);
          ul.addEventListener('click', this.listener);
        });
      });
      return {
        schema: newSchema,
        content: this.content,
        rule: this.rule,
      };
    },
  },
  mounted() {

  },
  methods: {
    generateHash(str) {
      return str.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
    },
    handleSuccess(item, res, file, fileList) {
      let index = fileList.findIndex(each => each.uid === file.uid);
      this.form.content[item.id][index] = {
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
      let index = this.form.content[item.id].findIndex(each => each.uid === file.uid);
      this.form.content[item.id].splice(index, 1);
      if (typeof item.handleRemove === 'function') {
        item.handleRemove(item, file, index);
      }
      this.$refs[item.id][0].$emit('el.form.change');
    },
    validate(callback) {
      this.$refs.form.validate(callback);
    },
    checkboxChange(id, list) {
      this.$set(this.form.content, id, list.sort((a, b) => {
        let params = this.form.schema.items.find(each => each.id === id).items;
        return params.findIndex(each => each.value === a) - params.findIndex(each => each.value === b);
      }));
    },
    listener(e) {
      let target = e.target;
      if (target.nodeName.toLowerCase() === 'img') {
        // eslint-disable-next-line
        this.imgPreviewUl = target.parentElement.parentElement;
        target.nextSibling.click();
      }
    },
    deleteImg(index) {
      this.imgPreviewUl.querySelector(`li:nth-child(${index + 1})>i.el-icon-close`).click();
    },
    getImg(index) {
      return this.imgPreviewUl.querySelector(`li:nth-child(${index + 1})>img`);
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
    validateBubble() {
      this.$emit('validate', ...arguments);
    },
  },
  watch: {
    'form.content': {
      handler(val) {
        let temp = Object.assign({}, val);
        this.$emit('change', this.contentCopy, val);
        this.contentCopy = temp;
      },
      deep: true,
    },
  },
}
</script>

<style scoped>
  .d-form {
    position: relative;
    overflow: visible;
    box-sizing: border-box;
    padding-bottom: 65px;
    min-height: calc(100vh - 140px);
  }
  .item-label {
    display: inline-block;
  }
  .item-link {
    display: inline-block;
    margin-left: 20px;
    font-size: 14px;
    font-weight: 100;
    color: #0589FF;
    line-height: 20px;
    vertical-align: bottom;
    max-width: 100px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .title-item {
    position: relative;
    background-color: #f5f5f5;
    min-height: 50px;
    line-height: 20px;
    font-size: 14px;
    padding: 0 8px;
  }
  .title-item div:first-child {
    position: absolute;
    left: 0;
    top: 25px;
    height: 20px;
    border-left: 2px solid black;
    border-right: 2px solid black;
    border-radius: 2px;
  }
  .title-item>.title-span {
    display: inline-block;
    margin: 25px 2px 0;
    max-width: 250px;
    text-overflow: ellipsis;
    color: #000;
    font-size: 16px;
    font-weight: 900;
  }
  .title-item button {
    float: right;
    margin: 24px 5px 0;
    padding: 4px 0;
    width: 55px;
    border-radius: 10px;
  }
  .text-item {
    margin: 8px;
    font-size: 14px;
  }
  .el-form-wrapper {
    padding: 0 15px;
    margin: 15px 0 22px;
  }
  .el-form-wrapper >>> .el-form-item__label {
    margin: 2px 0;
    font-size: 14px;
    color: #000;
    line-height: 20px;
    padding-bottom: 0px!important;
  }
  .item-tip {
    display: block;
    line-height: 16px;
    position: relative;
    padding-top: 0;
    color: red;
    font-size: 12px;
  }
  .item-instance {
    width: 100%;
  }
  .item-instance >>> label.el-radio {
    display: block;
    margin-top: 13px;
    position: relative;
  }
  .item-instance >>> .el-radio__input {
    position: absolute;
    top: 3px;
  }
  .item-instance >>> .el-radio__label {
    display: inline-block;
    max-width: 270px;
    white-space: normal;
    margin-left: 16px;
    padding-left: 8px;
    word-wrap: break-word;
  }
  .item-instance >>> label.el-checkbox {
    margin: 0 30px 0 0;
  }
  .item-instance >>> .is-checked>.el-radio__inner {
    background: none;
    border-color: #4672F6;
  }
  .item-instance >>> .is-checked>.el-radio__inner::after {
    width: 7px;
    height: 7px;
    background-color: #4672F6;
  }
  .item-instance >>> .is-checked>.el-checkbox__inner {
    background-color: #4672F6;
  }
  .item-instance >>> .is-checked>.el-checkbox__inner::after {
    width: 4px;
    height: 8px;
    border: 2px solid #fff;
    left: 3px;
    top: 0;
    border-left: 0;
    border-top: 0;
    background-color: #4672F6;
  }
  .item-instance >>> .el-radio__input.is-checked+.el-radio__label {
    color: #4672F6;
  }
  .item-instance >>> .el-checkbox__input.is-checked+.el-checkbox__label {
    color: #4672F6;
  }
  .commit-area {
    display: flex;
    flex-grow: 1;
    justify-content: space-evenly;
    width: 100%;
    height: 70px;
    padding: 15px 0;
    box-sizing: border-box;
    position: fixed;
    bottom: 0;
    left: 0;
    z-index: 10;
    background-color: #f5f5f5;
  }
  .commit-area button {
    flex: 1;
    margin: 0 10px;
    border-radius: 20px;
  }
  .el-form-wrapper >>> .el-input.is-disabled .el-input__inner {
    color: #666;
    opacity: 1;
  }
  .el-form-wrapper >>> .el-radio__input.is-disabled+span.el-radio__label {
    color: #666;
    opacity: 1;
  }
  .el-form-wrapper >>> .el-checkbox__input.is-disabled+span.el-checkbox__label {
    color: #666;
    opacity: 1;
  }
  /*.upload-file-icon {*/
    /*display: inline-block;*/
    /*vertical-align: middle;*/
    /*background-image: url("../assets/img/yulan.svg");*/
    /*background-size: 20px 20px;*/
    /*width: 20px;*/
    /*height: 20px;*/
  /*}*/
  .upload-separate {
    width: 100%;
    height: 20px;
    background-color: #f5f5f5;
  }
  .item-tip-title {
    line-height: 16px;
    margin-left: 3px;
    color: red;
    font-size: 12px;
  }
  .upload >>> .el-upload-list__item-actions {
    display: none;
  }
  .item-instance.is-disabled >>> .el-textarea__inner,.item-instance.is-disabled >>> .el-input__inner {
    color: #555;
    -webkit-text-fill-color: #555;
    -webkit-opacity: 1;
  }
  .radio-item-tip {
    display: inline-block;
    max-width: 270px;
    word-wrap: break-word;
    font-size: 12px;
    line-height: 21px;
    color: red;
  }
  .radio-item-label {
    font-size: 14px;
    color: #000;
    margin-right: 8px;
  }
</style>
<style>
  ul.el-select-dropdown__list {
    max-width: 95vw;
  }
</style>

<template>
  <div class="wrapper">
    <!--<div class="weui-gallery" :id="`${item.id}-gallery`">-->
      <!--<span class="weui-gallery__img" :id="`${item.id}-galleryImg`"></span>-->
      <!--<div class="weui-gallery__opr">-->
        <!--<a href="javascript:" class="weui-gallery__del">-->
          <!--<i class="weui-icon-delete weui-icon_gallery-delete"></i>-->
        <!--</a>-->
      <!--</div>-->
    <!--</div>-->
    <div class="weui-cells weui-cells_form" :id="`${item.id}-uploader`" v-if="item.listType === 'picture-card'">
      <div class="weui-cell">
        <div class="weui-cell__bd">
          <div class="weui-uploader">
            <div class="weui-uploader__hd">
              <div class="df-flex">
                <div :class="['weui-uploader__title', item.isRequired ? 'is-required' : '']">{{item.label}}</div>
                <div class="button-sample" v-if="item.sample" @click="item.sample.click(item.sample)">
                  <span>查看样本</span>
                </div>
              </div>
            </div>
            <div v-if="item.tip" class="df-item-tip" :style="item.tipStyle">{{item.tip}}</div>
            <div class="weui-uploader__bd">
              <ul class="weui-uploader__files" :id="`${item.id}-uploaderFiles`">
                <!--<li class="weui-uploader__file" v-for="file in content[item.id]" :key="file.id" :style="`background-image:url(${file.url})`" @click="preview(file)">-->
                <li class="weui-uploader__file" v-for="file in content[item.id]" :key="file.uid" @click="preview(file)">
                  <img width="96" height="96" :src="file.url" />
                </li>
                <div :id="`${item.id}-loading`" style="display: inline;"></div>
              </ul>
              <div class="weui-uploader__input-box">
                <input :id="`${item.id}-uploaderInput`" class="weui-uploader__input " type="file" accept="image/*" multiple/>
              </div>
            </div>
            <div class="df-error-tip"></div>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <div class="weui-cell">
        <div class="weui-cell__hd df-cell-hd">
          <label :class="['weui-label', item.isRequired ? 'is-required' : '']">{{item.label}}</label>
          <div>
            <div class="button-sample" v-if="item.sample" @click="item.sample.click(item.sample)">
              <span>查看样本</span>
            </div>
          </div>
        </div>
      </div>
      <div v-if="item.tip" class="df-item-tip" :style="item.tipStyle">{{item.tip}}</div>
      <div>
        <div class="attach-file" v-if="!content[item.id].length">
          <div class="attach-icon" style="background-color: #ccc;">
            <span>?</span>
          </div>
          <span style="color: #ccc;">请使用电脑端上传附件</span>
        </div>
        <div class="attach-file" v-for="file in content[item.id]" :key="file.id">
          <i :class="iconClassMap[file.suffix]" v-if="iconClassMap[file.suffix]"></i>
          <div class="attach-icon" v-else>
            <span>{{file.suffix.charAt(1).toUpperCase()}}</span>
          </div>
          <span>{{file.name}}</span>
        </div>
      </div>
      <div class="df-error-tip"></div>
    </div>
  </div>
</template>

<script>
  import weui from 'weui.js';
  // import $ from 'zepto';
  // import 'zepto/src/fx.js';
  // import 'zepto/src/fx_methods.js';

  export default {
    name: 'UploadItem',
    props: {
      item: Object,
      content: Object,
    },
    data() {
      return {
        fileList: [],
        iconClassMap: {
          '.pdf': 'icon-pdf',
          '.doc': 'icon-doc',
          '.docx': 'icon-doc',
          '.xls': 'icon-xls',
          '.xlsx': 'icon-xls',
        },
      };
    },
    mounted() {
      let vm = this;
      weui.uploader(`#${this.item.id}-uploader`, {
        url: `${this.baseUrl}/api/file/form/user_matter`,
        compress: false,
        onBeforeQueued: function() {
          if (typeof vm.item.handleCheck === 'function') {
            let uid = vm.generateId();
            this.uid = uid;
            return vm.item.handleCheck(vm.item, this);
          }
        },
        onQueued: function() {
          vm.fileList.push(this);
          let pendingEle = document.createElement('li');
          pendingEle.className = 'weui-uploader__file weui-uploader__file_status';
          pendingEle.innerHTML = '<div class="weui-uploader__file-content"><i class="weui-loading" style="width: 30px;height: 30px;"></i></div>';
          document.querySelector(`#${vm.item.id}-loading`).append(pendingEle);
        },
        onSuccess: function(ret) {
          let file = this;
          let index = vm.fileList.findIndex(each => each === file);
          if (index > -1) {
            let parrent = document.querySelector(`#${vm.item.id}-loading`);
            let li = document.querySelector(`#${vm.item.id}-loading>li`);
            vm.fileList[index] = undefined;
            parrent.removeChild(li);
            let name = ret.body[0].name ? ret.body[0].name : ret.body[0].url.substr(file.url.lastIndexOf('/') + 1);
            let result = {
              uid: file.uid,
              url: file.url,
              name: name,
              serverUrl: ret.body[0].url,
              suffix: name.slice(name.lastIndexOf('.')),
            };
            if (ret.body[0].rotate) {
              result.rotate = ret.body[0].rotate;
            }
            vm.content[vm.item.id].push(result);
            vm.$emit('change');
            return vm.item.handleSuccess(vm.item, this);
          }
        },
        onError: function(err) {
          return vm.item.handleError(vm.item, this, err);
        }
      });
    },
    methods: {
      generateId() {
        let newId;
        if (Object.prototype.toString.call(window.globalUniqueId) !== '[object Set]') {
          window.globalUniqueId = new Set();
        }
        do {
          newId = 'd' + Math.floor(Math.random() * (1<<30)).toString(36);
        } while (window.globalUniqueId.has(newId));
        window.globalUniqueId.add(newId);
        return newId;
      },
      // preview(file) {
      //   let gallery = weui.gallery(file.url, {
      //     onDelete: () => {
      //       this.$confirm('确定删除该图片?').then(() => {
      //         let index = this.content[this.item.id].findIndex(each => each === file);
      //         if (index > -1) {
      //           this.content[this.item.id].splice(index, 1);
      //           if (typeof this.item.handleRemove === 'function') {
      //             this.item.handleRemove(this.item);
      //           }
      //           this.$emit('change');
      //           gallery.hide();
      //         }
      //       });
      //     },
      //   });
      // },
      preview(file) {
        this.item.handlePreview(this.item, file);
      },
    },
  };
</script>

<style scoped>
  .wrapper {
    padding: 16px 0;
  }
  .weui-uploader__files >>> .weui-uploader__file{
    float:left;
    margin-right:8px;
    margin-bottom:8px;
    width:96px;
    height:96px;
    background:no-repeat center center;
    background-size:cover;
    overflow: hidden;
  }
  .list-block ul ul {
    padding-left: 0;
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
  .weui-uploader__hd {
    padding-bottom: 0;
  }
  .df-error-tip {
    color: #ff5555;
    font-size: 12px;
  }
  .is-required:before {
    content: "*";
    color: red;
    margin-right: 4px;
  }
  .weui-cells {
    margin-bottom: 8px;
  }
  .weui-cell {
    padding: 8px 0;
    background-color: white!important;
  }
  .weui-cells:before,.weui-cells:after {
    border: 0;
    height: 0;
  }
  .weui-uploader__hd {
    margin-bottom: 8px;
  }
  .df-flex {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
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
  .attach-file {
    display: flex;
    padding: 16px;
    background-color: #f5f5f5;
    border-radius: 4px;
    margin: 8px 0;
  }
  .attach-file>span {
    font-size: 14px;
    color: #000;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 32px;
  }
  .attach-icon {
    display: inline-block;
    min-width: 32px;
    min-height: 32px;
    margin-right: 8px;
    background-color: #333;
    text-align: center;
  }
  .attach-icon>span {
    color: white;
    font-size: 24px;
    line-height: 32px;
  }
  .icon-pdf {
    display: inline-block;
    width: 32px;
    height: 32px;
    margin-right: 8px;
    background: url("../assets/img/my_wdwj_pdf@2x.png");
    background-size: 100%;
  }
  .icon-doc {
    display: inline-block;
    width: 32px;
    height: 32px;
    margin-right: 8px;
    background: url("../assets/img/my_wdwj_doc@2x.png");
    background-size: 100%;
  }
  .icon-xls {
    display: inline-block;
    width: 32px;
    height: 32px;
    margin-right: 8px;
    background: url("../assets/img/my_wdwj_xlsx@2x.png");
    background-size: 100%;
  }
  .df-cell-hd {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
  .weui-label {
    font-size: 16px;
    width: 100%;
  }
</style>
<style>
  div.weui-gallery__opr {
    bottom: 0;
    width: 100%;
  }
  span.weui-gallery__img {
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
  }
</style>

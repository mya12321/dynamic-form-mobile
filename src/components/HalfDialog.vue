<template>
  <div>
    <div class="js_dialog" id="halfDialog" style="display: none;">
      <div class="weui-mask" @click="hide"></div>
      <div id="js_half_dialog" class="weui-half-screen-dialog">
        <div class="weui-half-screen-dialog__hd">
          <div class="weui-half-screen-dialog__hd__main">
            <strong class="weui-half-screen-dialog__title">{{title}}</strong>
          </div>
          <div class="weui-half-screen-dialog__hd__side">
            <button class="weui-icon-btn weui-icon-btn_close" @click="hide">关闭</button>
          </div>
        </div>
        <div class="weui-half-screen-dialog__bd">
          <div v-html="content"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import $ from 'zepto';
  import 'zepto/src/fx.js';
  import 'zepto/src/fx_methods.js';

  export default {
    name: 'HalfDialog',
    data() {
      return {
        title: '',
        content: '',
      };
    },
    methods: {
      show(options) {
        this.title = options.title;
        this.content = options.content;
        $('#halfDialog').fadeIn(200);
        $('#js_half_dialog').addClass('weui-half-screen-dialog_show');
      },
      hide() {
        $('#halfDialog').fadeOut(200);
        $('#js_half_dialog').removeClass('weui-half-screen-dialog_show');
      },
    },
  };
</script>

<style scoped>
  .weui-half-screen-dialog__bd {
    margin-bottom: 35px;
    max-height: 60vh;
    overflow-x: hidden;
    overflow-y: auto;
  }
  .js_dialog {
    position: absolute;
    z-index: 999;
  }
</style>

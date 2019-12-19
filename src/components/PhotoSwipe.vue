<template>
  <!-- Root element of PhotoSwipe. Must have class pswp. -->
  <div class="pswp" tabindex="-1" role="dialog" aria-hidden="true">
    <!-- Background of PhotoSwipe.
         It's a separate element as animating opacity is faster than rgba(). -->
    <div class="pswp__bg"></div>
    <!-- Slides wrapper with overflow:hidden. -->
    <div class="pswp__scroll-wrap">
      <!-- Container that holds slides.
          PhotoSwipe keeps only 3 of them in the DOM to save memory.
          Don't modify these 3 pswp__item elements, data is added later on. -->
      <div class="pswp__container">
        <div class="pswp__item"></div>
        <div class="pswp__item"></div>
        <div class="pswp__item"></div>
      </div>
      <!-- Default (PhotoSwipeUI_Default) interface on top of sliding area. Can be changed. -->
      <div class="pswp__ui pswp__ui--hidden">
        <div class="pswp__top-bar">
          <!--  Controls are self-explanatory. Order can be changed. -->
          <div class="pswp__counter"></div>
          <button class="pswp__button pswp__button--close" title="Close (Esc)"></button>
          <button class="pswp__button pswp__button--share" title="Share"></button>
          <button class="pswp__button pswp__button--fs" title="Toggle fullscreen"></button>
          <button class="pswp__button pswp__button--zoom" title="Zoom in/out"></button>
          <button class="pswp__button pswp__button--rotation--right" v-if="!options.isPreview" @touchstart="rotateRight"></button>
          <button class="pswp__button pswp__button--rotation--left" v-if="!options.isPreview" @touchstart="rotateLeft"></button>
          <button class="pswp__button pswp__button--delete" v-if="!options.isPreview" @touchstart="deleteFunc"></button>
          <!-- Preloader demo https://codepen.io/dimsemenov/pen/yyBWoR -->
          <!-- element will get class pswp__preloader--active when preloader is running -->
          <div class="pswp__preloader">
            <div class="pswp__preloader__icn">
              <div class="pswp__preloader__cut">
                <div class="pswp__preloader__donut"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="pswp__share-modal pswp__share-modal--hidden pswp__single-tap">
          <div class="pswp__share-tooltip"></div>
        </div>
        <button class="pswp__button pswp__button--arrow--left" title="Previous (arrow left)">
        </button>
        <button class="pswp__button pswp__button--arrow--right" title="Next (arrow right)">
        </button>
        <div class="pswp__caption">
          <div class="pswp__caption__center"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import PhotoSwipe from 'photoswipe';
  import PhotoSwipeUI_Default from 'photoswipe/dist/photoswipe-ui-default';
  import 'photoswipe/dist/photoswipe.css';
  import 'photoswipe/dist/default-skin/default-skin.css';
  import Vue from 'vue';

  export default {
    name: 'photoSwipe',
    props: {
    },
    data() {
      return {
        imgList: [],
        options: {},
        defaultOptions: {
          index: 0,
          fullscreenEl: false,
          shareEl: false,
          isPreview: false,
        },
        gallery: {},
      };
    },
    mounted() {
    },
    methods: {
      show(data) {
        this.imgList = data.imgList;
        this.options = data.options;
        let pswpElement = document.querySelector('.pswp');
        let items = this.imgList;
        let options = Object.assign({}, this.defaultOptions, this.options);
        this.gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);
        this.gallery.init();
        if (Object.prototype.toString.call(this.options.onClose) === '[object Function]') {
          this.gallery.listen('close', () => this.options.onClose(this.gallery.items));
        }
      },
      close() {
        this.gallery.close();
      },
      deleteFunc(e) {
        e.preventDefault();
        if (Object.prototype.toString.call(this.options.deleteImg) === '[object Function]') {
          this.options.deleteImg(this.gallery.getCurrentIndex()).then(this.removeCurrent);
        }
      },
      removeCurrent() {
        let length = this.gallery.items.length;
        let index = this.gallery.getCurrentIndex();
        if (length === 1) {
          this.gallery.items = [];
          this.close();
        } else {
          if (index === length - 1) {
            this.gallery.prev();
          }
          this.gallery.items.splice(index, 1);
          this.gallery.invalidateCurrItems();
          this.gallery.updateSize(true);
        }
      },
      rotateLeft(e) {
        e.preventDefault();
        this.rotateImg(270);
      },
      rotateRight(e) {
        e.preventDefault();
        this.rotateImg(90);
      },
      rotateImg(deg) {
        let container = this.gallery.currItem.container;
        let originImg = container.querySelector('img');
        let width = originImg.naturalWidth;
        let height = originImg.naturalHeight;
        let origin = new RegExp('^https?://[\\w-.]+(:\\d+)?', 'i').exec(originImg.src);
        let img;
        let startRotation = () => {
          let loading = Vue.prototype.$loading('正在加载');
          let cvs = this.getCanvas(height, width);
          let ctx = cvs.getContext('2d');
          ctx.save();
          let dx = 0;
          let dy = 0;
          if (deg === 90) {
            dy = -height;
          } else if (deg === 270) {
            dx = -width;
          }
          ctx.rotate(deg * Math.PI / 180);
          ctx.drawImage(img, dx, dy);
          ctx.restore();
          let time = (new Date).getTime();
          let dataUrl = cvs.toDataURL('image/jpeg', 0.5);
          // cvs.toBlob(blob => {
          //   console.log((new Date).getTime() - time);
          //   let dataUrl = URL.createObjectURL(blob);
          //   let currDeg = this.gallery.currItem.deg | 0;
          //   this.gallery.currItem.deg = (currDeg + deg) % 360;
          //   if (this.gallery.currItem.src.includes('http')) {
          //     this.gallery.currItem.originSrc = this.gallery.currItem.src;
          //   }
          //   this.gallery.currItem.src = dataUrl;
          //   this.gallery.currItem.w = height;
          //   this.gallery.currItem.h = width;
          //   this.gallery.invalidateCurrItems();
          //   this.gallery.updateSize(true);
          // }, 'image/jpeg', 0.5);
          console.log((new Date).getTime() - time);
          let currDeg = this.gallery.currItem.deg | 0;
          this.gallery.currItem.deg = (currDeg + deg) % 360;
          if (this.gallery.currItem.src.includes('http')) {
            this.gallery.currItem.originSrc = this.gallery.currItem.src;
          }
          this.gallery.currItem.src = dataUrl;
          this.gallery.currItem.w = height;
          this.gallery.currItem.h = width;
          this.gallery.invalidateCurrItems();
          this.gallery.updateSize(true);
          loading.close();
        };
        if (originImg.src.startsWith('data:') || originImg.src.startsWith('blob:') || (origin.length && origin[0] === location.origin)) {
          img = originImg;
          startRotation();
        } else {
          Vue.prototype.$loading('正在加载');
          img = new Image();
          img.crossOrigin = 'Anonymous';
          img.src = originImg.src;
          img.onload = startRotation;
        }
      },
      getCanvas(width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
      },
    },
  };
</script>

<style>
  .pswp .pswp__button--rotation--left,.pswp .pswp__button--rotation--right,.pswp .pswp__button--delete{background-position: center; background-size: auto; background-repeat: no-repeat;}
  .pswp .pswp__button--rotation--left{background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAASBJREFUeNqk00FLAkEYxnFHuwidypQ6eOkcgVcvWtkp7CiiR+ki9AUEP0mIXf0A1SUkhEAkwnOGQaghCtJF8OD2f2UWh0Fpy4Hfws7su+8y86xyHMe3yfCvmNvGNZ4whnTooYY0lPmwsr7gDLc4wCseMEEIp4jhGTl8LCrkBVoaM7wjacybEvhEH4eL5lwqOMc3OoisKXbto4smlEy86c5TXP1S7JKGMjJy03CWY46Cx5e0cS+n8KU3sIML3Hg8wTqO/bqwjCPc/SECQ+xucSlh/o8MhSUnaoMkttH3edwwW0pvetZeiCPsMQctBMyFHQx1EhNrik90EgduEu09SKKKKF7wiBH2rH8hj679L7iCKKKOiU6pdK3hUuJrPv8jwAASlMcqHuTzOgAAAABJRU5ErkJggg==);}
  .pswp .pswp__button--rotation--right{background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAASVJREFUeNqk079LQlEUwHFftgQJgmUQDYZrS9RUSxZIINgobg46CW79B/4Z0VSLf0ANURI0BIqDa9qg+ANNiJaowdv30L1mF6T38sLnwj1wDue9e66jlPLNsxass4MkSuhAqo9wjwKW7QLOVAcRXGIPNdziBUEcYxtdZHAzqSAFEEUPbcR0zCbxJj6RNHHZpItHnbwxI9lYQwNviONcgin1veJ/JBs5vOtOniRwhbrL5CzG6mc9yC3s4s7lrZ0hgYY+9xfZVjHwcPXX2MIpAlJgiLDH+flAUeZIPqGK2D8HcSw/Ju3xFn6RzY+KyzlYx75dwJ7EwxnJB3jGACETn34Lm7iw3oL84BUcYQct/RbK9lswpOAJSrobmbZXlJHHkt3ZlwADAIU7w8u5QDXSAAAAAElFTkSuQmCC);}
  .pswp .pswp__button--delete{background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAACvSURBVDhPpZJBDoMgEEWh6Q28KRfwDuw5BEdgQROWnMQVC5BIp/0E21CJsS8RnnE+gwpnHaWUaoxx/qPgC6o2xsCVUp9hcMc0z/M0TXDvvZSSJIRAI3xZFqohqR37lXqwvdd1phrsr0R9BzF65JyD3zBhuwRi27ZB2iopJUgNnOdqIOcMOWJdV8jVDjFGyBF/d2gLWGtpfLxpt0T7rBUhxPjHaa3h++kdBIh6KBh7Akg8ZPlano34AAAAAElFTkSuQmCC);}
  .weui-mask_transparent {
    z-index: 2000;
  }
</style>

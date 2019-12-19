export default {
    name: 'SamplePreview',

    data() {
        return {
            sampleData: {},
            iframeWrapper: {},
            iconClassMap: {
              '.pdf': 'icon-pdf',
              '.doc': 'icon-doc',
              '.docx': 'icon-doc',
              '.xls': 'icon-xls',
              '.xlsx': 'icon-xls',
            },
        }
    },

    mounted() {
        // 根据路由传递过来的参数设置sampleData
        this.sampleData = this.$route.query;
        if (this.sampleData.swatchUrl) {
          this.sampleData.swatchUrl = this.sampleData.swatchUrl.replace(/^https?:/, location.protocol);
        }
        if (this.sampleData.fileName) {
          this.sampleData.suffix = this.sampleData.fileName.slice(this.sampleData.fileName.lastIndexOf('.'));
        }
        document.domain = 'fuwugongshe.com';
    },

    methods: {
        /*
         * 下载附件
        */
        downloadFile(url) {
            wx.miniProgram.postMessage({ url: url })
        },


      loadIframe() {
        let iframe = this.$refs.iframe;
        let width = Math.max(iframe.contentDocument.documentElement.scrollWidth, iframe.contentDocument.body.scrollWidth);
        let height = Math.max(iframe.contentDocument.documentElement.scrollHeight, iframe.contentDocument.body.scrollHeight);
        iframe.width = width;
        iframe.height = height;
        if (iframe.clientWidth > document.documentElement.clientWidth - 32) {
          let scale = (document.documentElement.clientWidth - 32) / iframe.clientWidth;
          iframe.style.transformOrigin = 'top left';
          iframe.style.transform = `scale(${scale})`;
          this.iframeWrapper = {
            overflow: 'hidden',
            width: 'calc(100vw - 32px)',
            height: parseInt(iframe.height * scale) + 'px',
          };
        } else {
          iframe.width = '100%';
        }
      },
      goto(url) {
        console.log(url);
        location.href = url;
      },
      download() {
        let data = {
          name: this.sampleData.fileName,
          url: this.sampleData.filePath.replace(/^https?:/, location.protocol),
          matterName: this.sampleData.matterName,
        };
        if (window.__wxjs_environment || navigator.userAgent.includes("miniProgram")) {
          wx.miniProgram.navigateTo({url: `/pages/downloadFile/downloadFile?data=${JSON.stringify(data)}`});
        } else if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
          window.webkit.messageHandlers.downloadFile.postMessage({
            "downloadFile": JSON.stringify(data)
          });
        } else {
          native.download(JSON.stringify(data));
        }
      },
    },
};

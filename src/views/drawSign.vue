<template>
  <div>
    <HeaderSteps v-if="isVerify" :steps="steps" :activeIndex="activeIndex"></HeaderSteps>
    <div class="signArea">
      <canvas ref="canvas"></canvas>
    </div>
    <div class="buttonArea">
      <el-button type="primary" @click="clear">清空</el-button>
      <el-button type="primary" @click="save">确定</el-button>
    </div>
  </div>
</template>

<script>
  import Draw from '../plugins/draw.js';
  import HeaderSteps from '@/components/HeaderSteps';

  export default {
    name: 'DrawSign',
    data() {
      return {
        userMatterItemId: 0,
        draw: {},
        isVerify: false,
        steps: [],
        activeIndex: 0,
      };
    },
    props: ['matterId', 'userMatterId'],
    components: {
      HeaderSteps
    },
    mounted() {
      this.userMatterItemId = parseInt(this.$route.query.userMatterItemId);
      if (this.$route.query.verifyStatus) {
        this.isVerify = true;
        if (this.$route.query.h5Verify) {
          this.steps = [
            {
              iconClass: 'huoti',
              title: '活体检测',
            },
            {
              iconClass: 'qianming',
              title: '签名录入',
            },
          ];
          this.activeIndex = 1;
        } else {
          this.steps = [
            {
              iconClass: 'shiming',
              title: '实名认证',
            },
            {
              iconClass: 'huoti',
              title: '活体检测',
            },
            {
              iconClass: 'qianming',
              title: '签名录入',
            },
          ];
          this.activeIndex = 2;
        }
      }
      this.$emit('flowVisibleChange', false);
      this.$nextTick(() => this.draw = new Draw(this.$refs.canvas));
      this.$post('api/user/tree/sign/url', {
        id: this.userMatterItemId,
        apiUrl: '',
      });
    },
    methods: {
      clear() {
        this.draw.clear();
      },
      upload() {
        const image = this.draw.getPNGImage();
        const blob = this.draw.dataURLtoBlob(image);
        return this.draw.upload(blob, this.baseUrl + '/api/file/form/user_matter');
      },
      save() {
        this.upload().then(({body}) => {
          this.$post('api/user/tree/sign/url', {
            id: this.userMatterItemId,
            apiUrl: body[0].url,
          }).then(() => {
            // document.title = '签名/实名';
            // this.$router.push({
            //   path: '/signAndVerifyInner',
            //   query: this.$route.query,
            // });
            if(window.__wxjs_environment || navigator.userAgent.includes("miniProgram")) {
              this.$router.back();
            } else{
              this.$router.replace({
                path: '/signAndVerifyInner',
                query: this.$route.query,
              });
            }
          });
        });
      }
    },
  };
</script>

<style>
  .sign-title {
    width: 90%;
    margin: 0 auto;
    padding: 20px 0;
    text-align: center;
  }
  .sign-title>img {
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: 100%;
  }
  .signArea {
    overflow: auto;
  }
  .signArea>canvas {
    display: block;
    width: 300px;
    height: 300px;
    margin: 10px auto 30px;
    border: 1px solid #ccc;
  }
  .buttonArea {
    display: flex;
    flex-grow: 1;
    justify-content: space-evenly;
    width: 100%;
    z-index: 10;
    padding: 15px 0;
    background-color: white;
  }
  .buttonArea>button {
    flex: 1;
    margin: 0 10px;
  }
</style>

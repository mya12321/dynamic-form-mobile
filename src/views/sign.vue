<template>
  <div>
    <div>
      <canvas class="signArea" ref="canvas"></canvas>
    </div>
    <div class="buttonArea">
      <el-button type="primary" @click="clear">清空</el-button>
      <el-button type="primary" @click="save">确定</el-button>
    </div>
  </div>
</template>

<script>
  import Draw from '../plugins/draw.js';

  export default {
    name: 'Sign',
    data() {
      return {
        draw: {},
      };
    },
    mounted() {
      let userMatterItemId = this.$route.query.userMatterItemId;
      this.draw = new Draw(this.$refs.canvas);
      if (userMatterItemId) {
        this.$post('api/user/tree/sign/url', {
          id: userMatterItemId,
          apiUrl: '',
        });
      }
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
          window.location.href = this.baseUrl + '/api/free/closeSign?imgUrl=' + encodeURIComponent(body[0].url);
        });
      }
    },
  };
</script>

<style>
  .signArea {
    display: block;
    width: 300px;
    height: 300px;
    margin: 50px auto;
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

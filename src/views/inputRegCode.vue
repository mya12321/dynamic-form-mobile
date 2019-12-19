<template>
  <div class="wrapper">
    <el-input class="input" placeholder="请输入推广码" v-model="regCode" :disabled="disabled" :autofocus="true"></el-input>
    <div class="tip">他人辅助办理时填写，用户自主办理可不填。保存成功后不可更改。</div>
    <el-button class="button" v-if="!disabled" type="primary" :disabled="!canCommit" @click="saveRegCode">保存</el-button>
    <el-button class="button" v-else type="primary" plain @click="back">返回</el-button>
  </div>
</template>

<script>
  export default {
    name: 'inputRegCode',
    props: ['matterId', 'userMatterId', 'matterName'],
    data() {
      return {
        regCode: '',
        disabled: false,
      };
    },
    computed: {
      canCommit() {
        return /^[0-9A-Z]{6}$/.test(this.regCode);
      },
    },
    mounted() {
      let query = this.$route.query;
      if (query.regCode) {
        this.regCode = query.regCode;
        this.disabled = true;
      }
      this.$emit('flowVisibleChange', false);
    },
    methods: {
      saveRegCode() {
        this.$post(`user/matter/regCode/${this.userMatterId}/${this.regCode}`).then(() => {
          document.title = this.matterName;
          this.$emit('regCodeChange', this.regCode);
          let query = {
            matterId: this.matterId,
            userMatterId: this.userMatterId,
          };
          // this.$router.push({
          //   path: '/matterTree',
          //   query: query,
          // });
          this.$router.replace({
            path: '/matterTree',
            query: query,
          });
        }).catch(() => {
          this.$message({
            message: '推广码错误',
            customClass: 'toast',
            duration: 2000,
          });
        });
      },
      back() {
        let query = {
          matterId: this.matterId,
          userMatterId: this.userMatterId,
        };
        this.$router.replace({
          path: '/matterTree',
          query: query,
        });
      },
    },
  };
</script>

<style scoped>
  .wrapper {
    background-color: #f5f5f5;
    height: 100vh;
  }
  .input {
    border: 0;
    margin: 10px 0;
  }
  .tip {
    margin: 6px 16px;
    color: #999;
    font-size: 13px;
  }
  .button {
    display: block;
    width: 90%;
    margin: 25vh auto 0;
    border-radius: 20px;
  }
</style>

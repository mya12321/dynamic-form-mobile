<template>
  <div></div>
</template>

<script>
  export default {
    name: 'SignPage',
    mounted() {
      let dataParams = this.$route.query;
      // const token = dataParams.token;
      // sessionStorage.setItem('token', token);
      document.title = '电子签名';
      let isVerify = dataParams.verifyStatus;
      if (isVerify) {
        this.$router.replace({
          path: '/drawSign',
          query: dataParams,
        });
      } else {
        this.$router.replace({
          path: '/signInner',
          query: dataParams,
        });
      }
    },
  }
</script>

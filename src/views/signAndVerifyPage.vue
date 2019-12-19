<template>
  <div></div>
</template>

<script>
  export default {
    name: 'SignAndVerifyPage',
    mounted() {
      let dataParams = this.$route.query;
      // const token = dataParams.token;
      // sessionStorage.setItem('token', token);
      document.title = '签名/实名';
      this.$router.replace({
        path: '/signAndVerifyInner',
        query: dataParams,
      });
    },
  }
</script>

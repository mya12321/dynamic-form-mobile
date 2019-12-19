<template>
  <div></div>
</template>

<script>
  export default {
    name: 'PreviewPage',
    mounted() {
      let dataParams = this.$route.query;
      // const token = dataParams.token;
      // sessionStorage.setItem('token', token);
      if (dataParams.matterId == 1430) {
        document.title = '永川区工业项目100天开工计划';
        let query = {
          matterId: dataParams.matterId,
          industrialId: dataParams.userMatterId,
        };
        this.$router.replace({
          path: '/matterGroupPreview',
          query: query,
        });
        return;
      }
      document.title = '预览';
      this.$router.replace({
        path: '/previewInner',
        query: dataParams,
      });
    },
  }
</script>

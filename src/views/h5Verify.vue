<template>
  <div>
    <HeaderSteps v-if="!hideHeader" :steps="steps" :activeIndex="activeIndex"></HeaderSteps>
    <iframe ref="iframe" frameborder="no" @load="iframeChange"></iframe>
  </div>
</template>

<script>
  import HeaderSteps from '@/components/HeaderSteps';

  export default {
    name: 'h5Verify',
    components: {
      HeaderSteps,
    },
    data() {
      return {
        steps: [
          {
            iconClass: 'huoti',
            title: '活体检测',
          },
          {
            iconClass: 'qianming',
            title: '签名录入',
          },
        ],
        activeIndex: 0,
        userMatterItemId: 0,
        hideHeader: false,
      };
    },
    props: ['matterId', 'userMatterId'],
    mounted() {
      let query = this.$route.query;
      this.userMatterItemId = query.userMatterItemId;
      if (query.hideHeader) {
        this.hideHeader = true;
      }
      let iframe = this.$refs.iframe;
      iframe.width = '100%';
      iframe.height = document.documentElement.clientHeight - 90;
      iframe.src = query.src;
      this.$emit('flowVisibleChange', false);
    },
    methods: {
      iframeChange() {
        let iDocument = this.$refs.iframe.contentDocument;
        if (iDocument && iDocument.location.href.includes('signAndVerify')) {
          if (this.hideHeader) {
            // let query = {
            //   matterId: this.matterId,
            //   userMatterId: this.userMatterId,
            // };
            this.$router.go(-2);
          } else {
            let query = {
              matterId: this.matterId,
              userMatterId: this.userMatterId,
              userMatterItemId: this.userMatterItemId,
              verifyStatus: true,
              h5Verify: true,
            };
            // this.$router.push({
            //   path: '/drawSign',
            //   query: query,
            // });
            this.$router.back();
            setTimeout(() => {
              this.$router.replace({
                path: '/drawSign',
                query: query,
              });
            }, 100);
          }
        }
      },
    },
  };
</script>

<style scoped></style>

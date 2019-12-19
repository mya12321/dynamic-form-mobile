import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)
let router = new Router({
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/matterWrapper',
      name: 'matterWrapper',
      component: () => import('@/views/matterWrapper.vue'),
      children: [
        {
          path: '/matterTree',
          name: 'matterTree',
          component: () => import('@/views/matterTree.vue')
        },
        {
          path: '/matterItem',
          name: 'matterItem',
          component: () => import('@/views/matterItem.vue')
        },
        {
          path: '/previewInner',
          name: 'preview',
          component: () => import('@/views/matterPreview.vue')
        },
        {
          path: '/signAndVerifyInner',
          name: 'signAndVerify',
          component: () => import('@/views/signAndVerify.vue')
        },
      ],
    },
    {
      path: '/signAndVerify',
      name: 'signAndVerifyPage',
      component: () => import('@/views/signAndVerifyPage.vue')
    },
    {
      path: '/sign',
      name: 'signPage',
      component: () => import('@/views/signPage.vue')
    },
    {
      path: '/signInner',
      name: 'sign',
      component: () => import('@/views/sign.vue')
    },
    {
      path: '/drawSign',
      name: 'drawSign',
      component: () => import('@/views/drawSign.vue')
    },
    {
      path: '/preview',
      name: 'previewPage',
      component: () => import('@/views/previewPage.vue')
    },
    {
      path: '/finish',
      name: 'finish',
      component: () => import('@/views/finish.vue')
    },
    {
      path: '/uploadAvatar',
      name: 'uploadAvatar',
      component: () => import('@/views/tempUploadAvatar.vue')
    },
    {
      path: '/matterGroup',
      name: 'matterGroup',
      component: () => import('@/views/matterGroup.vue')
    },
    {
      path: '/matterGroupDetail',
      name: 'matterGroupDetail',
      component: () => import('@/views/matterGroupDetail.vue')
    },
    {
      path: '/matterGroupPreview',
      name: 'matterGroupPreview',
      component: () => import('@/views/matterGroupPreview.vue')
    },
    {
      path: '/matterGroupFinish',
      name: 'matterGroupFinish',
      component: () => import('@/views/matterGroupFinish.vue')
    },
    {
      path: '/h5Verify',
      name: 'h5Verify',
      component: () => import('@/views/h5Verify.vue')
    },
    {
      path: '/inputRegCode',
      name: 'inputRegCode',
      component: () => import('@/views/inputRegCode.vue')
    },
    {
      path: '/corporateSeal',
      name: 'corporateSeal',
      component: () => import('@/views/corporateSeal.vue')
    },
    {
      path: '/sealSuccess',
      name: 'sealSuccess',
      component: () => import('@/views/sealSuccess.vue')
    },
    {
      path: '/myItems',
      name: 'myItems',
      component: () => import('@/views/myItems.vue')
    },
    {
      path: '/itemInformation',
      name: 'itemInformation',
      component: () => import('@/views/itemInformation.vue')
    },
    {
      path: '/mycorporateSeal',
      name: 'mycorporateSeal',
      component: () => import('@/views/mycorporateSeal.vue')
    },
    {
      path: '/establishCompany',
      name: 'establishCompany',
      component: () => import('@/views/establishCompany.vue')
    },
    {
      path: '/authenticationCompany',
      name: 'authenticationCompany',
      component: () => import('@/views/authenticationCompany.vue')
    },
    {
      path: '/verificationMoney',
      name: 'verificationMoney',
      component: () => import('@/views/verificationMoney.vue')
    },
    {
      path: '/addSeal',
      name: 'addSeal',
      component: () => import('@/views/addSeal.vue')
    },
    {
      path: '/sealDetails',
      name: 'sealDetails',
      component: () => import('@/views/sealDetails.vue')
    },
    {
      path: '/companyDetails',
      name: 'companyDetails',
      component: () => import('@/views/companyDetails.vue')
    },
    {
      path: '/changePwd',
      name: 'changePwd',
      component: () => import('@/views/changePwd.vue')
    },
    {
      path: '/authPwd',
      name: 'authPwd',
      component: () => import('@/views/authPwd.vue')
    },
    {
      path: '/matterGroupBasePreview',
      name: 'matterGroupBasePreview',
      component: () => import('@/views/matterGroupBasePreview.vue')
    },
    {
      path: '/matterParticleChoose',
      name: 'matterParticleChoose',
      component: () => import('@/views/matterParticleChoose/matterParticleChoose.vue')
    },
    {
      path: '/samplePreview',
      name: 'SamplePreview',
      component: () => import('@/views/samplePreview/samplePreview.vue')
    }
  ]
});
router.beforeEach((to, from, next) => {
  if (to.query.token) {
    sessionStorage.setItem('token', to.query.token);
  }
  next();
});
export default router;

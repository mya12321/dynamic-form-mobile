import Vue from 'vue';
import App from './App.vue';
import HalfDialog from './components/HalfDialog.vue';
import PhotoSwipe from './components/PhotoSwipe.vue';
import router from './router';
import store from './store';
import VueCompositionApi from '@vue/composition-api';
import './plugins/element.js';
import './plugins/axios.js';
import './plugins/utils.js';
import 'weui/dist/style/weui.css';
import './assets/css/common.css';

let halfDialog = new Vue({
  render: h => h(HalfDialog)
}).$mount('#half-dialog');
Vue.prototype.$halfDialog = halfDialog.$children[0];
let photoSwipe = new Vue({
  render: h => h(PhotoSwipe)
}).$mount('#photo-swipe');
Vue.prototype.$gallery = photoSwipe.$children[0];
Vue.config.productionTip = false;
Vue.use(VueCompositionApi);
Object.getPrototypeOf(router)._push = router.push;
Object.getPrototypeOf(router)._replace = router.replace;
Object.getPrototypeOf(router).push = function(location) {
  let newQuery = Object.assign({}, location.query, {t: (new Date).getTime()});
  let newLocation = Object.assign({}, location, {query: newQuery});
  return this._push(newLocation);
};
Object.getPrototypeOf(router).replace = function(location) {
  let newQuery = Object.assign({}, location.query, {t: (new Date).getTime()});
  let newLocation = Object.assign({}, location, {query: newQuery});
  return this._replace(newLocation);
};

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');

import Vue from 'vue';
import axios from 'axios';

Vue.prototype.baseUrl = `${location.origin}/fwgs`;
// Vue.prototype.baseUrl = `${location.origin}/gateway/fwgs`;
if (process.env.NODE_ENV === 'development') {
  Vue.prototype.baseUrl = process.env.VUE_APP_BASEURL;
}
axios.defaults.baseURL = Vue.prototype.baseUrl;
axios.defaults.timeout = 10000;
if (window.__wxjs_environment || navigator.userAgent.includes("miniProgram")) {
  axios.defaults.headers.common['X-Client'] = 'xcx';
} else if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
  axios.defaults.headers.common['X-Client'] = 'ios';
} else if (/(android)/i.test(navigator.userAgent)) {
  axios.defaults.headers.common['X-Client'] = 'ard';
} else {
  axios.defaults.headers.common['X-Client'] = 'web';
}
// 请求拦截 (增加token)
axios.interceptors.request.use(config => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers['Token'] = token;
  }
  return config;
});

// 响应拦截（配置请求回来的信息）
axios.interceptors.response.use(res => {
  if (res.data['err_code'] == 0) {
    return res.data;
  } else {
    let loading = Vue.prototype.$loading({
      lock: true,
      text: '正在加载',
      spinner: 'el-icon-loading',
      background: 'rgba(0, 0, 0, 0.3)'
    });
    loading.close();
    let errorMessage;
    if (res.data['err_code'] === 'TOKEN_REQUIRED'
      || res.data['err_code'] === 'TOKEN_EXPIRED'
      || res.data['err_code'] === 'TOKEN_INVALID'
      || res.data['err_code'] === 'AUTH_FAILED') {
      errorMessage = '登陆信息无效, 请重新登录.';
      Vue.prototype.$alert(errorMessage).finally(() => {
        if (window.__wxjs_environment || navigator.userAgent.includes("miniProgram")) {
          wx.miniProgram.reLaunch({
            url: '/pages/main/she/she?login_data=false',
          });
        } else {
          location.href = location.origin + '/gotologin';
        }
      });
      return Promise.reject(errorMessage);
    } else if (res.data['err_code'] === 'SYSTEM_ERROR') {
      errorMessage = '系统异常, 请联系系统管理员.';
    } else if (res.data['err_code'] === 'PARAMETER_FAIL'
      || res.data['err_code'] === 'PARAMETER_ILLEGAL') {
      return Promise.reject(res.data['err_code_des']);
    } else if (res.data['err_code'] === 'NOT_FOUND') {
      errorMessage = '接口未找到, 请联系系统管理员.';
    } else {
      errorMessage = res.data['err_code_des'];
    }
    Vue.prototype.$alert(errorMessage);
    return Promise.reject(errorMessage);
  }
});
Vue.prototype.$get = axios.get;
Vue.prototype.$post = axios.post;

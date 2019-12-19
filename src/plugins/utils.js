import Vue from 'vue';

Date.prototype.format = function (fmt) { //author: AndyMiao
  let o = {
    "M+": this.getMonth() + 1, //月份
    "d+": this.getDate(), //日
    "H+": this.getHours(), //小时
    "m+": this.getMinutes(), //分
    "s+": this.getSeconds(), //秒
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度
    "S": this.getMilliseconds() //毫秒
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (let k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}
let utils = {
  getUrlParams() {
    let url = location.href;
    let str = url.substr(url.indexOf('?') + 1);
    let arr = [];
    let params = {};
    if (str.length) {
      arr = str.split('&');
    }
    arr.forEach(param => {
      let pairs = param.split('=');
      params[pairs[0]] = decodeURIComponent(pairs[1]);
    });
    return params;
  },
  toUrlParamsStr(param) {
    if(param == null) return '';
    return Object.keys(param).map(key => key + '=' + encodeURIComponent(param[key])).join('&');
  },
};

Vue.prototype.$utils = utils;

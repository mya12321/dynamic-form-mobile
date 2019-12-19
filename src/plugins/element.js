import Vue from 'vue';
import 'element-ui/lib/theme-chalk/index.css';
import { Button } from 'element-ui';
import { Form } from 'element-ui';
import { FormItem } from 'element-ui';
import { Input } from 'element-ui';
import { Radio } from 'element-ui';
import { RadioGroup } from 'element-ui';
import { Checkbox } from 'element-ui';
import { CheckboxGroup } from 'element-ui';
import { Select } from 'element-ui';
import { Option } from 'element-ui';
import { DatePicker } from 'element-ui';
import { Upload } from 'element-ui';
import { Dialog } from 'element-ui';
// import { MessageBox } from 'element-ui';
import { Loading } from 'element-ui';
import { Row } from 'element-ui';
import { Col } from 'element-ui';
import { Steps } from 'element-ui';
import { Step } from 'element-ui';
// import { Message } from 'element-ui';
import weui from 'weui.js';

Vue.use(Button);
Vue.use(Form);
Vue.use(FormItem);
Vue.use(Input);
Vue.use(Radio);
Vue.use(RadioGroup);
Vue.use(Checkbox);
Vue.use(CheckboxGroup);
Vue.use(Select);
Vue.use(Option);
Vue.use(DatePicker);
Vue.use(Upload);
Vue.use(Dialog);
Vue.use(Loading);
Vue.use(Row);
Vue.use(Col);
Vue.use(Steps);
Vue.use(Step);
// Vue.prototype.$alert = (message, title, option) => {
//   let defaultOption = {
//     customClass: 'alertBox',
//   };
//   return MessageBox.alert(message, title || '提示', Object.assign(defaultOption, option));
// };
// Vue.prototype.$confirm = (message, title, option) => {
//   let defaultOption = {
//     customClass: 'confirmBox',
//   };
//   return MessageBox.confirm(message, title || '确认', Object.assign(defaultOption, option));
// };
// Vue.prototype.$loading = Loading.service;
// Vue.prototype.$message = Message;
Vue.prototype.$alert = (message, title) => {
  return new Promise(resolve => {
    weui.alert(message, resolve, {
      title
    });
  });
};
Vue.prototype.$confirm = (message, title) => {
  return new Promise((resolve, reject) => {
    weui.confirm(message, resolve, reject, {
      title
    });
  });
};
Vue.prototype.$loading = options => {
  let loading = weui.loading(options.text, options);
  loading.close = loading.hide;
  return loading;
};
Vue.prototype.$message = options => {
  options.className = options.customClass;
  weui.toast(options.message, options);
};

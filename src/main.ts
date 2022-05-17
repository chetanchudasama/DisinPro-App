import Vue from 'vue';
import App from './App.vue';
import router from '@/router';
import Vuetify from 'vuetify';
import VeeValidate from 'vee-validate';
import "vuetify/dist/vuetify.min.css";
import "../public/css/custom.css";
import "../public/css/style.css";

Vue.config.productionTip = false;
Vue.use(Vuetify);
// field bag name added to resolve console error due to conflicts in 'fields prop' in different node module packages
// @ts-ignore
Vue.use(VeeValidate, { fieldsBagName: 'vvFields' });

new Vue({
  vuetify: new Vuetify(),
router,
  render: (h: any) => h(App),
  $_veeValidate: {
    validator: 'new',
  },
}).$mount('#app');

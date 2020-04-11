import Vue from 'vue'
import App from './App.vue'
import './main.css'

import VueTailwindModal from 'vue-tailwind-modal'
Vue.use(VueTailwindModal);


Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')

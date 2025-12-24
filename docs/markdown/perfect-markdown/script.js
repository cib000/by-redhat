const store = new Vuex.Store({});
Vue.use(window.pmd.default, { store });
Vue.config.productionTip = false;

new Vue({
  store,
  el: '#app',
  data() {
    return {
      value: '' };

  } });
import Vue from 'vue'
import App from './App.vue'
import router from './router'

Vue.config.productionTip = false;
Vue.use(require('vue-moment'));
Vue.filter('number', function (value, decimals = 2) {
    if (typeof value !== "number") {
        return value;
    } else {
        return value.toFixed(decimals);
    }
});

new Vue({
    router,
    render: h => h(App),
}).$mount('#app');






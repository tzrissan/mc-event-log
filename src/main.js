import Vue from 'vue'
import App from './App.vue'

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
    render: h => h(App),
}).$mount('#app');






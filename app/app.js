var Vue = require('vue');
var VueRouter = require('vue-router');
var VueResource = require('vue-resource');

// 路由器需要一个根组件。
var App = require('./App.vue')
var Main = require('./components/Main.vue')
var Statistics = require('./components/Statistics.vue')

Vue.use(VueRouter);
Vue.use(VueResource);

// 创建一个路由器实例
var router = new VueRouter()

// 定义路由规则
// 创建的组件构造函数，也可以是一个组件选项对象。
router.map({
    '/': {
        component: Main
    },
    '/main': {
        component: Main
    },
    '/statistics': {
        component: Statistics
    }
})
// 路由器会创建一个 App 实例，并且挂载到选择符 #app 匹配的元素上。
router.start(App, '#app')

var Vue = require('vue');
var VueRouter = require('vue-router');
var ConfigRouter = require('./router');
var store = require('./vuex/store');

// 路由器需要一个根组件。
var App = require('./App.vue')

Vue.config.debug = true

Vue.use(VueRouter);

// 创建一个路由器实例
var router = new VueRouter()
ConfigRouter(router)

// For every new route scroll to the top of the page
router.beforeEach(function() {
  window.scrollTo(0, 0)
})

// If no route is matched redirect home
router.redirect({
  '*': '/'
})

// 路由器会创建一个 App 实例，并且挂载到选择符 #app 匹配的元素上。
router.start(App, '#root')

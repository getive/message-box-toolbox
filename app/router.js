// Route config
export default function(router) {
  // 定义路由规则
  // 创建的组件构造函数，也可以是一个组件选项对象。
  router.map({
    '/': {
      component: require("./components/Main.vue")
    },
    '/main': {
      component: require("./components/Main.vue")
    },
    '/statistics': {
      component: require("./components/Statistics.vue")
    },
    '/register': {
      component: require("./components/Register.vue")
    }
  })
}

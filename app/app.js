var Vue = require('vue');
var VueRouter = require('vue-router');
var VueResource = require('vue-resource');

var serverURL = 'http://localhost:3000';
var io = require('socket.io-client');
var socket = io.connect(serverURL, { 'force new connection': true });

var moment = require('moment');
// 连接mongodb
var conf = require('../config/env_development.json');
var connect = require('./mongodb-server/server').connect(conf.test.url, conf.test.options);

Vue.use(VueRouter);
Vue.use(VueResource);

var vm = new Vue({
    // We want to target the div with an id of 'messages'
    el: '#messages',

    // Here we can register any values or collections that hold data
    // for the application
    data: {
        message: {
            title: '',
            description: '',
            date: ''
        },
        messages: []
    },

    // Methods we want to use in our application are registered here
    methods: {
        testMessage: function() {
            var socket = io.connect(serverURL, { 'force new connection': true });
            var self = this;
            connect(function(db) {
                var users = db.collection('mb_user');
                var summaries = db.collection('mb_summaries');
                var messages = db.collection('mb_messages');

                var mesContent = {
                    username: self.message.username,
                    title: self.message.title,
                    desc: self.message.description.substring(0, 10)
                }

                users.find({ username: self.message.username }).toArray(function(err, doc) {
                    if (doc.length > 0) { //private信息
                        summaries.find({}).toArray(function(err, docs) {
                            summaries.save({
                                type: "private",
                                user_id: doc[0].userid,
                                user_brc: "",
                                id: docs.length + 1,
                                typeid: +self.selected,
                                title: self.message.title,
                                author: self.message.author,
                                desc: self.message.description.substring(0, 50),
                                sendtime: self.nowTime(),
                                read: false
                            });
                            messages.save({
                                id: docs.length + 1,
                                typeid: +self.selected,
                                title: self.message.title,
                                author: self.message.author,
                                content: self.message.description,
                                sendtime: self.nowTime(),
                            });
                            socket.emit('private message', {
                                username:self.message.username,
                                title: self.message.title,
                                desc: self.message.description.substring(0, 10)
                            });

                        });

                        socket.emit('private message', mesContent);

                    } else { //public信息
                        summaries.find({}).toArray(function(err, docs) {
                            summaries.save({
                                user_id: "",
                                type: "public",
                                user_brc: "",
                                id: docs.length + 1,
                                typeid: +self.selected,
                                title: self.message.title,
                                author: self.message.author,
                                desc: self.message.description.substring(0, 50),
                                sendtime: self.nowTime(),
                                read: false
                            });
                            messages.save({
                                id: docs.length + 1,
                                typeid: +self.selected,
                                title: self.message.title,
                                author: self.message.author,
                                content: self.message.description,
                                sendtime: self.nowTime(),
                            });
                            socket.emit('public message', {
                                title: self.message.title,
                                desc: self.message.description.substring(0, 10)
                            });

                        });

                        socket.emit('public message', mesContent);

                    }
                });
            });
            setTimeout(function(){
                self.message.title = "";
                self.message.author = "";
                self.message.username = "";
                self.selected = "1";
                self.message.description = "";
            },700);
        },
        nowTime: function() {
            return moment().format('YYYY-MM-DD HH:mm:ss');
        }
    }
})

// 定义组件
var Index = Vue.extend({
    // template: '<p>首页</p>'
})

var Mesbox = Vue.extend({
    // template: '<li>消息盒子</li>'
})

// 路由器需要一个根组件。
// 出于演示的目的，这里使用一个空的组件，直接使用 HTML 作为应用的模板
var App = Vue.extend({})

// 创建一个路由器实例
// 创建实例时可以传入配置参数进行定制，为保持简单，这里使用默认配置
var router = new VueRouter()

// 定义路由规则
// 每条路由规则应该映射到一个组件。这里的“组件”可以是一个使用 Vue.extend
// 创建的组件构造函数，也可以是一个组件选项对象。
// 稍后我们会讲解嵌套路由
router.map({
        '/': {
            component: Index
        },
        '/mesbox': {
            component: Mesbox
        },
        '/test': {
            component: {
                template: '<p>测试链接</p>'
            }
        }
    })
    // 现在我们可以启动应用了！
    // 路由器会创建一个 App 实例，并且挂载到选择符 #app 匹配的元素上。
router.start(App, '#app')

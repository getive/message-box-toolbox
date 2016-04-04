var Vue = require('vue');
var VueRouter = require('vue-router');
var VueResource = require('vue-resource');

var conf = require('../config/env_development.json');
var io = require('socket.io-client');
var moment = require('moment');
// 连接mongodb
var connect = require('./mongodb-server/server').connect(conf.test.url, conf.test.options);
var socket = io.connect(conf.socketServerUrl, { 'force new connection': true });

Vue.use(VueRouter);
Vue.use(VueResource);

var vm = new Vue({
    // We want to target the div with an id of 'messages'
    el: '#messages',

    // Here we can register any values or collections that hold data
    // for the application
    data: {
        message: {
            author: '',
            username: '',
            title: '',
            selected: '',
            description: '',
        }
    },

    // Methods we want to use in our application are registered here
    methods: {
        testMessage: function() {
            var self = this;
            connect(function(db) {
                var users = db.collection('mb_user');
                var messages = db.collection('mb_messages');
                var status = db.collection('mb_status');
                var mesContent = {
                    username: self.message.username,
                    title: self.message.title,
                    desc: self.message.description.substring(0, 35)+"...",
                    typeid: +self.message.selected
                }
                if (self.message.title != "" && self.message.author != "" && self.message.description != "") {
                    users.find({ username: self.message.username }).toArray(function(err, doc) {
                        var typeid = +self.message.selected;
                        var username = self.message.username;
                        if (doc.length > 0) { //private信息
                            messages.find({}).toArray(function(err, docs) {
                                var docsNum = docs.length - 1;
                                var idNum = docsNum < 0 ? 1 : docs[docsNum].id + 1; //判断是否有数据
                                messages.save({
                                    id: idNum,
                                    userid: doc[0].userid,
                                    userbrc: "",
                                    typeid: +self.message.selected,
                                    type: "private",
                                    title: self.message.title,
                                    author: self.message.author,
                                    desc: self.message.description.substring(0, 50),
                                    content: self.message.description,
                                    sendtime: self.nowTime()
                                });
                                status.update({
                                    userid: doc[0].userid,
                                    typeid: typeid
                                }, {
                                    $push: {
                                        "message": { "id": idNum, "read": false }
                                    }
                                });
                            });
                            self.privateUnreadCount(typeid, username);  //修改私有消息未读数
                            socket.emit('private message', mesContent);

                        } else { //public信息
                            messages.find({}).toArray(function(err, docs) {
                                var docsNum = docs.length - 1;
                                var idNum = docsNum < 0 ? 1 : docs[docsNum].id + 1; //判断是否有数据
                                messages.save({
                                    id: idNum,
                                    userid: "",
                                    userbrc: "",
                                    typeid: +self.message.selected,
                                    type: "public",
                                    title: self.message.title,
                                    author: self.message.author,
                                    desc: self.message.description.substring(0, 50),
                                    content: self.message.description,
                                    sendtime: self.nowTime()
                                });
                                users.find({}).toArray(function(err, d) {
                                    for (var i = 0; i < d.length; i++) {
                                        status.update({
                                            userid: d[i].userid,
                                            typeid: typeid
                                        }, {
                                            $push: {
                                                "message": { "id": idNum, "read": false }
                                            }
                                        });
                                    }
                                });
                            });
                            self.publicUnreadCount(typeid);  //修改公有消息未读数
                            socket.emit('public message', mesContent);
                        }
                    });
                } else {
                    alert("标题、作者、内容 不能为空！")
                }

            });
            setTimeout(function() {
                self.message.title = "";
                self.message.author = "";
                self.message.username = "";
                self.message.selected = "1";
                self.message.description = "";
            }, 700);
        },
        nowTime: function() {
            return moment().format('YYYY-MM-DD HH:mm:ss');
        },
        privateUnreadCount: function(typeid, username) {
            connect(function(db) {
                var collection = db.collection('mb_user');
                var status = db.collection('mb_status');
                collection.find({ username: username }).toArray(function(err, docs) {
                    status.find({ userid: docs[0].userid, typeid: typeid }).toArray(function(err, doc) {
                        status.update({ userid: docs[0].userid, typeid: typeid }, {
                            $set: {
                                "count": doc[0].count + 1
                            }
                        });
                    });
                });
            });
        },
        publicUnreadCount: function(typeid) {
            connect(function(db) {
                var collection = db.collection('mb_user');
                var status = db.collection('mb_status');
                collection.find({}).toArray(function(err, docs) {
                    for (var i = 0; i < docs.length; i++) {
                        status.find({
                            userid: docs[i].userid,
                            typeid: typeid
                        }).toArray(function(err, doc) {
                            status.update({
                                userid: doc[0].userid,
                                typeid: typeid
                            }, {
                                $set: {
                                    "count": doc[0].count + 1
                                }
                            })
                        });
                    }
                });
            });
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

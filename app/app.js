var Vue = require('vue');
var VueRouter = require('vue-router');
var VueResource = require('vue-resource');

var serverURL = 'http://localhost:3000';
var io = require('socket.io-client');
var socket = io.connect(serverURL,{'force new connection': true});

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

    // Anything within the ready function will run when the application loads
    ready: function () {
        // When the application loads, we want to call the method that initializes
        // some data
        this.fetchMessages();
        this.connect(socket);
    },

    // Methods we want to use in our application are registered here
    methods: {

        // We dedicate a method to retrieving and setting some data
        fetchMessages: function () {
            this.$http.get('./assets/messages.json', function (data) {
                this.$set('messages', data);
            }).error(function (data, status, request) {
                console.log('fail' + status + "," + request);
            })

            //this.$http.get('http://8.1.3.213:8799/iebp4jlsi/electradeplat/forHallPayTranList.do', function (data) {
            //    console.log(data);
            //}).error(function (data, status, request) {
            //    console.log('fail' + status + "," + request);
            //})
        },

        // Adds an message to the existing messages array
        addMessage: function () {
            if (this.message.title) {
                this.messages.push(this.message);
                this.message = {
                    title: '',
                    description: '',
                    date: ''
                };
            }
        },

        deleteMessage: function (message) {
            if (confirm("Are you sure you want to delete this message?")) {
                // $remove is a Vue convenience method similar to splice
                this.messages.$remove(message);
            }
        },

        connect: function () {
            socket.on('connect', function () {
                logData('sourceClient: connected');
                socket.emit('login', 'sourceClient is connected');
            })
        },

        testMessage: function () {
            var socket = io.connect(serverURL,{'force new connection': true});
            socket.on('connect', function (){
                // socket.emit('login', 'sourceClient is connected');
                // var mesContent = {
                //     title:  'test message',
                //     description:   'this is first message',
                //     date:   '2016-02-26'
                // }
                var mesContent = {
                    typeid: 3,
                    title:  '征集核定',
                    author: '吉林省社保局',
                    desc:   '征集核定信息',
                    content: '今日收到吉林省社保局征集核定信息'
                }
                // // listen to news event raised by the server
                // socket.on('welcome', function (data) {
                //     logData(data);
                //     // raise an event on the server
                //     socket.emit('new message',mesContent);
                // });
                socket.emit('public message',mesContent);
            });
        },

        showMessage: function (data) {
            this.message = data;
        }
    }
})

// 定义组件
var Index = Vue.extend({
    template: '<p>首页</p>'
})

var Mesbox = Vue.extend({
    template: '<li>消息盒子</li>'
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

// Add a connect listener
socket.on('connect', function() {
    socket.on('message',function (data) {
        logData(data);
        vm.showMessage(data);
    });
});

function logData (message) {
    var date = new Date();
    var time = "[" + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "]";
    console.log(time + message);
}
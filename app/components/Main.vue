<script>
var conf = require('../../config/env_development.json');
var io = require('socket.io-client');
var moment = require('moment');
// 连接mongodb
var connect = require('../utils/db').connect(conf.db.url, conf.db.options);
var socket = io.connect(conf.socketServerUrl, { 'force new connection': true });

module.exports = {
    name: 'Main',
    // Here we can register any values or collections that hold data
    // for the application
    data: function() {
      return {
        message: {
            author: '',
            username: '',
            title: '',
            selected: '',
            description: '',
        }
      }
    },

    // Methods we want to use in our application are registered here
    methods: {
        testMessage: function() {
            var self = this;
            connect(function(db) {
                var user = db.collection('mb_user');
                var message = db.collection('mb_message');
                var summary = db.collection('mb_summary');
                var mesContent = {
                    username: self.message.username,
                    title: self.message.title,
                    desc: self.message.description.length > 36 ?
                        self.message.description.substring(0, 36) + "..." : self.message.description,
                    typeid: +self.message.selected
                }
                if (self.message.title != "" && self.message.author != "" && self.message.description != "") {
                    user.find({
                        username: self.message.username
                    }).toArray(function(err, doc) {
                        var typeid = +self.message.selected;
                        var username = self.message.username;
                        if (doc.length > 0) { //private信息
                            message.find({}).toArray(function(err, docs) {
                                var docsNum = docs.length - 1;
                                var idNum = docsNum < 0 ? 1 : docs[docsNum].id + 1; //判断是否有数据
                                message.save({
                                    id: idNum,
                                    userid: doc[0].userid,
                                    userbrc: "",
                                    typeid: +self.message.selected,
                                    type: "private",
                                    title: self.message.title,
                                    author: self.message.author,
                                    desc: self.message.description.substring(0, 48),
                                    content: self.message.description,
                                    sendtime: self.nowTime()
                                });
                                summary.update({
                                    userid: doc[0].userid,
                                    typeid: typeid
                                }, {
                                    $push: {
                                        "message": {
                                            "id": idNum,
                                            "title": self.message.title,
                                            "desc": self.message.description.substring(0, 48),
                                            "sendtime": self.nowTime(),
                                            "read": false
                                        }
                                    }
                                });
                            });
                            self.privateUnreadCount(typeid, username); //修改私有消息未读数
                            socket.emit('private message', mesContent);

                        } else { //public信息
                            message.find({}).toArray(function(err, docs) {
                                var docsNum = docs.length - 1;
                                var idNum = docsNum < 0 ? 1 : docs[docsNum].id + 1; //判断是否有数据
                                message.save({
                                    id: idNum,
                                    userid: "",
                                    userbrc: "",
                                    typeid: +self.message.selected,
                                    type: "public",
                                    title: self.message.title,
                                    author: self.message.author,
                                    desc: self.message.description.substring(0, 48),
                                    content: self.message.description,
                                    sendtime: self.nowTime()
                                });
                                user.find({}).toArray(function(err, d) {
                                    for (var i = 0; i < d.length; i++) {
                                        summary.update({
                                            userid: d[i].userid,
                                            typeid: typeid
                                        }, {
                                            $push: {
                                                "message": {
                                                    "id": idNum,
                                                    "title": self.message.title,
                                                    "desc": self.message.description.substring(0, 48),
                                                    "sendtime": self.nowTime(),
                                                    "read": false
                                                }
                                            }
                                        });
                                    }
                                });
                            });
                            self.publicUnreadCount(typeid); //修改公有消息未读数
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
                var summary = db.collection('mb_summary');
                collection.find({
                    username: username
                }).toArray(function(err, docs) {
                    summary.find({
                        userid: docs[0].userid,
                        typeid: typeid
                    }).toArray(function(err, doc) {
                        summary.update({
                            userid: docs[0].userid,
                            typeid: typeid
                        }, {
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
                var summary = db.collection('mb_summary');
                collection.find({}).toArray(function(err, docs) {
                    for (var i = 0; i < docs.length; i++) {
                        summary.find({
                            userid: docs[i].userid,
                            typeid: typeid
                        }).toArray(function(err, doc) {
                            summary.update({
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
}
</script>
<template>
    <div class="content" id="messages">
        <!-- add an message form -->
        <div class="panel panel-success">
            <div class="panel-heading">
                <span>数据新增</span>
            </div>
            <div class="panel-body">

                <div class="form-inline form-user">
                    <div class="form-group">
                        <input class="form-control" placeholder="发送方" v-model="message.author">
                    </div>

                    <div class="form-group form-username">
                        <input class="form-control" placeholder="接收方" v-model="message.username">
                    </div>
                </div>

                <div class="form-group">
                    <input class="form-control" placeholder="标题" v-model="message.title">
                </div>

                <div class="form-group">
                    <select class="form-control" v-model="message.selected">
                        <option value="1" selected>政策信息</option>
                        <option value="2">业务通知</option>
                        <option value="3">征集核定</option>
                        <option value="4">发票领取</option>
                        <option value="5">缴费通知</option>
                        <option value="6">催缴通知</option>
                    </select>
                </div>

                <div class="form-group">
                    <form>
                        <textarea name="content" data-provide="markdown" rows="10" v-model="message.description" placeholder="内容" data-hidden-buttons="cmdUrl cmdImage"></textarea>
                    </form>
                </div>

                <button class="btn btn-primary pull-right" @click="testMessage"><i class="glyphicon glyphicon-send"></i> 发&emsp;布</button>
            </div>
        </div>
    </div>

    <!-- main body of our application -->
</template>
<style>
    .content {
        padding-right: 15px;
        padding-left: 15px;
        margin-right: auto;
        margin-left: auto;
    }

    .form-user .form-group {
        margin-bottom: 15px;
        width: 49%
    }

    .form-user .form-group .form-control {
        width: 100%;
    }
    .form-username {
        margin-left: 12px;
    }
    .panel-success {
        border-color: #1ABC9C;
    }
    .panel-success>.panel-heading {
        color:#fff;
        background-color: #1ABC9C;
        border-color:#1ABC9C;
    }
    .md-editor.active {
        border-color: #1abc9c;
    }
    .form-control, .select2-search input[type=text] {
        border:1px solid #bdc3c7;
    }
</style>

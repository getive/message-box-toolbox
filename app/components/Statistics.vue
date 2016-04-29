<script>
    var env_conf = require('../../config/env_development.json');
    var socket = require('socket.io-client')(env_conf.socketServerUrl);
    var connect = require('../utils/db').connect(env_conf.db.url, env_conf.db.options);
    var onlineCount;
    module.exports = {
        name: 'Statistics',
        data: function() {
            return {
                onlineUserNames: [],
                count1:[],
                count2:[]
                
            }
        },
        ready: function() {
            var self = this;
            //查询在线人数
            connect(function(db) {
                var userCollection = db.collection('mb_user');
                userCollection.find({online_stat:true}).toArray(function(err,docs){
                    for(var i=0;i<docs.length;i++){
                        self.onlineUserNames.push({
                            username:docs[i].username,
                            userid:docs[i].userid
                        });
                    }
                    // console.log(self.onlineUserNames[0].username);
                    onlineCount = docs.length;
                    //在线人数显示
                    $("#onlineCount").html(onlineCount);
                });
            });
            //用户登录成功在线人数+1
            socket.on('onlineCountAdd', function(obj) {
                onlineCount = onlineCount + 1;
                $("#onlineCount").html(onlineCount);
                //
                connect(function(db){
                    var userCollection = db.collection('mb_user');
                    userCollection.find({username:obj.username}).toArray(function(err,docs){
                        self.onlineUserNames.push({
                            username:obj.username,
                            userid:docs[0].userid
                        });
                    });
                });
            });
            //用户退出在线人数-1
            socket.on('onlineCountDel', function(obj) {
                onlineCount =onlineCount - 1;
                $("#onlineCount").html(onlineCount);
                for(var i=0;i<self.onlineUserNames.length;i++){
                    if(self.onlineUserNames[i].username == obj.username){
                        self.onlineUserNames.splice(i,1);
                    }
                }
                //清空显示的数据
                var count1 = self.count1.length;
                var count2 = self.count2.length;
                self.count1.splice(0,count1);
                self.count2.splice(0,count2);
                $("#username").html("");
                $("#allCount").html("");

            });
        },
        methods: {
            username(userid,username) {
                this.count1 = [];
                this.count2 = [];
                var self = this;
                connect(function(db){
                    var summaryCollection = db.collection("mb_summary");
                    summaryCollection.find({userid:userid}).toArray(function(err,docs){
                        var allCount = 0;
                        var readCount = 0;
                        var unreadCount = 0;
                        for(var i=0;i<docs.length;i++){
                            allCount = allCount + docs[i].message.length;
                            unreadCount = unreadCount + docs[i].count;
                            readCount = allCount - unreadCount;
                        }
                        $("#allCount").html(readCount + "/" + allCount);
                    });
                });
                connect(function(db){
                    var summaryCollection = db.collection("mb_summary");
                    var msgTypeAllCount = 0;
                    var msgTypeReadCount = 0;
                    summaryCollection.find({userid:userid}).sort({
                        'typeid':1
                    }).toArray(function(err,docs){
                        var msgTypesCount = env_conf.messageTypes.length;
                        for(var i=0;i<msgTypesCount;i++){
                            msgTypeAllCount = docs[i].message.length;
                            msgTypeReadCount = docs[i].message.length - docs[i].count;
                            if(i<3){
                                self.count1.push({
                                    total:msgTypeAllCount,
                                    read:msgTypeReadCount,
                                    title:env_conf.messageTypes[i]
                                });
                            }else {
                                self.count2.push({
                                    total:msgTypeAllCount,
                                    read:msgTypeReadCount,
                                    title:env_conf.messageTypes[i]
                                });
                            }
                            
                            msgTypeAllCount = 0;
                            msgTypeReadCount = 0;
                        }
                    });
                });
                $("#username").html(username);
            }

        }
    }
</script>
<template id="statistics">
    <div id="statis">
        <!-- main body of our application -->
        <div class="content" >
            <!-- add an message form -->
            <div class="panel panel-success">
                <div class="panel-heading">
                    <span>数据统计</span>
                </div>
                <div class="panel-body">
                    <div class="search" style="display:inline-block">
                        <input type="text" value="" placeholder="搜索" class="form-control input-zd" v-model="searchQuery" />
                    </div>
                    <div class="form-group online-count" style="display:inline-block;width:130px;">
                        <p>当前在线人数: <span style="color:red" id="onlineCount">0</span></p>
                    </div>
                    <div class="form-group">
                        <div class="row">
                            <div class="col-md-3 col-sm-3">
                                <ul class="dashboard-list" id="onlineName">
                                    <li  v-for="onlineUsername in onlineUserNames |filterBy searchQuery in 'username' " class="dashboard-list-item" @click="username(onlineUsername.userid,onlineUsername.username)">
                                        <article>
                                            {{onlineUsername.username}}
                                        </article>
                                    </li>
                                    
                                </ul>
                            </div>
                            <div class="col-md-9 col-sm-9 message">
                                <h6>消息读取状态</h6>
                                <hr>
                                <div class="row msg">
                                    <div class="col-md-6 col-sm-6">
                                        <p>用户名: <span id="username"></span></p>
                                    </div>
                                    <div class="col-md-6 col-sm-6">
                                        <p>已读条数: <span id="allCount"></span></p>
                                    </div>
                                </div>
                                <hr>
                                <div class="row msg">
                                    <div class="col-md-6 col-sm-6">
                                        <ul class="msg-types">
                                            <li v-for="coun1 in count1" style="list-style-type: none">
                                               {{coun1.title}}：{{coun1.read}}/{{coun1.total}}
                                           </li>
                                        </ul>
                                    </div>
                                    <div class="col-md-6 col-sm-6">
                                        <ul class="msg-types">
                                            <li v-for="coun2 in count2" style="list-style-type: none">
                                               {{coun2.title}}：{{coun2.read}}/{{coun2.total}}
                                           </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- show the messages -->
        </div>
    </div>

</template>
<style >
    .dashboard-list {
        overflow:auto;
        border:2px solid #1ABC9C;
        border-radius:5px;
        cursor: pointer;
        height:300px;
        width:193px;
    }
    .dashboard-list-item {
        clear: both;
        cursor: pointer;
        border-bottom:1px solid #ddd;
        list-style-type: none;
        font-size: 16px;
        line-height: 25px;
        color:#21304c;
        margin-left:-40px;
        padding-left: 15px;
    }
    .dashboard-list-item:hover {
        color:#31708f;
        background-color: #eee;
    }
    .form-group p {
        margin-left: 1%;
    }
    .msg {
        margin-left: 20px;
    }
    .msg-types {
        line-height: 25px;
        margin-left: -37px;
    }
    .search {
/*        margin-left: 20px;
*/    }
    .online-count {
        margin-left: 15px;
        width:300px;
    }
    .input-zd {
        width:193px;
        height:36px;
    }
</style>

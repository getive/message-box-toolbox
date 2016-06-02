<script>
  var env_conf = require('../../config/env_development.json');
  var socket = require('socket.io-client')(env_conf.socketServerUrl);

  module.exports = {
    name: 'Statistics',
    data: function() {
      return {
        onlineUserNames: [],
        count1: [],
        count2: [],
        onlineCount: '',
        allCount: '',
        clickUsername: ''
      }
    },

    vuex: {
      getters: {
        User: ({
          global
        }) => global.User,
        Summary: ({
          global
        }) => global.Summary,
        Message: ({
          global
        }) => global.Message
      }
    },

    ready: function() {
      var self = this;
      // 查询在线人数
      this.User.find({
        online_stat: true
      }, function(err, users) {
        self.onlineCount = users.length;
        for (var i in users) {
          self.onlineUserNames.push({
            username: users[i].username,
            userid: users[i].userid
          });
        }
      });
      // 用户登录成功在线人数+1
      socket.on('onlineCountAdd', function(obj) {
        self.onlineCount = self.onlineCount + 1;
        // 添加新加入的用户
        self.User.findOne({
          username: obj.username
        }, function(err, user) {
          self.onlineUserNames.push({
            username: obj.username,
            userid: user.userid
          });
        });
      });
      // 用户退出在线人数-1
      socket.on('onlineCountDel', function(obj) {
        self.onlineCount = self.onlineCount - 1;
        for (var i = 0; i < self.onlineUserNames.length; i++) {
          if (self.onlineUserNames[i].username == obj.username) {
            self.onlineUserNames.splice(i, 1);
          }
        }
      });
    },
    methods: {
      username(userid, username) {
        var self = this;
        // 清空显示的数据
        var count1 = this.count1.length;
        var count2 = this.count2.length;
        this.count1.splice(0, count1);
        this.count2.splice(0, count2);
        this.allCount = '';
        this.clickUsername = '';

        this.clickUsername = "用户名：" + username;
        this.Summary.find({
          userid: userid
        }, function(err, summaries) {
          var allCount = 0;
          var readCount = 0;
          var unreadCount = 0;
          for (var i in summaries) {
            allCount = allCount + summaries[i].message.length;
            unreadCount = unreadCount + summaries[i].count;
            readCount = allCount - unreadCount;
          }
          self.allCount = "已读条数：" + readCount + "/" + allCount;
        });
        //
        this.Summary.find({
          userid: userid
        }).sort({
          'typeid': 'asc'
        }).exec(function(err, summaries) {
          var msgTypeAllCount = 0;
          var msgTypeReadCount = 0;
          var msgTypes = env_conf.messageTypes;
          for (var i in msgTypes) {
            msgTypeAllCount = summaries[i].message.length;
            msgTypeReadCount = summaries[i].message.length - summaries[i].count;
            if (i < 3) {
              self.count1.push({
                total: msgTypeAllCount,
                read: msgTypeReadCount,
                title: env_conf.messageTypes[i]
              });
            } else {
              self.count2.push({
                total: msgTypeAllCount,
                read: msgTypeReadCount,
                title: env_conf.messageTypes[i]
              });
            }
            msgTypeAllCount = 0;
            msgTypeReadCount = 0;
          }
        });
      }
    }
  }
</script>
<template id="statistics">
  <div id="statis">
    <!-- main body of our application -->
    <div class="content">
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
            <p>当前在线人数: <span style="color:red" id="onlineCount">{{onlineCount}}</span></p>
          </div>
          <div class="form-group">
            <div class="row">
              <div class="col-md-3 col-sm-3">
                <ul class="dashboard-list" id="onlineName">
                  <li v-for="onlineUsername in onlineUserNames |filterBy searchQuery in 'username' " class="dashboard-list-item" @click="username(onlineUsername.userid,onlineUsername.username)">
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
                    <p>{{clickUsername}}</p>
                  </div>
                  <div class="col-md-6 col-sm-6">
                    <p>{{allCount}}</p>
                  </div>
                </div>
                <hr>
                <div class="row msg">
                  <div class="col-md-6 col-sm-6">
                    <ul class="msg-types">
                      <li v-for="c1 in count1" style="list-style-type: none">
                        {{c1.title}}：{{c1.read}}/{{c1.total}}
                      </li>
                    </ul>
                  </div>
                  <div class="col-md-6 col-sm-6">
                    <ul class="msg-types">
                      <li v-for="c2 in count2" style="list-style-type: none">
                        {{c2.title}}：{{c2.read}}/{{c2.total}}
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
<style>
  .dashboard-list {
    overflow: auto;
    border: 2px solid #1ABC9C;
    border-radius: 5px;
    cursor: pointer;
    height: 300px;
    width: 193px;
  }

  .dashboard-list-item {
    clear: both;
    cursor: pointer;
    border-bottom: 1px solid #ddd;
    list-style-type: none;
    font-size: 16px;
    line-height: 25px;
    color: #21304c;
    margin-left: -40px;
    padding-left: 15px;
  }

  .dashboard-list-item:hover {
    color: #31708f;
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

  .online-count {
    margin-left: 15px;
    width: 300px;
  }

  .input-zd {
    width: 193px;
    height: 36px;
  }
</style>

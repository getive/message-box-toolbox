<script>
  var conf = require('../../config/env_development.json');
  var io = require('socket.io-client');
  var socket = io.connect(conf.socketServerUrl, {
    'force new connection': true
  });

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
          typeid: '',
          description: ''
        }
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

    // Methods we want to use in our application are registered here
    methods: {
      sendMessage: function() {
        var self = this;
        var mesContent = {
          username: self.message.username,
          title: self.message.title,
          desc: self.message.description.length > 36 ? self.message.description.substring(0, 36) + "..." : self.message.description,
          typeid: +self.message.typeid
        }
        this.User.findOne({
          username: this.message.username
        }, function(err, user) {
          var typeid = +self.message.typeid;
          var newMessage = {
            id: '',
            userid: user.userid,
            userbrc: '',
            typeid: +self.message.typeid,
            type: '',
            title: self.message.title,
            author: self.message.author,
            desc: self.message.description.substring(0, 48),
            content: self.message.description,
            sendtime: self.getNowFormatDate()
          }
          console.log(user);
          console.dir(newMessage);
          if (user.length > 0) { // private 消息
            var query = {
              userid: user.userid,
              typeid: typeid
            };
            var doc = {
              $set: {
                count: user.count + 1
              }
            }
            var push = {
              $push: {
                message: {
                  id: 0,
                  title: self.message.title,
                  desc: self.message.description.substring(0, 48),
                  sendtime: self.getNowFormatDate(),
                  read: false
                }
              }
            }
            newMessage.id = 0; // 自增ID
            newMessage.type = 'private';
            self.Message.create(newMessage).exec();
            self.Summary.update(query, doc, push).exec();
            // self.privateUnreadCount(typeid, username); // 修改私有消息未读数
            socket.emit('private message', mesContent);
          } else {
            newMessage.id = 0; // 自增ID
            newMessage.type = 'public';
            self.User.find({}, function(err, users) {
              for (var i in users) {
                var query = {
                  userid: users[i].userid,
                  typeid: typeid
                };
                var doc = {
                  $set: {
                    count: users[i].count + 1
                  }
                }
                var push = {
                  $push: {
                    message: {
                      id: 0,
                      title: self.message.title,
                      desc: self.message.description.substring(0, 48),
                      sendtime: self.getNowFormatDate(),
                      read: false
                    }
                  }
                }
                self.Summary.update(query, doc, push).exec()
              }
            })
            // self.publicUnreadCount(typeid); // 修改公有消息未读数
            socket.emit('public message', mesContent);
          }
        });
        setTimeout(function() {
          self.message.title = "";
          self.message.author = "";
          self.message.username = "";
          self.message.typeid = "1";
          self.message.description = "";
        }, 700);
      },
      privateUnreadCount: function(typeid, username) {
        this.User.findOne({
          username: username
        }, function(err, docs) {
          var query = {
            userid: docs.userid,
            typeid: typeid
          };
          var doc = {
            $set: {
              count: docs.count + 1
            }
          }
          this.Summary.update(query, doc).exec()
        })
      },
      publicUnreadCount: function(typeid) {
        this.User.find({}, function(err, docs) {
          for (var i in docs) {
            var query = {
              userid: docs[i].userid,
              typeid: typeid
            };
            var doc = {
              $set: {
                count: docs[i].count + 1
              }
            }
            this.Summary.update(query, doc).exec()
          }
        })
      },
      getNowFormatDate: function() {
        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();

        function format(arg) {
          var reg = /^\d{1}$/;
          return reg.test(arg) ? ("0" + arg) : arg;
        }
        return year + "-" + format(month) + "-" + format(day) + " " + format(hours) + ":" + format(minutes) + ":" + format(seconds);
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
          <select class="form-control" v-model="message.typeid">
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

        <button class="btn btn-primary pull-right" @click="sendMessage"><i class="glyphicon glyphicon-send"></i> 发&emsp;布</button>
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
    color: #fff;
    background-color: #1ABC9C;
    border-color: #1ABC9C;
  }

  .md-editor.active {
    border-color: #1abc9c;
  }

  .form-control,
  .select2-search input[type=text] {
    border: 1px solid #bdc3c7;
  }
</style>

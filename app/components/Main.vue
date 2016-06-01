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
        var messageid = new Date().getTime();
        var mesContent = {
          userid: self.message.userid,
          title: self.message.title,
          desc: self.message.description.length > 36 ? self.message.description.substring(0, 36) + "..." : self.message.description,
          typeid: +self.message.typeid
        }
        var typeid = +self.message.typeid;
        var userid = self.message.userid;
        var newMessage = {
          id: messageid,
          userid: self.message.userid,
          userbrc: '',
          typeid: +self.message.typeid,
          type: '',
          title: self.message.title,
          author: self.message.author,
          desc: self.message.description.substring(0, 48),
          content: self.message.description,
          sendtime: self.getNowFormatDate()
        }
        if (self.message.userid != "00000000") { // private消息
          this.Summary.findOne({
            userid: userid, typeid: typeid
          }, function(err, summary) {
            var query = {
              userid: userid,
              typeid: typeid
            };
            var doc = {
              $set: {
                count: summary.count + 1
              }
            }
            var push = {
              $push: {
                message: {
                  id: messageid,
                  title: self.message.title,
                  desc: self.message.description.substring(0, 48),
                  sendtime: self.getNowFormatDate(),
                  read: false
                }
              }
            }
            newMessage.type = 'private';
            self.Message.create(newMessage);
            self.Summary.update(query, doc).exec();
            self.Summary.update(query, push).exec();
          });
          socket.emit('private message', mesContent);
        } else { // public消息
          this.Summary.find({
            typeid: typeid
          }, function(err, summaries) {
            self.Summary.create(newMessage);
            for (var i in summaries) {
              var query = {
                userid: summaries[i].userid,
                typeid: typeid
              };
              var doc = {
                $set: {
                  count: summaries[i].count + 1
                }
              };
              var push = {
                $push: {
                  message: {
                    id: messageid,
                    title: self.message.title,
                    desc: self.message.description.substring(0, 48),
                    sendtime: self.getNowFormatDate(),
                    read: false
                  }
                }
              };
              newMessage.type = 'public';
              self.Summary.update(query, doc).exec();
              self.Summary.update(query, push).exec();
            }
          });
          socket.emit('public message', mesContent);
        }
        setTimeout(function() {
          self.message.title = "";
          self.message.author = "";
          self.message.userid = "00000000";
          self.message.typeid = "1";
          self.message.description = "";
        }, 700);
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
            <select class="form-control" v-model="message.userid">
              <option value="00000000" selected>--请选择接收方--</option>
              <option value="00000001">接收方1</option>
              <option value="00000002">接收方2</option>
              <option value="00000003">接收方3</option>
              <option value="00000004">接收方4</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <input class="form-control" placeholder="标题" v-model="message.title">
        </div>

        <div class="form-group">
          <select class="form-control" v-model="message.typeid">
            <option value="1" selected>消息类型1</option>
            <option value="2">消息类型2</option>
            <option value="3">消息类型3</option>
            <option value="4">消息类型4</option>
            <option value="5">消息类型5</option>
            <option value="6">消息类型6</option>
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

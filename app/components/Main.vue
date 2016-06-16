<script>
  import Modal from './Modal.vue'
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
        },
        usernames: [],
        messageTypes: [],
        showModal: false,
        modalHeaderMsg: '',
        modalBodyMsg: ''
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

    components: {
      Modal
    },

    ready: function() {
      this.message.typeid = "1";
      var self = this;
      this.User.find({}).sort({
        'username': 'asc'
      }).exec(function(err, users) {
        for (var i in users) {
          self.usernames.push({
            username: users[i].username,
            userid: users[i].userid
          });
        }
      });
      var mesTypes = conf.messageTypes;
      for (var i in mesTypes) {
        this.messageTypes.push({
          type: mesTypes[i],
          typeid: +i + 1
        });
      }
    },
    // Methods we want to use in our application are registered here
    methods: {
      sendMessage: function() {
        if (this.message.author == '' || this.message.title == '') {
          this.showModal = true;
          this.modalHeaderMsg = "系统提示";
          this.modalBodyMsg = "请确定发送方、标题填写了内容！"
          return;
        }
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
          userid: '',
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
          newMessage.type = 'private';
          newMessage.userid = self.message.userid;
          self.Message.create(newMessage);
          this.Summary.findOne({
            userid: userid,
            typeid: typeid
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
            self.Summary.update(query, doc).exec();
            self.Summary.update(query, push, null, function(err, raw) {
              if (!err) {
                socket.emit('private message', mesContent);
              }
            });
          });
        } else { // public消息
          newMessage.type = 'public';
          self.Message.create(newMessage);
          this.Summary.find({
            typeid: typeid
          }, function(err, summaries) {
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
              self.Summary.update(query, doc).exec();
              self.Summary.update(query, push, null, function(err, raw) {
                if (!err) {
                  socket.emit('public message', mesContent);
                }
              });
            }
          });
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
              <option v-for="user in usernames" v-bind:value="user.userid">
                {{user.username}}
              </option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <input class="form-control" placeholder="标题" v-model="message.title">
        </div>

        <div class="form-group">
          <select class="form-control" v-model="message.typeid">
            <option v-for="msg in messageTypes" v-bind:value="msg.typeid">
              {{msg.type}}
            </option>
            <!-- <option value="1" selected>消息类型1</option>
            <option value="2">消息类型2</option>
            <option value="3">消息类型3</option>
            <option value="4">消息类型4</option>
            <option value="5">消息类型5</option>
            <option value="6">消息类型6</option> -->
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
  <modal :show.sync="showModal">
    <h6 slot="header">{{modalHeaderMsg}}</h6>
    <p slot="body">{{modalBodyMsg}}</p>
  </modal>
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
    width: 101%;
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

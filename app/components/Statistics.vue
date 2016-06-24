<script>
  var env_conf = require('../../config/env_development.json');
  var socket = require('socket.io-client')(env_conf.socketServerUrl);
  var marked = require('marked');
  marked.setOptions({
    renderer: new marked.Renderer(),
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: true,
    smartLists: true,
    smartypants: false
  });

  module.exports = {
    name: 'Statistics',
    data: function() {
      return {
        onlineCount: '',
        activeMessageid: '',
        searchQuery: '',
        messages: [],
        messageTitle: '',
        messageDesc: '',
        usernames: [],
        mescontent: false,
        messageUnreadCount: '',
        messageContent: ''
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
      });
      // 用户登录成功在线人数+1
      socket.on('onlineCountAdd', function(obj) {
        self.onlineCount = self.onlineCount + 1;
      });
      // 用户退出在线人数-1
      socket.on('onlineCountDel', function(obj) {
        self.onlineCount = self.onlineCount - 1;
      });
      // 获取所有message信息
      this.Message.find({}, function(err, messages) {
        for (var i in messages) {
          self.messages.push({
            title: messages[i].title,
            messageid: messages[i].id,
            content: marked(messages[i].content),
            messageType: messages[i].type
          });
        }
      });
    },
    methods: {
      messageDetail(messageid, content, title) {
        var self = this;
        this.messageContent = '';
        this.activeMessageid = messageid;
        this.messageTitle = title;
        this.messageContent = content;
        this.mescontent = true;
        this.usernames.splice(0, this.usernames.length);
        this.Summary.find({
          'message.id': messageid,
          'message.read': 'false'
        }, function(err, summaries) {
          self.messageUnreadCount = summaries.length;
          for (var i in summaries) {
            self.User.findOne({
              userid: summaries[i].userid
            }, function(err, user) {
              self.usernames.push({
                username: user.username
              });
            });
          }
        });
      }
    }
  }
</script>
<template id="statistics">
  <div>
    <!-- main body of our application -->
    <div class="content">
      <!-- add an message form -->
      <div class="panel panel-success">
        <div class="panel-heading">
          <span>数据统计</span>&emsp;&emsp;( 当前在线用户数: <span style="color: #ddd">{{onlineCount}} </span>)
        </div>
        <div class="panel-body">
          <div class="form-group search">
            <input type="text" value="" placeholder="搜索" class="form-control input-zd" v-model="searchQuery" />
          </div>
          <!-- <div class="form-group online-count">
            <p>当前在线人数: <span style="color:red">{{onlineCount}}</span></p>
          </div> -->
          <div class="form-group">
            <div class="row">
              <div class="col-md-3 col-sm-3">
                <ul class="dashboard-list">
                  <li v-for="message in messages |filterBy searchQuery in 'title' 'messageType' " class="statistics-list-item" @click="messageDetail(message.messageid, message.content, message.title)" :class="{'messagelist-active': activeMessageid == message.messageid}">
                    <header class="message-title">
                      <h6 v-if="message.title.length > 8">{{ message.title.substring(0,8) }} ...</h6>
                      <h6 v-else>{{ message.title }}</h6>
                    </header>
                  </li>
                </ul>
              </div>
              <div class="col-md-6 col-sm-6" v-if="mescontent">
                <div class="message-detail">
                  <h6>消息详情</h6>
                  <hr/>
                  <label>{{messageTitle.length > 14 ? messageTitle.substring(0,14) : messageTitle}}</label>
                  <div class="content">
                    {{{messageContent}}}
                  </div>
                </div>
              </div>
              <div class="col-md-3 col-sm-3" v-if="mescontent">
                <div class="read-detail">
                  <h6>读取详情</h6>
                  <hr/>
                  <label>以下用户未读 (<span style="color:red">{{messageUnreadCount}}</span>)</label>
                  <ul>
                    <li v-for="user in usernames">
                      {{user.username}}
                    </li>
                  </ul>
                </div>
              </div>
              <div v-if="!mescontent" class="empty-placeholder">请选择消息查看详情</div>
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
    margin-top: -20px;
    margin-bottom: -15px;
    border: 2px solid #ddd;
    border-radius: 5px;
    cursor: pointer;
    height: 438px;
    width: 205px;
    padding-bottom: 5px;
  }

  .statistics-list-item {
    clear: both;
    cursor: pointer;
    border-bottom: 1px solid #eee;
    list-style-type: none;
    line-height: 35px;
    color: #666;
    margin-left: -40px;
    padding-left: 15px;
    height: 35px;
  }

  .statistics-list-item:hover {
    color: #666;
    background-color: #eee;
  }

  .messagelist-active {
    color: #1ABC9C;
    background-color: #eee;
  }

  .messagelist-active:hover {
    color: #1ABC9C;
    background-color: #eee;
  }

  ul,
  ol {
    margin-bottom: 0px;
  }

  .message-title h6 {
    display: inline-block;
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }

  .message-desc {
    font-size: 14px;
    color: #666;
  }

  .message-detail {
    margin-top: -35px;
    margin-left: 3%;
    margin-right: 1%;
  }

  label {
    display: inline-block;
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }

  .message-detail label {
    color: #1ABC9C;
    margin-left: 23%;
    margin-bottom: 10px;
  }
  hr {
    margin-top: 10px;
    margin-bottom: 10px;
    border: 0;
    border-top: 1px solid #eee;
  }

  .read-detail {
    margin-top: -35px;
  }

  .input-zd {
    width: 205px;
    height: 36px;
  }

  .read-detail ul {
    overflow: auto;
    margin-bottom: -15px;
    /*border: 2px solid #ddd;*/
    /*border-radius: 5px;*/
    cursor: pointer;
    height: 360px;
    width: 240px;
    padding-top: 5px;
    padding-bottom: 5px;
  }

  .read-detail li {
    list-style-type: none;
    margin-left: -35px;
  }

  .empty-placeholder {
    -webkit-transform: translateY(-50%);
    -moz-transform: translateY(-50%);
    -ms-transform: translateY(-50%);
    -o-transform: translateY(-50%);
    transform: translateY(-50%);
    color: #658399;
    font-weight: bold;
    pointer-events: none;
    position: absolute;
    top: 50%;
    left: 12%;
    text-align: center;
    width: 100%;
  }

  .message-detail .content {
    height: 320px;
    overflow: auto;
  }

  .online-count {
    display: inline-block;
    width: 130px;

  }

  .search {
    display:inline-block;
    margin-bottom: 25px;
  }
</style>

<script>
  module.exports = {
    name: 'Feedback',
    data: function() {
      return {
        mescontent: false,
        feedbacks: [],
        activeFeedback: '',
        feedbackContent: '',
        feedbackUsername: '',
        feedbackTime: ''
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
        Feedback: ({
          global
        }) => global.Feedback
      }
    },

    ready: function() {
      var self = this;
      // 获取反馈信息
      this.Feedback.find({}, function(err, feedbacks) {
        for (var i in feedbacks) {
          self.feedbacks.push({
            userid: feedbacks[i].userid,
            time: feedbacks[i].created_time,
            content: feedbacks[i].feedback_desc
          });
        }
      });
    },
    methods: {
      feedbackDetail(userid, time, content) {
        var self = this;
        this.activeFeedback = time;
        this.mescontent = true;
        this.feedbackContent = content;
        this.feedbackTime = time;
        this.User.findOne({
          userid: userid
        }, function(err, user) {
          self.feedbackUsername = user.username;
        });
      }
    }
  }
</script>
<template>
  <div>
    <!-- main body of our application -->
    <div class="content">
      <!-- add an message form -->
      <div class="panel panel-success">
        <div class="panel-heading">
          <span>用户反馈</span>
        </div>
        <div class="panel-body">
          <div class="form-group">
            <div class="row">
              <div class="col-md-3 col-sm-3">
                <ul class="feedback-dashboard-list">
                  <li v-for="feedback in feedbacks" class="feedback-list-item" @click="feedbackDetail(feedback.userid, feedback.time, feedback.content)" :class="{'feedbacklist-active': feedback.time == activeFeedback}">
                    <header class="feedback-title">
                      <h6 v-if="feedback.content.length > 10">{{ feedback.content.substring(0,10) }}...</h6>
                      <h6 v-else>{{feedback.content}}</h6>
                    </header>
                  </li>
                </ul>
              </div>
              <div class="col-md-9 col-sm-9" v-if="mescontent">
                <div class="feedback-detail">
                  <h6>反馈详细信息</h6>
                  <hr/>
                  <div>
                    <p><span class="fa fa-user"></span> {{feedbackUsername}}&emsp;|&emsp;<span class="fa fa-clock-o"></span> {{feedbackTime}}</p>
                  </div>
                  <div class="feedback-content">
                    {{feedbackContent}}
                  </div>
                </div>
              </div>
              <div v-if="!mescontent" class="empty-placeholder">请选择反馈信息</div>
            </div>
          </div>
        </div>
      </div>
      <!-- show the messages -->
    </div>
  </div>
</template>
<style>
  .feedback-dashboard-list {
    overflow: auto;
    margin-bottom: -15px;
    border: 2px solid #ddd;
    border-radius: 5px;
    cursor: pointer;
    height: 470px;
    padding-bottom: 5px;
  }

  .feedback-list-item {
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
  .feedback-list-item:hover {
    color: #666;
    background-color: #eee;
  }

  .feedbacklist-active {
    color: #1ABC9C;
    background-color: #eee;
  }

  .feedbacklist-active:hover {
    color: #1ABC9C;
    background-color: #eee;
  }

  ul,
  ol {
    margin-bottom: 0px;
  }

  .feedback-title h6 {
    display: inline-block;
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }

  .feedback-detail {
    margin-top: -13px;
    margin-left: 10%;
    margin-right: 10%;
  }

  .feedback-content {
    height: 360px;
    overflow: auto;
  }
</style>

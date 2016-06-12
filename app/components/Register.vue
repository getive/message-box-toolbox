<script>
  // var env_conf = require('../../config/env_development.json');
  // var socket = require('socket.io-client')(env_conf.socketServerUrl);

  module.exports = {
    name: 'Register',
    data: function() {
      return {
        username: '',
        userid: '',
        password: '',
        RegisterForm: ''
      }
    },

    vuex: {
      getters: {
        User: ({
          global
        }) => global.User,
        Summary: ({
          global
        }) => global.Summary
      }
    },

    ready: function() {

    },
    methods: {
      onSubmit: function(e) {
        // validate manually
        this.registerForm.$submitted = true;

        if (this.registerForm.$invalid) {
          e.preventDefault();
        } else {
          this.register();
        }
      },
      register: function() {
        var self = this;
        this.User.find({}).sort({
          'id': 'asc'
        }).exec(function(err, users) {
          var newUser = {
            id: users[users.length - 1].id + 1,
            userid: self.userid,
            username: self.username,
            password: self.password,
            online_stat: false,
            login_time: '',
            last_login_time: '',
            socket_id: ''
          }
          self.User.create(newUser);
        });
        var newSummaries = {
          userid: this.userid,
          typeid: '',
          message: [],
          count: 0
        }
        for (var i = 1; i < 7; i++) {
          newSummaries.typeid = i;
          this.Summary.create(newSummaries);
        }
        // setTimeout(function() {
        //   self.username = '';
        //   self.userid = '';
        //   self.password = '';
        // }, 1000);
      }
    }
  }
</script>
<template id="register">
  <div>
    <!-- main body of our application -->
    <div class="content">
      <!-- add an message form -->
      <div class="panel panel-success">
        <div class="panel-heading">
          <span>用户创建</span>
        </div>
        <div class="panel-body">
          <div class="row">
            <div class="col-md-4"></div>
            <div class="col-md-4">
              <div class="register-form">
                <div class="register-border">
                  <form v-form name="registerForm" @submit.prevent="onSubmit">
                    <div class="form-group" :class="{'has-error': registerForm.$submitted && registerForm.username.$error.required}">
                      <input type="text" class="form-control" placeholder="用户名" v-model="username" name="username" v-form-ctrl required>
                      <label class="login-field-icon fui-user" for="login-name"></label>
                      <span class="notice pull-right" v-if="registerForm.$submitted && registerForm.username.$error.required">请输入用户名！</span>
                    </div>
                    <div class="form-group" :class="{'has-error': registerForm.$submitted && registerForm.userid.$error.required}">
                      <input type="text" class="form-control" placeholder="用户ID" v-model="userid" name="userid" v-form-ctrl required maxlength="16">
                      <label class="login-field-icon fui-credit-card" for="login-id"></label>
                      <span class="notice pull-right" v-if="registerForm.$submitted && registerForm.userid.$error.required">请输入用户ID</span>
                      <span class="notice pull-right" v-if="registerForm.$submitted && registerForm.userid.$error.maxlength">用户ID最大16位！</span>
                    </div>
                    <div class="form-group" :class="{'has-error': registerForm.$submitted && registerForm.password.$error.required}">
                      <input type="password" class="form-control" placeholder="密码" v-model="password" name="password" v-form-ctrl required maxlength="16">
                      <label class="login-field-icon fui-lock" for="login-pass"></label>
                      <span class="notice pull-right" v-if="registerForm.$submitted && registerForm.password.$error.required">请输入密码！</span>
                      <span class="notice pull-right" v-if="registerForm.$submitted && registerForm.password.$error.maxlength">密码最大16位！</span>
                    </div>
                    <button type="submit" class="btn btn-embossed btn-primary btn-lg btn-block">
                      创&emsp;&emsp;建
                    </button>
                  </form>
                </div>
              </div>
            </div>
            <div class="col-md-4"></div>
          </div>
        </div>
      </div>
      <!-- show the messages -->
    </div>
  </div>
</template>
<style>
  .login-field-icon {
    position: absolute;
    top: 3px;
    right: 15px;
    font-size: 16px;
    color: #bfc9ca;
    -webkit-transition: all .25s;
    transition: all .25s;
  }

  .register-form {
    margin: 100px 0px;
  }
</style>

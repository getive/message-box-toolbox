<script>
  import store from './vuex/store'
  import Login from './components/Login.vue'
  import Header from './components/Header.vue'
  import mongoose from 'mongoose'
  import env_conf from '../config/env_development.json'
  mongoose.connect(env_conf.db.uri, env_conf.db.options)
  import User from './vuex/models/userModel'
  import Summary from './vuex/models/summaryModel'
  import Message from './vuex/models/messageModel'
  import Feedback from './vuex/models/feedbackModel'
  import { setModel } from './vuex/actions'

  module.exports = {
    name: "App",

    store,

    data: function() {
      return {
        isLogin: true,
        userName: '',
        socket: ''
      }
    },

    vuex: {
      actions: {
        setModel
      }
    },

    ready: function() {
      this.setModel(User, Summary, Message, Feedback)
    },

    components: {
      Login,
      'dashboard-header': Header
    }
  }
</script>
<template>
  <div id="app">
    <div class="login-style animated fadeIn" v-if="!isLogin">
      <login :is-login.sync="isLogin" :user-name.sync="userName" :socket.sync="socket" keep-alive></login>
    </div>
    <div class="dashboard animated fadeIn" v-if="isLogin">
      <dashboard-header></dashboard-header>
      <router-view :is-login.sync="isLogin" :user-name.once="userName" :socket.sync="socket"></router-view>
    </div>
  </div>
</template>

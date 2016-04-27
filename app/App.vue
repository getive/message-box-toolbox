<script>
    var Login = require('./components/Login.vue')
    var Header = require('./components/Header.vue')

    module.exports = {
        name: "App",
        data: function() {
            return {
                isLogin: true,
                userName: '',
                socket: ''
            }
        },
        components: {
            Login,
            'dashboard-header': Header,
        }
    }
</script>
<template>
    <div class="login-style animated fadeIn" v-if="!isLogin">
        <login :is-login.sync="isLogin" :user-name.sync="userName" :socket.sync="socket" keep-alive></login>
    </div>
    <div class="dashboard animated fadeIn" v-if="isLogin">
        <dashboard-header></dashboard-header>
        <router-view :is-login.sync="isLogin" :user-name.once="userName" :socket.sync="socket"></router-view>
    </div>
</template>

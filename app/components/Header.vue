<script>
  module.exports = {
    name: 'Header'
  }
</script>
<template>
  <!-- navigation bar -->
  <nav class="navbar navbar-inverse ng-scope" role="navigation">
    <div class="navbar-header">
      <a class="navbar-brand" ui-sref="#">工具盒子</a>
    </div>
    <!-- 使用指令 v-link 进行导航。 -->
    <ul class="nav navbar-nav">
      <li>
        <a v-link="{ path: '/' }">首页</a>
      </li>
      <li>
        <a v-link="{ path: '/main' }"><i class="glyphicon glyphicon-plus"></i> 数据新增</a>
      </li>
      <li>
        <a v-link="{ path: '/statistics' }"><i class="glyphicon glyphicon-pencil"></i> 数据统计</a>
      </li>
      <li>
        <a v-link="{ path: '/register' }"><i class="fa fa-list-alt"></i> 用户创建</a>
      </li>
      <li>
        <a v-link="{ path: '/feedback' }"><i class="fa fa-file-text-o"></i> 用户反馈</a>
      </li>
    </ul>
  </nav>
</template>

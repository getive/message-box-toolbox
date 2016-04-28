<script>
  module.exports = {
    name: 'Statistics'
  }
</script>
<template id="statistics">
    <div id="statis">
        <!-- main body of our application -->
        <div class="container" id="messages">
            <!-- add an message form -->
            <div class="panel panel-info">
                <div class="panel-heading">
                    <span>数据统计</span>
                </div>
                <div class="panel-body">
                    <div class="form-group" style="display:inline-block;width:130px;">
                        <p>当前在线人数: <span style="color:red" id="onlineCount">0</span></p>
                    </div>
                    <div class=" search" style="display:inline-block">
                        <input type="text" value="" placeholder="搜索" class="form-control input-sm" v-model="searchQuery" />
                        
                    </div>
                    
                    <div class="form-group">
                        <div class="row">
                            <div class="col-md-3 col-sm-3">
                                <ul class="dashboard-list" id="onlineName">
                                    <li class="dashboard-list-item">Dongjiqiang</li>
                                    <li class="dashboard-list-item">Supeng</li>
                                    <li class="dashboard-list-item">xiaoluoboding</li>
                                    
                                </ul>
                            </div>
                            <div class="col-md-9 col-sm-9 message">
                                <h6>消息读取状态</h6>
                                <hr>
                                <div class="row msg">
                                    <div class="col-md-6 col-sm-6">
                                        <p>用户名: <span id="username"></span></p>
                                    </div>
                                    <div class="col-md-6 col-sm-6">
                                        <p>已读条数: <span id="allCount"></span></p>
                                    </div>
                                </div>
                                <hr>
                                <div class="row msg">
                                    <div class="col-md-6 col-sm-6">
                                        <div class="msg-types">
                                            <p>政策信息: <span id="msg1"></span></p>
                                            <p>业务通知: <span id="msg2"></span></p>
                                            <p>征集核定: <span id="msg3"></span></p>
                                        </div>
                                    </div>
                                    <div class="col-md-6 col-sm-6">
                                        <div class="msg-types">
                                            <p>发票领取: <span id="msg4"></span></p>
                                            <p>缴费通知: <span id="msg5"></span></p>
                                            <p>催缴通知: <span id="msg6"></span></p>
                                        </div>    
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
<style >
    .dashboard-list {
        overflow:auto;
        border:2px solid #bce8f1;
        border-radius:5px;
        cursor: pointer;
        height:300px;
    }
    .dashboard-list-item {
        clear: both;
        cursor: pointer;
        border-bottom:1px solid #ddd;
        list-style-type: none;
        font-size: 16px;
        line-height: 25px;
        color:#21304c;
        margin-left:-40px;
        padding-left: 15px;
    }
    .dashboard-list-item:hover {
        color:#31708f;
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
    }
    .search {
        margin-left: 20px;
    }
    input {
        border-width: 1px;
    }
</style>

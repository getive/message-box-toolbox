<script>
  module.exports = {
    name: 'Modal',
    props: {
      show: {
        type: Boolean,
        required: true,
        twoWay: true
      }
    }
  }
</script>
<template>
  <div class="modal-mask" v-show="show" transition="modal">
    <div class="modal-wrapper">
      <div class="modal-container">

        <div class="modal-header">
          <slot name="header">

          </slot>
        </div>

        <div class="modal-body">
          <slot name="body">

          </slot>
        </div>

        <div class="modal-footer">
          <slot name="footer">

            <button class="btn btn-success footer-btn"
              @click="show = false">
              关闭
            </button>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>
<style media="screen">
  .modal-mask {
    position: fixed;
    z-index: 9998;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, .5);
    display: table;
    transition: opacity .3s ease;
  }

  .modal-wrapper {
    display: table-cell;
    vertical-align: middle;
  }

  .modal-container {
    width: 340px;
    margin: 0px auto;
    padding: 0px 10px;
    background-color: #fff;
    border-radius: 2px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
    transition: all .3s ease;
    font-family: Helvetica, Arial, sans-serif;
  }

  .modal-header {
    padding: 0px;
    border-bottom: 1px solid #e5e5e5;
  }

  .modal-footer {
    padding: 10px !important;
    text-align: left;
    border-top: 1px solid #e5e5e5;
  }

  .modal-header h6 {
    margin-top: 12px;
    color: #42b983;
  }

  .modal-body {
    margin: 0 !important;
    position: relative;
    padding: 6px;
  }

  .modal-default-button {
    float: right;
  }

  /*
  * the following styles are auto-applied to elements with
  * v-transition="modal" when their visiblity is toggled
  * by Vue.js.
  *
  * You can easily play with the modal transition by editing
  * these styles.
  */

  .modal-enter, .modal-leave {
    opacity: 0;
  }

  .modal-enter .modal-container,
  .modal-leave .modal-container {
    -webkit-transform: scale(1.1);
    transform: scale(1.1);
  }

  .footer-btn {
    float: right;
    padding: 6px 11px;
  }
</style>

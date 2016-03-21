// 引入
var gulp = require('gulp'),
    childProcess = require('child_process'),
    electron = require('electron-prebuilt');

// 创建任务
gulp.task('run', function() {
    childProcess.spawn(electron, ['./'], {
        stdio: 'inherit'
    });
});
'use strict';

var electron = require('electron');
// Module to control application life.
var app = electron.app;
// Module to create native browser window.
var BrowserWindow = electron.BrowserWindow;

// initiate socket.io server
// var io = require('socket.io').listen(3000);

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow;

function createWindow () {
    // Create the browser window.
    mainWindow = new BrowserWindow({width: 800, height: 600});

    // and load the index.html of the app.
    mainWindow.loadURL('file://' + __dirname + '/app/app.html');

    // Open the DevTools.
    // mainWindow.webContents.openDevTools();

    // io.on('connection', function (socket) {
    //     socket.on('login', function (data) {
    //         logData(data);
    //     })
    //     // Send data to client
    //     socket.emit('welcome', "server: 欢迎登陆");
    //     // wait for the event raised by the client
    //     socket.on('new message',function(data) {
    //         logData(data);
    //         socket.broadcast.emit('message',data);
    //     });
    // });

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

function logData (message) {
    var date = new Date();
    var time = "[" + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "]";
    console.log(time + message);
}

'use strict';

var app = require('app');
var BrowserWindow = require('browser-window');
const electron = require('electron');
var mainWindow = null;
var http = require('http');
var fs = require('fs');
var jsonfile = require('jsonfile');
var jsonDestFile = "C:\\CetDev\\version6.5\\home\\custom\\hni\\data\\userInfo\\seating.json";
var mkdirp = require("mkdirp");
var path = require("path");

var download = function (url, dest, cb) {
    var file = fs.createWriteStream(dest);
    var request = http.get(url, function (response) {
        response.pipe(file);
        file.on('finish', function () {
            file.close(cb);  // close() is async, call cb after close completes.
        });
    }).on('error', function (err) { // Handle errors
        fs.unlink(dest); // Delete the file async. (But we don't check the result)
        if (cb) cb(err.message);
    });
};

const ipcMain = electron.ipcMain;

app.on('ready', function () {
    mainWindow = new BrowserWindow({
        height: 800,
        width: 1200
    });

    ipcMain.on("confsave-readytogo", function(e, args) {
      fs.readFile(jsonDestFile, "utf-8", function(err, content) {
        if(err) return;
        var configuration = JSON.parse(content);
        e.sender.send('confsave-setconfiguration', configuration);
      });
    });

    ipcMain.on("confsave-save", function (e, configurations) {
      mkdirp(path.dirname(jsonDestFile), function(){
        configurations.forEach(function (item, i) {
            var imageUrl = "http://skuapp.azurewebsites.net/image/" + item.sku + "?size=50";
            var imageFileName = item.sku + ".png";
            var imageDestFile = "C:\\CetDev\\version6.5\\home\\custom\\hni\\" + imageFileName;

            if (!fs.existsSync(imageDestFile)) {
                download(imageUrl, imageDestFile, function () {

                });
            }

            item.image = imageFileName;
        });

        jsonfile.writeFile(jsonDestFile, configurations, function (err) {
            console.error(err);
        });
      });

    });

    console.log("eita");

    mainWindow.loadURL('file://' + __dirname + '/index.html');






});

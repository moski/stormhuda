"use strict";
var // Defining Modules
  express = require('express'),
  http = require("http"),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  methodOverride = require('method-override'),
  app = express(),
  redis = require("redis"),
  yaml = require('yamljs');

/*
var env = 'development';

if (typeof (process.argv[2]) != 'undefined') {
  if (typeof (config[process.argv[2]]) != 'undefined') {
    env = process.argv[2];
  }
}*/

var config = yaml.load("../config/app_config.yml");
app.set("redis_config", config.redis);
app.set("global_config", {
  "channel": config.redis_keys.global.pubsub.list,
  "counter": config.redis_keys.global.pubsub.counter,
  "list": config.redis_keys.global.key,
  "type": "all"
});
app.set("twitter_config", {
  "channel": config.redis_keys.tweets.pubsub.list,
  "counter": config.redis_keys.tweets.pubsub.counter,
  "list": config.redis_keys.global.key,
  "type": "tweets"
});

app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users
app.use(morgan('dev')); // log every request to the console
app.use(bodyParser()); // pull information from html in POST
app.use(methodOverride()); // simulate DELETE and PUT

// call the Router
var IndexCtrl = require("./controllers/index");

app.get('/', IndexCtrl.all);
app.get('/twitter', IndexCtrl.twitter);


var io = require('socket.io').listen(app.listen(3700));

var RedisListener = require("./modules/RedisListener.js");

console.log(app.get("global_config"));

var allPostsListner = new RedisListener(
  app.get("redis_config"),
  app.get("global_config")
)
allPostsListner.emitNewMessagesTo(io.sockets);

io.sockets.on('connection', function (socket) {
  socket.on("subscribe", function (data_type) {
    socket.join(data_type);
    console.log("user connecting to "+data_type);
  });

});
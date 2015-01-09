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


var config = yaml.load("../config/app_config.yml");

var env = 'development';

if (typeof (process.argv[2]) != 'undefined') {
  if (typeof (config.app[process.argv[2]]) != 'undefined') {
    env = process.argv[2];
  }
}

app.set("env", env);
app.set("app_config", config.app[env]);

console.log("Application Enviroment : " + env);

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
  "list": config.redis_keys.twitter.key,
  "type": "tweets"
});

app.set("instagram_config", {
  "channel": config.redis_keys.instagram.pubsub.list,
  "counter": config.redis_keys.instagram.pubsub.counter,
  "list": config.redis_keys.instagram.key,
  "type": "instagram"
});


app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users
app.use(morgan('dev')); // log every request to the console
app.use(bodyParser()); // pull information from html in POST
app.use(methodOverride()); // simulate DELETE and PUT

//Attach app settings to the response object ,so controllers can use what is needed
app.use(function (req, res, next) {
  res.appSettings = app.settings;
  next();
});

// call the Router
var IndexCtrl = require("./controllers/index");

app.get('/:type?/:start?/:count?/:output_type?', IndexCtrl.get);

app.listen(app.get("app_config")['port']);
console.log("Express is working in port" , app.get("app_config")['port']);

console.log("Socket.io is working in port" , app.get("app_config")['socket_port']);
var io = require('socket.io').listen(app.get("app_config")['socket_port']);

var RedisListener = require("./modules/RedisListener.js");

console.log(app.get("global_config"));

var allPostsListner = new RedisListener(
  app.get("redis_config"),
  app.get("global_config")
)
allPostsListner.emitNewMessagesTo(io.sockets);

//Filter : twitter posts
var twitterPostsListner = new RedisListener(
  app.get("redis_config"),
  app.get("twitter_config")
)

var instagramPostsListner = new RedisListener(
  app.get("redis_config"),
  app.get("instagram_config")
)

twitterPostsListner.emitNewMessagesTo(io.sockets);
instagramPostsListner.emitNewMessagesTo(io.sockets);

app.set("all_posts_listner", allPostsListner);
app.set("twitter_listner", twitterPostsListner);
app.set("instagram_listner", instagramPostsListner);


io.sockets.on('connection', function (socket) {
  socket.on("subscribe", function (data_type) {
    socket.join(data_type);
  });

});

var redis = require("redis");

var counter = 0;
setInterval(function () {
  pub.publish("huda", "Message number : " + counter);
  counter++;
}, 1000);

var socketio = require('socket.io');

// Listen on port 3636
var io = socketio.listen(3636);

io.sockets.on('connection', function (socket) {

  // Broadcast a user's message to everyone else in the room
  socket.on('send', function (data) {
    io.sockets.emit('message', data);
  });

  var sub = redis.createClient();
  var pub = redis.createClient();

  sub.subscribe("huda");

  sub.on("message", function (channel, message) {
    io.sockets.emit('message', "A message from " + channel + " : " + message);
    console.log("A message from " + channel + " : " + message);
  });


});
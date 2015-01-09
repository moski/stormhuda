"use strict";
var redis = require("redis");
/**
 * A module to handle redis connection for a specifc type of data configured by redis channel , redis key counter and redis list to archive data
 * @param mixed redis_config redis db configuration
 * @param mixed listener_config redis listener configuration
 */
var RedisListener = function (redis_config, listener_config) {

  this.redisConfig = redis_config;

  //Data type
  this.type = listener_config.type || null;
  //redis channel
  this.channel = listener_config.channel || null;

  //redis key counter
  this.counter = listener_config.counter || null;

  //redis list 
  this.list = listener_config.list || null;
  var $this = this;



  //io sockets object to emit messages fron specified redis channel
  this.io_sockets = null;

  var realtime_client = redis.createClient();
  var normal_client = redis.createClient();

  if (this.redisConfig && this.redisConfig.db) {
    normal_client.select(this.redisConfig.db);
    console.log("Connecting to redis db  " + this.redisConfig.db);
  }

  realtime_client.subscribe(this.channel);

  this.emitNewMessagesTo = function (io_sockets) {
    this.io_sockets = io_sockets;
  }

  //Emeit messages to sockets subsribed once retrieved 
  realtime_client.on("message", function (channel, message) {
    if ($this.io_sockets) {
      console.log($this.type, message);
      $this.io_sockets.in($this.type).emit('message', message);
    }
  });

  /**
   * Get counter value
   * @param function callback
   **/
  this.getCounter = function (next) {
    if (this.counter) {
      normal_client.get(this.counter, function (err, counter) {
        if (err) {
          next(err, 0);
        } else {
          next(null, counter);
        }
      });
    }
  };


  /**
   * For paging purposes
   * @param integer start of list
   * @param integer length of the list
   * @param function callback
   **/
  this.getRows = function (start, length, next) {
    if (this.list) {
      start = start || 0;
      length = length || 10;
      normal_client.lrange(this.list, start, length, function (err, rows) {
        if (!err) {
          next(null, rows);
        } else {
          next(err, []);
        }
      });
    }
  }


};

module.exports = RedisListener;
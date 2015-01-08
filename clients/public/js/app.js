var App = function (host, port, type) {
 this.host = host;
 this.port = port;
 this.type = type;
 this.index = 0;
 this.count = 20;
 this.unviewedPosts = [];
 this.cardTpl = null;

 //Private functions
 var $this = this;

 var render_realtime_card = function (data) {
  if ($(".card[data-id='" + data.id + "']").length > 0) {
   //If the card already exists ignore it
   return;
  }
  var rendered = Mustache.render($this.cardTpl, parse_post(data));
  $("#stream").prepend(rendered);
  $("#new_posts_counter").html($this.unviewedPosts.length);
  scrollTop();
 }
 var render_archived_card = function (data) {
  if ($(".card[data-id='" + data.id + "']").length > 0) {
   //If the card already exists ignore it
   return;
  }
  var rendered = Mustache.render($this.cardTpl, parse_post(data));
  $("#stream").append(rendered);
  $("#new_posts_counter").html($this.unviewedPosts.length);

 }


 function scrollTop() {
  window.scrollTo(0, 0);
 }


 function element_in_scroll(elem) {
  var docViewTop = $(window).scrollTop();
  var docViewBottom = docViewTop + $(window).height();

  var elemTop = $(elem).offset().top;
  var elemBottom = elemTop + $(elem).height();

  return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
 }



 var parse_post = function (post) {
  var parsed_post = {
   "title": "",
   "body": post.title,
   "img": post.medias ? post.medias[0] : "",
   "id": post.id,
   "source": post.service_uri,
   "type": post.type
  }

  return parsed_post;
 }


 var post_factory = function (posts) {
  var res = []
  for (var i = 0; i < posts.length; i++) {
   var post_unified = {
    "title": "",
    "body": posts[i].title,
    "img": posts[i].medias[0],
    "id": posts[i].id,
    "source": posts[i].service_uri,
    "type": posts[i].type,
    "username": posts[i].username
   }
   res.push(post_unified)
  }
  return res;
 }

 var render_new_posts = function (posts, append) {
  console.log("rendering new_posts: ", posts.length);
  var len = posts.length;
  for (var i = 0; i < len; i++) {
   var post = posts.shift();
   var rendered = Mustache.render($this.cardTpl, post);
   if (append) {
    $("#stream").append(rendered);
   } else {
    $("#stream").prepend(rendered);
   }

  }
 }

 var show_new = function (e) {
  var len = $this.unviewedPosts.length;
  for (var i = 0; i < len; i++) {
   var post = $this.unviewedPosts.shift();
   render_realtime_card(post);
  }
  e.preventDefault();
  return false;
 }

 var show_more = function (e) {
  $this.index = $this.count + $this.index;
  var stop = $this.index + $this.count;
  $.get("/" + $this.type + "/" + $this.index + "/" + stop + "/json", function (posts) {
   if (posts) {
    posts = JSON.parse(posts);
    var len = posts.length;
    for (var i = 0; i < len; i++) {
     var post = posts.shift();
     render_archived_card(post);
    }
   }
  });
  return false;
 }

 this.init = function (posts, index, count) {
  this.index = index;
  this.count = count;

  $(document).ready(function () {
   $.get("/views/card.tpl.html", function (tpl) {

    $this.cardTpl = tpl;

    //Render preloaded data
    if (posts) {
     var len = posts.length;
     for (var i = 0; i < len; i++) {
      var post = posts.shift();
      render_archived_card(post);
     }
    }
    var socket = io.connect('http://' + $this.host + ':' + $this.port);
    socket.on('connect', function () {
     socket.emit('subscribe', this.type);
    });

    socket.on('message', function (message) {
     var post = JSON.parse(message);
     var post_unified = {
      "title": "",
      "body": post.title,
      "img": post.medias[0],
      "id": post.id,
      "source": post.service_uri,
      "type": post.type
     }
     $this.unviewedPosts.push(post_unified);
     $("#new_posts_counter").html($this.unviewedPosts.length);
    });
   });

   $("#show_new").click(show_new);
   $("#show_more").click(show_more);


   setInterval(function () {
    if ($this.unviewedPosts.length > 0) {
     $("#new_posts").show();
    } else {
     $("#new_posts").hide();
    }
   }, 500);

   $(window).scroll(function () {
    if (Math.ceil($(window).scrollTop()) == $(document).height() - $(window).height()) {
     show_more();
    }
   });



  });

 }


}
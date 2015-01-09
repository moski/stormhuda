var App = function (host, port, type) {
 this.host = host;
 this.port = port;
 this.type = type;
 this.index = 0;
 this.count = 20;
 this.unviewedPosts = [];
 this.cardTpl = null;
 this.cardTplInstagramImage = null;
 this.originalTitle = "";

 //Private functions
 var $this = this;


 var linking = function (tweet) {
  var twit = tweet.replace(/(https?:\/\/([-\w\.]+)+(:\d+)?(\/([\w\/_\.]*(\?\S+)?)?)?)/ig, '<a href="$1" target="_blank" title="Visit this link">$1</a>')
   .replace(/#([a-zA-Z0-9_]+)/g, '<a href="https://twitter.com/search?q=%23$1&amp;src=hash" target="_blank" title="Search for #$1">#$1</a>')
   .replace(/@([a-zA-Z0-9_]+)/g, '<a href="https://twitter.com/$1" target="_blank" title="$1 on Twitter">@$1</a>');

  return twit;
 }


 var render_realtime_card = function (data) {
  if ($(".card[data-id='" + data.id + "']").length > 0) {
   //If the card already exists ignore it
   return;
  }
  
  var parsed_data = parse_post(data);
  var rendered = Mustache.render(get_template(parsed_data), parsed_data);
  $("#stream").prepend(rendered);
  $("#new_posts_counter").html($this.unviewedPosts.length);
  scrollTop();
 }
 var render_archived_card = function (data) {
  if ($(".card[data-id='" + data.id + "']").length > 0) {
   //If the card already exists ignore it
   return;
  }
  
  var parsed_data = parse_post(data);
  
  var rendered = Mustache.render(get_template(parsed_data), parsed_data);
  $("#stream").append(rendered);
  set_new_posts_counter();
 }

 function get_template(post){
   if(post.type == 'insta_image'){
     return $this.cardTplInstagramImage;
   }else{
     return $this.cardTpl;
   }
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
   "body": twttr.txt.autoLink(post.title),
   "img": post.medias ? post.medias[0] : "",
   "id": post.id,
   "source": post.service_uri,
   "type": post.type,
   "username": post.username
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
   if (ga) {
    ga('send', 'pageview', {
     'page': '/' + $this.type,
     'title': 'More of Type ' + $this.type
    });
   }

  });
  return false;
 }

 function set_new_posts_counter() {
  var len = $this.unviewedPosts.length;
  $("#new_posts_counter").html(len);
  set_title(len);
 }

 function set_title(post_number) {
  if (post_number > 0) {
   document.title = $this.originalTitle + " (" + post_number + ") ";
  } else {
   document.title = $this.originalTitle;
  }
 }


 this.init = function (posts, index, count) {
  this.index = index;
  this.count = count;

  this.originalTitle = document.title;

  $(document).ready(function () {
   
    var t1 = $.get("/views/card.tpl.html", function(tpl){$this.cardTpl = tpl;});
    var t2 = $.get("/views/card_instagram_image.tpl.html", function(tpl){$this.cardTplInstagramImage = tpl;});
   
   
   $.when(t1, t2).done(function(){

    //$this.cardTpl = tpl;

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
     socket.emit('subscribe', $this.type);
    });

    socket.on('message', function (message) {
     var post = JSON.parse(message);

     $this.unviewedPosts.push(post);
     set_new_posts_counter();
    });
   });

   $("#new_posts").click(show_new);
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
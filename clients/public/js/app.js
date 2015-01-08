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
      if ($(".card[data-id='" + data.id +"']").length > 0) {
         //If the card already exists ignore it
         return;
      }
      var rendered = Mustache.render($this.cardTpl, parse_post(data));
      $("#cards").prepend(rendered);
      $("#new_posts_counter").html($this.unviewedPosts.length);
      relayout();

   }
   var render_archived_card = function (data) {
      if ($(".card[data-id='" + data.id +"']").length > 0) {
         //If the card already exists ignore it
         return;
      }
      var rendered = Mustache.render($this.cardTpl, parse_post(data));
      $("#cards").append(rendered);
      $("#new_posts_counter").html($this.unviewedPosts.length);
      relayout();
   }

   var relayout = function () {
      return;
      /*
      var $container = $('#cards');
      $container.isotope({
         itemSelector: '.item',
         layoutMode: 'masonry',
         isOriginLeft: false
      });*/

   }

   var parse_post = function (post) {
      var parsed_post = {
         "title": "",
         "body": post.title,
         "img": post.medias[0],
         "id": post.id,
         "source": post.service_uri,
         "type": post.type
      }

      return parsed_post;
   }

   //Show new posts
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
      e.preventDefault();
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
               this.unviewedPosts.push(post_unified);
               $("#new_posts_counter").html(this.unviewedPosts.length);
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


         //Cards arrangment

         relayout();



      });

   }

}
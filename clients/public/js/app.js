   var card_tpl = "";
   var unviewed_posts = [];

   var show_new = function (e) {
      var len = unviewed_posts.length;
      for (var i = 0; i < len; i++) {
         var post = unviewed_posts.shift();
         console.log(unviewed_posts.length);
         var rendered = Mustache.render(card_tpl, post);
         $("#cards").prepend(rendered);
         $("#new_posts_counter").html(unviewed_posts.length);

      }
      var $container = $('.portfolio-wrapper');
      $container.isotope({
         // update columnWidth to a percentage of container width
         masonry: {}
      });
      e.preventDefault();
      return false;
   }
   window.onload = function () {

      var messages = [];
      var socket = io.connect('http://localhost:3700');
      socket.on('connect', function () {
         socket.emit('subscribe', "all");
      });
      setInterval(function () {
         if (unviewed_posts.length > 0) {
            $("#new_posts").show();

         } else {
            $("#new_posts").hide();

         }
      }, 500);

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
         unviewed_posts.push(post_unified);
         $("#new_posts_counter").html(unviewed_posts.length);

      });
   }

   $(document).ready(function () {
      // Fetch card template

      $.get("/views/card.tpl.html", function (data) {
         card_tpl = data;
      });




      /*
      setInterval(function () {
         var cards = $(".cards");

         if (cards.length > 200) {
            //Remove earliest 100 blocks to keep the page from hanging
            for (var i = cards.length - 1; i >= 0; i--) {
               $(cards[i]).remove();
            }
         }
      }, 5000); // each 5 mins
*/


   })
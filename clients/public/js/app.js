   var card_tpl = "";
   var unviewed_posts = [];
   
   
   var post_factory = function(posts){
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
   
   var render_new_posts = function(posts, append){
     console.log("rendering new_posts: ", posts.length);
     var len = posts.length;
     for (var i = 0; i < len; i++) {
        var post = posts.shift();
        console.log(card_tpl);
        var rendered = Mustache.render(card_tpl, post);
        if(append){
          $("#stream").append(rendered);
        }else{
          $("#stream").prepend(rendered);
        }
        
     }
   }
   
   
   var show_new = function (e) {
      var len = unviewed_posts.length;
      for (var i = 0; i < len; i++) {
         var post = unviewed_posts.shift();
         console.log(post);
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
            "type": post.type,
            "username": post.username
         }
         unviewed_posts.push(post_unified);
         $("#new_posts_counter").html(unviewed_posts.length);
         render_new_posts(unviewed_posts);
      });
   }
   
   
   function element_in_scroll(elem){
       var docViewTop = $(window).scrollTop();
       var docViewBottom = docViewTop + $(window).height();
 
       var elemTop = $(elem).offset().top;
       var elemBottom = elemTop + $(elem).height();
 
       return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
   }
   
   function init_scroll(){
     $(document).scroll(function(e){
         if (element_in_scroll("ol#stream li:last")) {
                 $(document).unbind('scroll');
                 $.ajax({
                     type: "GET",
                     url: document.location.href,
                     data: { start :$('#next').attr('value'), json: "true" }
                 }).done(function( data ) {
                   console.log(data);
                     $('#next').attr('value',data.next);
                     fac_data = post_factory(data.posts);
                     render_new_posts(fac_data, true)
                     if (data.next.length != 0) {
                       init_scroll();
                     }
                 });
             };
     });
   }
   
   
   
   
   
   
   


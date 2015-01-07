var IndexCtrl = {
  all : function(req , res){
    
    var start = (req.query.start) ? parseInt(req.query.start) : 0
    var end   = start + 11
        
    req.app.get('redis').lrange(req.app.get('global_config').list,start , end, function (err, posts){
      
      for(i = 0; i < posts.length; i++){
        posts[i] = JSON.parse(posts[i]);
      }
      
      if(req.query.json){
        res.json({next: end,posts: posts})
      }else{
        res.render("cards1", { next: end,posts: posts});
      }
    })
  },
  twitter : function(req , res){
    
  },
  facebook : function(req , res){
    
  },
  instagram : function(req , res){
    
  }
}

module.exports = IndexCtrl;
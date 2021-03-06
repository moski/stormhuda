var IndexCtrl = {
  get: function (req, res) {
    var type = "all",
      output_type = "html",
      start = 0,
      count = 20;
    if (req.params.type) {
      type = req.params.type;
    }
    if (req.params.start) {
      start = req.params.start;
    }
    if (req.params.count) {
      count = Math.abs(req.params.count);
      if (count > 100) {
        count = 20;
      }
    }
    if (req.params.output_type) {
      output_type = req.params.output_type;
    }
    get_posts_by_type(res, type, start, count, function (err, posts) {
      var parsed_posts = [];
      for (var p = 0; p < posts.length; p++) {
        parsed_posts.push(JSON.parse(posts[p]));
      }

      if (output_type == 'json') {
        res.send(JSON.stringify(parsed_posts));
      } else {
        res.render("cards", {
          host: res.appSettings['app_config']['host'] || "localhost",
          type: type,
          port: res.appSettings['app_config']['socket_port'],
          posts: parsed_posts,
          pageIndex: start,
          itemsCount: count,
          env: res.appSettings['evn']
        });
      }
    });
  }
}

var get_posts_by_type = function (res, type, index, count, next) {
  var listenr;

  console.log(type)

  switch (type) {
  case 'tweets':
    listenr = res.appSettings['twitter_listner'];
    break;
  case 'instagram':
    listenr = res.appSettings['instagram_listner'];
    break;
  default:
    listenr = res.appSettings['all_posts_listner'];
    break;
  }

  listenr.getRows(index || 0, count || 20, function (err, rows) {
    next(err, rows);
  });
}

module.exports = IndexCtrl;
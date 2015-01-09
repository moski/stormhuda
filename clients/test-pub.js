var inst = {
  "title": "-\n.\n.\n\nالآن بث موّحد على قنوات الدوله لحملة #تراحموا .\n\nتذكر ان المال هو مال الله، والمال جُعل في يد الإنسان أمانه، فإذا رحل، لم يرحل معه شيء سوى المال الذي أنفقه في الصدقه. .\n\nومن تصدّق بشق تمره، فإن الله يربيها له حتى تصبح له كالجبل يوم القيامه !\n\nساهم ولو بجزء بسيط في درء البرد عنهم، لا تظن ان المبلغ بسيط فتستحي، قال النبي ﷺ: سبق درهم مئة الف درهم",
  "id": "894072241172488247_240022023",
  "medias": ["http://scontent-a.cdninstagram.com/hphotos-xfa1/t51.2885-15/10932317_957203737642502_1802595112_n.jpg"],
  "urls": [],
  "service_uri": "http://instagram.com/p/xoYfdin6A3/",
  "username": "missvirus_8",
  "created_at": "1420801738",
  "type": "insta_image"
};

var redis = require("redis");
var pub = redis.createClient();

pub.publish("pubsub_tweets_list" , JSON.stringify(inst));

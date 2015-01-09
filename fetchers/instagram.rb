require 'bundler/setup'
Bundler.require(:default)
Bundler.require(:instagram)
require 'yaml'
require 'json'

require_relative 'representers/instagram_representer'

require_relative 'storage/base'
require_relative 'storage/insta'

require_relative 'extends/hash'

instagram_config = YAML.load_file('../config/keys_config.yml')['instagram']

# Load app configuration such as redis information and 
# hashtags
app_config = YAML.load_file('../config/app_config.yml')


Instagram.configure do |config|
  config.client_id = instagram_config["client_id"]
  config.client_secret = instagram_config["client_secret"]
end
=begin
topics = app_config["hashtags"]["twitter"]
topics.map! {|x| x.strip}

tag = topics.sample

data = Instagram.tag_recent_media(URI.escape(tag), count: 1).first
if (data['type'] != 'video')
  x = Storage::Insta.new.extend(InstagramRepresenter).from_hash(data.to_hash)
  puts x.to_json
else
  "ignore video"
end
hash = {"attribution"=>nil, "videos"=>{"low_bandwidth"=>{"url"=>"http://scontent-a.cdninstagram.com/hphotos-xfa1/t50.2886-16/10931753_958470244182785_1493057452_s.mp4", "width"=>480, "height"=>480}, "standard_resolution"=>{"url"=>"http://scontent-a.cdninstagram.com/hphotos-xaf1/t50.2886-16/10919853_1421112778180627_524311678_n.mp4", "width"=>640, "height"=>640}, "low_resolution"=>{"url"=>"http://scontent-a.cdninstagram.com/hphotos-xfa1/t50.2886-16/10931753_958470244182785_1493057452_s.mp4", "width"=>480, "height"=>480}}, "tags"=>["platinum", "laprima", "silk_tulle", "custom_made", "swarovski", "lovejo", "silk_satin", "elegant", "haute_couture", "jordan", "coture", "amman", "metallic_silver"], "location"=>nil, "comments"=>{"count"=>0, "data"=>[]}, "filter"=>"Stinson", "created_time"=>"1420820064", "link"=>"http://instagram.com/p/xo7ciwiZeV/", "likes"=>{"count"=>0, "data"=>[]}, "images"=>{"low_resolution"=>{"url"=>"http://scontent-a.cdninstagram.com/hphotos-xaf1/t51.2885-15/10903348_333523750173847_423709865_a.jpg", "width"=>306, "height"=>306}, "thumbnail"=>{"url"=>"http://scontent-a.cdninstagram.com/hphotos-xaf1/t51.2885-15/10903348_333523750173847_423709865_s.jpg", "width"=>150, "height"=>150}, "standard_resolution"=>{"url"=>"http://scontent-a.cdninstagram.com/hphotos-xaf1/t51.2885-15/10903348_333523750173847_423709865_n.jpg", "width"=>640, "height"=>640}}, "users_in_photo"=>[], "caption"=>{"created_time"=>"1420820064", "text"=>"#Haute_Couture #Laprima #Coture #custom_made #Swarovski #silk_satin #silk_tulle #Platinum #metallic_silver #Amman #Jordan #LoveJo #Elegant", "from"=>{"username"=>"la.prima", "profile_picture"=>"https://igcdn-photos-c-a.akamaihd.net/hphotos-ak-xpf1/t51.2885-19/10471962_1482407188663658_1200498559_a.jpg", "id"=>"1395180612", "full_name"=>"La prima haute couture"}, "id"=>"894225972780963549"}, "type"=>"video", "id"=>"894225972244092821_1395180612", "user"=>{"username"=>"la.prima", "website"=>"", "profile_picture"=>"https://igcdn-photos-c-a.akamaihd.net/hphotos-ak-xpf1/t51.2885-19/10471962_1482407188663658_1200498559_a.jpg", "full_name"=>"La prima haute couture", "bio"=>"", "id"=>"1395180612"}}
=end




# Create and connect a redis client.
$redis = Redis.new(
  host: app_config["redis"]["host"], 
  port: app_config["redis"]["port"], 
  db: app_config["redis"]["db"])


get "/process_subscription/" do
  puts params["hub.challenge"] if params["hub.challenge"]
end

post '/process_subscription/*' do
  Instagram.process_subscription(request.body) do |handler|
    handler.on_tag_changed do |tag,payload|
      data = Instagram.tag_recent_media(URI.escape(tag), count: 1).first
      media = Storage::Insta.new.extend(InstagramRepresenter).from_hash(data.to_hash)
      media.save!($redis)
    end
  end
  :ok
end
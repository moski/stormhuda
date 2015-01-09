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
=end

get "/process_subscription/" do
  puts params["hub.challenge"] if params["hub.challenge"]
end

post '/process_subscription/*' do
  Instagram.process_subscription(request.body) do |handler|
    handler.on_tag_changed do |tag,payload|
      puts tag
      puts payload
      data = Instagram.tag_recent_media(URI.escape(tag), count: 1)
      if (data['type'] != 'video')
        media = Storage::Insta.new.extend(InstagramRepresenter).from_hash(data.to_hash)
        puts media.to_json
      else
        "ignore video"
      end
    end
  end
  :ok
end
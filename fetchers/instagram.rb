require 'bundler/setup'
Bundler.require(:default)
Bundler.require(:instagram)
require 'yaml'

require_relative 'representers/tweet_representer'

require_relative 'storage/base'

instagram_config = YAML.load_file('../config/keys_config.yml')['instagram']

# Load app configuration such as redis information and 
# hashtags
app_config = YAML.load_file('../config/app_config.yml')


Instagram.configure do |config|
  config.client_id = instagram_config["client_id"]
  config.client_secret = instagram_config["client_secret"]
end


get "/process_subscription" do
  if params["hub.challenge"]
    puts "I am processing the chanlleg #{params["hub.challenge"]}"
    params["hub.challenge"].to_s
  else
    #puts "I got a record from instagram: #{params.inspect}"
    #render :text => "done"
  end
end

get "/oauth/connect" do
  redirect Instagram.authorize_url(:redirect_uri => "http://104.46.62.121/oauth/callback")
end

# 3a08aad42703436fa92da6068c119249
get "/oauth/callback" do
  response = Instagram.get_access_token(params[:code], :redirect_uri => "http://104.46.62.121/oauth/callback")
  response.access_token
  puts 
end

topics = app_config["hashtags"]["twitter"]
topics.map! {|x| x.strip}

opts = {:object_id => topics.first, :client_secret => instagram_config["client_secret"]}

puts opts

callback_url = 'http://104.46.62.121/3000/process_subscription/'
client = Instagram.client(:access_token => "1420305442.dab9366.72be3ef19a4546b3acd6dc475938a5cf")
client.create_subscription('tag', callback_url , aspect = 'media', opts)
#Instagram.create_subscription('tag', callback_url , aspect = 'media', opts)
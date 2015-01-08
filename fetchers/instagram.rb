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
    render :text => params["hub.challenge"]
  else
    puts "I got a record from instagram: #{params.inspect}"
    render :text => "done"
  end
end

topics = app_config["hashtags"]["twitter"]
topics.map! {|x| x.strip}

opts = {:object_id => topics.first}

puts opts

callback_url = 'http://104.46.62.121/3000/process_subscription/'
Instagram.create_subscription('tag', callback_url , aspect = 'media', options)
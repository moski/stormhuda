require 'bundler/setup'
Bundler.require(:default)
require 'yaml'

require_relative 'representers/tweet_representer'

require_relative 'storage/base'
require_relative 'storage/tweet'
require_relative 'extends/tweet'

# Load the twitter OAUTH creds
twitter_config = YAML.load_file('../config/keys_config.yml')['twitter']

# Load app configuration such as redis information and 
# hashtags
app_config = YAML.load_file('../config/app_config.yml')

# Initialize the Client.
client = Twitter::Streaming::Client.new do |config|
  config.consumer_key        = twitter_config['consumer_key']
  config.consumer_secret     = twitter_config['consumer_secret']
  config.access_token        = twitter_config['access_token']
  config.access_token_secret = twitter_config['access_token_secret']
end

topics = app_config["hashtags"]["twitter"]
topics.map! {|x| x.strip}
puts topics.inspect

# Create and connect a redis client.
$redis = Redis.new(
  host: app_config["redis"]["host"], 
  port: app_config["redis"]["port"], 
  db: app_config["redis"]["db"])


client.filter(track: topics.join(",")) do |tweet|
  if tweet.is_a?(Twitter::Tweet) && !tweet.retweet?
    # only fetch tweets with images.
    if tweet.media?
      x = Storage::Tweet.new.extend(TweetRepresenter).from_json(tweet.to_json)
      puts x.to_json
      
      x.save!($redis)
      print '.'
    end
  end
end
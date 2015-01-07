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
client = Twitter::REST::Client.new do |config|
  config.consumer_key        = twitter_config['consumer_key']
  config.consumer_secret     = twitter_config['consumer_secret']
  config.access_token        = twitter_config['access_token']
  config.access_token_secret = twitter_config['access_token_secret']
end

# Create and connect a redis client.
$redis = Redis.new(
  host: app_config["redis"]["host"], 
  port: app_config["redis"]["port"], 
  db: app_config["redis"]["db"])

  puts app_config['redis_keys']['tweets']['key']

tweets = $redis.lrange(app_config['redis_keys']['tweets']['key'], 0, -1)

# Reset the list
$redis.ltrim(app_config['redis_keys']['tweets']['key'], 0, -1)
$redis.ltrim(app_config['redis_keys']['global']['key'], 0, -1)

tweets.each do |x|
  tweet = JSON.parse(x)
  tweet['created_at'] = client.status(tweet["id"]).created_at.to_i
  $redis.lpush app_config['redis_keys']['tweets']['key'], tweet.to_json
  $redis.lpush app_config['redis_keys']['global']['key'], tweet.to_json
end
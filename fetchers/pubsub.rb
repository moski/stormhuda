class PubSub
  attr_reader :redis
  def initialize(storage_key, storage_data, pubsub_key)
    #self.redis = Redis.new(host: Settings.sidekiq.host, port: Settings.sidekiq.port, db: Settings.sidekiq.db)
  end
end
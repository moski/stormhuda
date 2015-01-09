module Storage
  class Insta < Storage::Base
    def save!(conn)
      # Store the tweet in the tweets collection and Global
      conn.lpush self.redis_keys['instagram']['key'], self.to_json
      #conn.lpush self.redis_keys['global']['key'], self.to_json
      
      # Increments the counter for the tweets and global
      tweet_counter  = conn.incrby self.redis_keys['instagram']['counter'], 1
      #global_counter = conn.incrby self.redis_keys['global']['counter'], 1
    
      self.publish!(conn)
    end
    
    def publish!(conn)
      # Pubsub for counters
      conn.publish(self.redis_keys['instagram']['pubsub']['counter'], tweet_counter)
      #conn.publish(self.redis_keys['global']['pubsub']['counter'], global_couter)      
      
      # Pubsub for the tweets
      conn.publish(self.redis_keys['instagram']['pubsub']['list'], self.to_json)
      #conn.publish(self.redis_keys['global']['pubsub']['list'], self.to_json)
   end 
  end
end
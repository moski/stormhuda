class TweetRepresenter
  attr_accessor :title, :id, :medias, :urls, :service_uri, :type
  
  def initialize(tweet)
    self.title  = tweet.full_text
    self.id     = tweet.id
    self.medias = (tweet.media?) ? tweet.media.map(&:media_uri).map(&:to_s) : [] 
    self.urls = (tweet.urls?) ? tweet.urls.map(&:expanded_uri).map(&:to_s) : []
    self.service_uri   = tweet.url.to_s
    self.type = 'tweet'
  end
  
  def to_json(*a)
    {
      'title' => title, 
      'id' => id,
      'medias' => medias,
      'urls' => urls,
      'service_uri' => service_uri,
      'type' => type
    }.to_json(*a)
  end
end
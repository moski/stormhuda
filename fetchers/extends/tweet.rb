#
# Override the Twitter tweet class to add #to_json function
#
module Twitter
  class Tweet < Twitter::Identity
    def to_h
      {
        "id" => id,
        "title" => full_text,
        "medias" => media.map(&:media_uri).map(&:to_s),
        "urls" => urls.map(&:expanded_uri).map(&:to_s),
        "service_uri" => url.to_s,
        #"created_at" => created_at.to_i
        "type" => 'tweet'
      }
    end
    
    def to_json
      to_h.to_json
    end
    
  end
end

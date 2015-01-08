require 'roar/json'

module TweetRepresenter
  include Roar::JSON

  property :title
  property :id
  property :medias
  property :urls
  property :service_uri
  property :type
  property :created_at
  property :username
end
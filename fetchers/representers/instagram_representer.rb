require 'roar/json'

module InstagramRepresenter
  include Roar::JSON
  
  property :caption, parse_filter: lambda { |value, doc, *args| value['text'] }
  property :images, parse_filter: lambda { |value, doc, *args| [value['standard_resolution']['url']] }
  property :service_uri, as: :link
  property :type
  property :created_at, as: :created_time 
  property :user
  property :id
  
  def to_json(options={})
    {
      title: self.caption, 
      id: self.id, 
      medias: self.images, 
      urls: [], 
      link: self.service_uri,
      username: self.user['username'],
      created_at: self.created_at
    }.to_json
  end
end
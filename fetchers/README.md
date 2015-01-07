# Fetchers

These are the libraries that listen to the stream.


## Installation

  \curl -sSL https://get.rvm.io | bash -s stable --ruby
  
This will install RVM and the latest ruby version. After everything is done, do

  rvm gemset create huda
  rvm gemset use huda
  cd /to/huda/fetchers
  bundle
  
## Run the fetcher

  ruby twitter_stream.rb
  
This will process the stream, update redis and publish to the pubsub
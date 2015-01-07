require 'ostruct'

module Storage
  class Base < OpenStruct
    
    def initialize(*attrs)
      super
      # Load the config file for 
      self.app_config = YAML.load_file('../config/app_config.yml')
      
      # Just for convininent, store the redis keys
      self.redis_keys = self.app_config['redis_keys']
    end
  end
end
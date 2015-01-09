class Hash
  def pick(*values)
    pairs = select { |k,v| values.include?(k) }
    Hash[*pairs.flatten]
  end
end
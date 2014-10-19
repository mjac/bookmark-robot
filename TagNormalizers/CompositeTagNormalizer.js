function CompositeTagNormalizer()
{
	var normalizers = [];
	
	this.AddNormalizer = function (normalizer) {
		normalizers.push(normalizer);
	};
	
	this.NormalizeTags = function (tags) {
		return normalizers.reduce(function (previousTags, normalizer) {
			return normalizer.NormalizeTags(previousTags);
		}, tags);
	};
}

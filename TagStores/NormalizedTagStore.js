/*
var normalizer = new CompositeTagNormalizer();

normalizer.AddNormalizer(new StopWordTagNormalizer());
normalizer.AddNormalizer(new InvalidCharactersTagNormalizer());
normalizer.AddNormalizer(new RemoveDuplicatesTagNormalizer());
normalizer.AddNormalizer(new StemmingTagNormalizer());
	
return normalizer.NormalizeTags(tags);

RequestTags: function (bookmarkUrl, callback)
{
	this.sourceTagStore.RequestTags(bookmarkUrl, function (tags) {
		var normalizedTags = NormalizedTagStore.NormalizeTags(tags);
		callback(normalizedTags);
	});
}
*/

function StopWordTagNormalizer()
{
	var stopWords = ['toread', 'article', 'reference', 'web', 'blog', 'archive', 'ifttt', 'length', 'are', 'you', 'constructor'];

	this.NormalizeTags = function (tags) {
		return tags.filter(function (tag) {
			return stopWords.indexOf(tag) === -1;
		});
	};
}

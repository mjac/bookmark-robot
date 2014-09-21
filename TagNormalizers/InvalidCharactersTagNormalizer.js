function InvalidCharactersTagNormalizer()
{
	this.NormalizeTags = function (tags) {
		return tags.filter(function (tag) {
			return tag.indexOf(':') === -1;
		});
	};
}

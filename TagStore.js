function NormalizedTagStore(sourceTagStore)
{
	this.sourceTagStore = sourceTagStore;
}

NormalizedTagStore.NormalizeTags = function (tags) {
	// Only removing length because jQuery has a bug in $.each that decides the input object/array is an 
	// array if there is a length property
	// 'constructor' causes JS error
	tags = tags.filter(function (tag) {
		var stopWords = ['toread', 'article', 'reference', 'web', 'blog', 'archive', 'ifttt', 'length', 'are', 'you', 'constructor'];
		return tag.indexOf(':') === -1 && stopWords.indexOf(tag) === -1;
	});

	tags.sort();

	tags = tags.reduce(function (arr, val) {
		if (arr[arr.length - 1] !== val) {
			arr.push(val);
		}

		return arr;
	}, []);

	function capitaliseFirstLetter(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}

	tags = tags.map(function (tag) {
		var similarTags = [
			tag.substring(0, tag.length - 1),
			tag + 's',
			tag.replace('s', '#'),
			tag.replace('#', 's')
		].filter(function (similarTag) {
			return similarTag !== tag;
		});

		var tagVariations = similarTags.concat(
			similarTags.map(capitaliseFirstLetter),
			similarTags.map(function (tag) {
				return tag.toUpperCase();
			}),
			similarTags.map(function (tag) {
				return tag.toLowerCase();
			})
		);

		var variationExists = tagVariations.some(function (baseTag) {
			if (baseTag in Tag.tagMap) {
				tag = baseTag;
				return true;
			}

			return false;
		});

		if (variationExists) {
			++Tag.tagMap[tag];
		} else {
			Tag.tagMap[tag] = 1;
		}

		return tag;
	});

	return tags;
};

NormalizedTagStore.prototype = {
	RequestTags: function (bookmarkUrl, callback)
	{
		this.sourceTagStore.RequestTags(bookmarkUrl, function() {
			var normalizedTags = NormalizedTagStore.NormalizeTags(tags);
			callback(normalizedTags);
		});
	}
};


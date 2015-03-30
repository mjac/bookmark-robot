define(['StopWordFilter'], function (stopWordFilter) {
	function TitleTagStore()
	{
	}

	TitleTagStore.prototype = {
		RequestTags: function (bookmark, callback)
		{
			var normalizedTitle = bookmark.title.toLowerCase();


			var wordMap = {};
			var wordRegex = /[^ (]*[a-z][^ )\.]*/gi;

			var matches;
			while ((matches = wordRegex.exec(normalizedTitle)) !== null) {
				var word = matches[0];

				if (word.length < 2) {
					continue;
				}

				var normalizedWord = word.toLowerCase();

				wordMap[normalizedWord] = true;
			}

			var words = Object.keys(wordMap);
			var tags = stopWordFilter.RemoveStopWords(words);

			return tags;
		}
	}

	return new TitleTagStore();
});

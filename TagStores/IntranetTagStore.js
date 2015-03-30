define(function () {
	function IntranetTagStore()
	{
	}

	IntranetTagStore.prototype = {
		RequestTags: function (bookmark)
		{
			var tags = [];

			var urlMatch = bookmark.url.match(/\/\/(?:www\.)?([^/:]+)/i);

			if (urlMatch !== null) {
				var hostname = urlMatch[1].toLowerCase();

				if (hostname.indexOf('.') < 0) {
					tags.push(hostname);
				}
			}

			return tags;
		}
	}

	return new IntranetTagStore();
});

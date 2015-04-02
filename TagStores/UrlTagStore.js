define(function () {
	function UrlTagStore()
	{
	}

	UrlTagStore.prototype = {
		RequestTags: function (bookmark)
		{
			var urlMatch = bookmark.url.match(/\/\/(?:www\.)?([^/:]+)/i);

			if (urlMatch !== null) {
				var hostname = urlMatch[1].toLowerCase();
				return this._getHostnameTags(hostname);
			}

			return [];
		},

		_getHostnameTags: function (hostname)
		{
			var tags = [];

			var firstDotIndex = hostname.indexOf('.');
			if (firstDotIndex >= 0 && !/^[a-z]{1,3}\.uk$/i.test(hostname)) {
				tags.push(hostname);

				var hostnamePart = hostname.substring(firstDotIndex + 1);
				var secondDotIndex = hostnamePart.indexOf('.');

				if (hostnamePart.indexOf('.') >= 0) {
					var hostnameTags = this._getHostnameTags(hostnamePart);
					tags = tags.concat(hostnameTags);
				}
			}

			return tags;
		}
	}

	return new UrlTagStore();
});

define(function () {
	function UrlTagStore()
	{
	}

	UrlTagStore.prototype = {
		RequestTags: function (bookmark, callback)
		{
			var tags = [];

			var urlMatch = bookmark.url.match(/\/\/(?:www\.)?([^/:]+)/i);

			if (urlMatch !== null) {
				var hostname = urlMatch[1].toLowerCase();

				if (hostname.indexOf('.') >= 0) {
					// Fully qualified hostname
					var hostnameTags = this._getHostnameTags(hostname);
					tags = tags.concat(hostnameTags);
				} else if (hostname === 'localhost') {
					tags.push('localhost');
				} else {
					tags.push('intranet');
				}
			}

			return tags;
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

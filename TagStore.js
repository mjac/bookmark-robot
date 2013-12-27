function CacheTagStore(sourceTagStore)
{
}

CacheTagStore.prototype = {
	RequestTags: function (bookmarkUrl, callback)
	{
		var tags;

		if (this.url in localStorage) {
			tags = JSON.parse(localStorage[this.url]).map(function (tag) {
				return tag;
			});
		} else {
			tags = [];
		}

		var urlMatch = this.url.match(/\/\/(?:www\.)?([^/]+)/);
		if (urlMatch !== null) {
			tags.push(urlMatch[1]);
		}

		return Tag.normalizeTags(tags);
	}
}

function DeliciousTagStore(deliciousConfig)
{
	this._endpointUrl = 'https://' + delicious.username + ':' + delicious.password + '@api.del.icio.us/v1/posts/suggest';
}

DeliciousTagStore.prototype = {
	GetTagsForUrl: function (bookmarkUrl, callback)
	{
		$.ajax({
			url: this._endpointUrl,

			data: {
				url: bookmarkUrl
			},

			dataType: 'xml',

			success: function (data, textStatus, jqXHR) {
				var tagNodes = $(data).find('*[tag]');

				var tags = tagNodes.map(function(idx, tagContainer) {
					return $(tagContainer).attr('tag');
				}).get();

				callback(bookmarkUrl, tags);
			}
		});
	}
};



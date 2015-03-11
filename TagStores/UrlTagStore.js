function UrlTagStore()
{
}

UrlTagStore.prototype = {
	RequestTags: function (bookmarkUrl, callback)
	{
		var tags = [];
		
		var urlMatch = bookmarkUrl.match(/\/\/(?:www\.)?([^/]+)/);
		
		if (urlMatch !== null) {
			tags.push(urlMatch[1]);
		}

		callback(bookmarkUrl, tags);
	}
}

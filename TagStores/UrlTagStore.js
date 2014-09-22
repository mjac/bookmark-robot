function UrlTagStore(sourceTagStore, storage)
{
	this.sourceTagStore = sourceTagStore;

	// localstorage
	this.storage = storage;
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

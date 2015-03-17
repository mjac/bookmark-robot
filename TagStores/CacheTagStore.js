function CacheTagStore(sourceTagStore, storage)
{
	this.sourceTagStore = sourceTagStore;

	// localstorage
	this.storage = storage;
}

CacheTagStore.prototype = {
	RequestTags: function (bookmark, callback)
	{
		var tags;
        var bookmarkUrl = bookmark.url;

		if (bookmarkUrl in localStorage) {
			var tagJson = this.storage[bookmarkUrl];

			tags = JSON.parse(tagJson).map(function (tag) {
				return tag;
			});

			callback(bookmarkUrl, tags);

			return;
		} 

		this.sourceTagStore.RequestTags(bookmarkUrl, function (tags) {
			this.storage[bookmarkUrl] = JSON.stringify(tags);
			callback(bookmark, tags);
		}.bind(this));
	},
	
	ClearBookmarkTags: function (bookmarkUrl)
	{
		delete this.storage[bookmarkUrl];
	}
}

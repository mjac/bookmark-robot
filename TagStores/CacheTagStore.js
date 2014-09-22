function CacheTagStore(sourceTagStore, storage)
{
	this.sourceTagStore = sourceTagStore;

	// localstorage
	this.storage = storage;
}

CacheTagStore.prototype = {
	RequestTags: function (bookmarkUrl, callback)
	{
		var tags;

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
			callback(bookmarkUrl, tags);
		}.bind(this));
	},
	
	ClearBookmarkTags: function (bookmarkUrl)
	{
		delete this.storage[bookmarkUrl];
	}
}

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

		if (this.url in localStorage) {
			var tagJson = this.storage[this.url];

			tags = JSON.parse(tagJson).map(function (tag) {
				return tag;
			});

			callback(bookmarkUrl, tags);

			return;
		} 

		bookmark.requestTags(function (tags) {
			this.storage[bookmarkUrl] = JSON.stringify(tags);

			var urlMatch = bookmarkUrl.match(/\/\/(?:www\.)?([^/]+)/);

			if (urlMatch !== null) {
				tags.push(urlMatch[1]);
			}

			callback(bookmarkUrl, tags);
		}.bind(this));
	},
	
	ClearBookmarkTags: function (bookmarkUrl)
	{
		delete this.storage[bookmarkUrl];
	}
}

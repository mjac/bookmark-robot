function CompositeTagStore(sourceTagStore, storage)
{
	this.tagStores = [];
}

CompositeTagStore.prototype = {
	AddTagStore: function (tagStore)
	{
		this.tagStores.push(tagStore);
	},
	
	RequestTags: function (bookmark, callback)
	{
		var allTags = [];
		
		var asyncRequest = new MultipleAsyncRequest();
				
		this.tagStores.forEach(function (tagStore) {
			asyncRequest.AddRequest(function (requestCallback) {
				tagStore.RequestTags(bookmark, function (bookmark, tags) {
					allTags = allTags.concat(tags);
					requestCallback();
				});
			});
		});
		
		asyncRequest.SetFinalCallback(function () {
			callback(bookmark, allTags);
		});
	}
};


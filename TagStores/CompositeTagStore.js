function CompositeTagStore(sourceTagStore, storage)
{
	this.tagStores = [];
}

CompositeTagStore.prototype = {
	AddTagStore: function (tagStore)
	{
		this.tagStores.push(tagStore);
	},
	
	RequestTags: function (bookmarkUrl, callback)
	{
		var allTags = [];
		
		var asyncRequest = new MultipleAsyncRequest();
				
		this.tagStores.forEach(function (tagStore) {
			asyncRequest.AddRequest(function (requestCallback) {
				tagStore.RequestTags(function (tags) {
					allTags = allTags.concat(tags);
					requestCallback();
				});
			});
		});
		
		asyncRequest.SetFinalCallback(function () {
			callback(allTags);
		});
	}
};


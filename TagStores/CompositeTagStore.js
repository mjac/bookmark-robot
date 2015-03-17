define(['MultipleAsyncRequest'], function (requestConstructor) {
    function CompositeTagStore()
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
            
            var asyncRequest = new requestConstructor();
            
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
            
            asyncRequest.Execute();
        }
    };
    
    return CompositeTagStore;
});

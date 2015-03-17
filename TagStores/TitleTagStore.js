define(['StopWordFilter'], function (stopWordFilter) {
    function TitleTagStore()
    {
    }

    TitleTagStore.prototype = {
        RequestTags: function (bookmark, callback)
        {
            var normalizedTitle = bookmark.title.toLowerCase();
            var tags = stopWordFilter.RemoveStopWords(normalizedTitle);

            callback(bookmark, tags);
        }
    }
    
    return new TitleTagStore();
});
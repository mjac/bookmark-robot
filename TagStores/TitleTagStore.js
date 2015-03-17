define(['StopWordFilter'], function (stopWordFilter) {
    function TitleTagStore()
    {
    }

    TitleTagStore.prototype = {
        RequestTags: function (bookmark, callback)
        {
            var normalizedTitle = bookmark.title.toLowerCase();
            var words = normalizedTitle.split(' ');
            var tags = stopWordFilter.RemoveStopWords(words);

            callback(bookmark, tags);
        }
    }
    
    return new TitleTagStore();
});
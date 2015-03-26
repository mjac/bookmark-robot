define(['StopWordFilter'], function (stopWordFilter) {
    function TitleTagStore()
    {
    }

    TitleTagStore.prototype = {
        RequestTags: function (bookmark, callback)
        {
            var normalizedTitle = bookmark.title.toLowerCase();
            
            
            var words = [];
            var wordRegex = /[a-z]\w+/gi;
            
            var matches;
            while ((matches = wordRegex.exec(normalizedTitle)) !== null) {
                var normalizedWord = matches[0].toLowerCase();
                words.push(normalizedWord);
            }
            
            var tags = stopWordFilter.RemoveStopWords(words);

            return tags;
        }
    }
    
    return new TitleTagStore();
});
define(function () {
    function FileTagStore()
    {
    }

    FileTagStore.prototype = {
        RequestTags: function (bookmark, callback)
        {
            var tags = [];
            
            var urlMatch = bookmark.url.match(/.*\.(png|pdf|jpg|zip|exe)$/i);
            
            if (urlMatch !== null) {
				console.log(urlMatch);
                tags.push(urlMatch[1]);
            }

            callback(bookmark, tags);
        }
    }
    
    return new FileTagStore();
});

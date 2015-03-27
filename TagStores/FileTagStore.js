define(function () {
    function FileTagStore()
    {
    }

    FileTagStore.prototype = {
        RequestTags: function (bookmark, callback)
        {
            var tags = [];
            
            var urlMatch = bookmark.url.match(/.*\/[^?]*\.(png|pdf|jpg|zip|exe|txt)$/i);
            
            if (urlMatch !== null) {
                tags.push(urlMatch[1]);
            }

            return tags;
        }
    }
    
    return new FileTagStore();
});

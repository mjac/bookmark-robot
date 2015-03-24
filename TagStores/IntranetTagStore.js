define(function () {
    function IntranetTagStore()
    {
    }

    IntranetTagStore.prototype = {
        RequestTags: function (bookmark, callback)
        {
            var tags = [];
            
            var urlMatch = bookmark.url.match(/\/\/(?:www\.)?([^/:]+)/i);
            
            if (urlMatch !== null) {
                var hostname = urlMatch[1].toLowerCase();
                
                if (hostname.indexOf('.') < 0) {
                    tags.push(hostname);
                }
            }

            callback(bookmark, tags);
        }
    }
    
    return new IntranetTagStore();
});

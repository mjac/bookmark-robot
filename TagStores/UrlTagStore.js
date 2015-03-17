function UrlTagStore()
{
}

UrlTagStore.prototype = {
	RequestTags: function (bookmarkUrl, callback)
	{
		var tags = [];
		
		var urlMatch = bookmarkUrl.match(/\/\/(?:www\.)?([^/]+)/i);
		
		if (urlMatch !== null) {
            var hostname = urlMatch[1].toLowerCase();
            
            if (hostname.indexOf('.') >= 0) {
                // Fully qualified hostname
                tags.push(hostname);
            } else if (hostname === 'localhost') {
                tags.push('localhost');
            } else {
                tags.push('intranet');
            }
		}

		callback(bookmarkUrl, tags);
	}
}

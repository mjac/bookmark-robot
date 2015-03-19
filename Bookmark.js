define(function () {
	var bookmarkId = 0;
	
    function Bookmark(title, url) {
		this.id = bookmarkId;
		++bookmarkId;
		
        this.title = title;
        this.url = url;
    }
    
    return Bookmark;
});
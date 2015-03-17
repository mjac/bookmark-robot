define(function () {
    function Bookmark(title, url) {
        this.title = title;
        this.url = url;
        this.tags = [];
    }
    
    return Bookmark;
});
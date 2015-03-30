define(function () {
	var bookmarkId = 0;

	function Bookmark(id, title, url) {
		this.id = id;
		this.title = title;
		this.url = url;
	}

	return Bookmark;
});

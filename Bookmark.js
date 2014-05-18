function Bookmark(title, url) {
	this.title = title;
	this.url = url;
	this.tags = [];
}

function BookmarkTreeBookmark(bookmarkTree, hierarchy) {
	// call parenet constructor with title/url
	this.id = bookmarkTree.id;
	this.title = bookmarkTree.title;
	this.tags = [];
	this.hierarchy = hierarchy;
	this.url = bookmarkTree.url;
}

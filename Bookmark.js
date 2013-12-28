function Bookmark(bookmarkTree, hierarchy) {
	this.id = bookmarkTree.id;
	this.title = bookmarkTree.title;
	this.tags = [];
	this.hierarchy = hierarchy;
	this.url = bookmarkTree.url;
}

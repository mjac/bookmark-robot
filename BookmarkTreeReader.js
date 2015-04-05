define([
	'jquery',
	'Bookmark',
	'Folder'
], function (
	$,
	bookmarkConstructor,
	folderConstructor
	) {
	function BookmarkTreeReader()
	{
	}

	BookmarkTreeReader.prototype.readTree = function (bookmarkTree, bookmarks) {
		if ('children' in bookmarkTree) {
			var folder = new folderConstructor(bookmarkTree.title);
			bookmarks.AddFolder(folder);

			this.readTree(bookmarkTree.children, folder);
		} else if ($.isArray(bookmarkTree)) {
			for (var localIdx in bookmarkTree) {
				var bookmarkChild = bookmarkTree[localIdx];
				this.readTree(bookmarkChild, bookmarks);
			}
		} else {
			var newBookmark = new bookmarkConstructor(bookmarkTree.id, bookmarkTree.title, bookmarkTree.url);
			bookmarks.AddBookmark(newBookmark);
		}
	}

	return new BookmarkTreeReader();
});

function TagWriter(bookmarkStore)
{
	this._bookmarkStore = bookmarkStore;
}

TagWriter.prototype = {
	CreateHierarchy: function(tag, parentTree) {
		var writer = this;

		var tags = $.map(tag.tags, function (i) { return i; });

		tags.sort(function (tag1, tag2) {
			if (tag1.name < tag2.name) {
				return -1;
			}

			if (tag1.name > tag2.name) {
				return 1;
			}

			return 0;
		});

		var bookmarks = $.map(tag.bookmarks, function (i) { return i; });

		bookmarks.sort(function (bookmark1, bookmark2) {
			if (bookmark1.title < bookmark2.title) {
				return -1;
			}

			if (bookmark1.title > bookmark2.title) {
				return 1;
			}

			return 0;
		});

		var store = this._bookmarkStore;

		store.CreateBookmarkFolder(tag.name, parentTree.id, function (tagTree){
			tags.forEach(function (subTag) {
				writer.CreateHierarchy(subTag, tagTree);
			});

			bookmarks.forEach(function (bookmark) {
				store.MoveBookmark(bookmark.id, tagTree.id, callback);
			});
		});
	}
};



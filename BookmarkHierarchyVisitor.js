function BookmarkHierarchyVisitor()
{
	this._bookmarks = {};
	this._hierarchy = [];
}

BookmarkHierarchyVisitor.prototype = {
	Visit: function (tag)
	{
		this._hierarchy.push(this);

		var hierarchy = this._hierarchy.concat();
		var bookmarks = this._bookmarks;

		$.each(tag.bookmarks, function (idx, bookmark) {
			if (!(bookmark.url in bookmarks)) {
				bookmarks[bookmark.url] = [];
			}

			bookmarks[bookmark.url].push({
				hierarchy: hierarchy,
				bookmark: bookmark
			});
		});
	},

	Unvisit: function (tag) 
	{
		this._hierarchy.pop();
	},
};



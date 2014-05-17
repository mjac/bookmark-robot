function AllBookmarkVisitor()
{
	this.bookmarks = [{}];
}

AllBookmarkVisitor.prototype = {
	Visit: function (tag)
	{
		this.bookmarks.push(tag.bookmarks);
	},

	GetAllBookmarks: function ()
	{
		return $.extend.apply($, this.bookmarks);
	},

	// Contains all subset of bookmarks
	Contains: function (tag) {
		var selfBookmarks = this.GetAllBookmarks();
		var subsetBookmarks = tag.GetAllBookmarks();

		for (url in subsetBookmarks) {
			if (!(url in selfBookmarks)) {
				return false;
			}
		}

		return true;
	}
};


function ChromeBookmarkStore()
{
}

ChromeBookmarkStore.prototype = {
	RemoveBookmark: function (bookmark, callback) {
		chrome.bookmarks.remove(bookmark.id, function () {
			callback(bookmark);
		});
	},

	UpdateBookmarkTitle: function (bookmark, newTitle, callback) {
		chrome.bookmarks.update(bookmark.id, {
			title: newTitle
		}, function (updatedBookmark) {
			callback(bookmark, updatedBookmark.title);
		});
	}
};

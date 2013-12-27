function Bookmark(bookmarkTree, hierarchy) {
	this.id = bookmarkTree.id;
	this.title = bookmarkTree.title;
	this.tags = [];
	this.hierarchy = hierarchy;
	this.url = bookmarkTree.url;

	// Old -> 
	this.found = null;
	this.loading = false;

	this.liveTitle = null;
}

var _OldBookmarkprototype = {
	connect: function(callback) {
		// Integrate with BookmarkContentRepository, move into controller
		this.found = null;
		this.loading = true;

		updateTable(this);

		$.ajax({
			url: this.url, 

			dataType: 'html',

			timeout: 5000,

			success: function (data, textStatus, jqXHR) {
				this.found = true;
				this.loading = false;

				var titleMatch = data.match(/<title>([^<]*)<\/title>/);

				if (titleMatch !== null) {
					var title = titleMatch[1].replace(/\s+/g, ' ').trim();

					this.liveTitle = $('<div/>').html(title).text();
				}

				updateTable(this);

				callback(true);
			}.bind(this),

			error: function (jqXHR, textStatus, errorThrown) {
				this.found = false;
				this.loading = false;

				updateTable(this);

				callback(false);
			}.bind(this)
		});
	},

	getTags: function () {
		// Local tag store
	},

	hasNewTitle: function () {
		return this.liveTitle !== null && this.liveTitle !== this.title;
	},

	requestTags: function(callback) {
		// Delicious tag store
	},

	remove: function () {
		// Use ChromeBookmarkStore
		chrome.bookmarks.remove(this.id, function () {
			getRow(this).remove();
			bookmarkList[bookmarkList.indexOf(this)] = null;
		}.bind(this));
	},

	save: function () {
		if (!this.hasNewTitle()) {
			return;
		}

		// Use ChromeBookmarkStore
		chrome.bookmarks.update(this.id, {
			title: this.liveTitle
		}, function (updatedBookmark) {
			this.title = updatedBookmark.title;
			updateTable(this);
		}.bind(this));
	}
}


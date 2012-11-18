function Bookmark(bookmarkTree, tags) {
	this.id = bookmarkTree.id;
	this.title = bookmarkTree.title;
	this.tags = tags;
	this.url = bookmarkTree.url;

	this.found = null;
	this.loading = false;

	this.liveTitle = null;
}

Bookmark.prototype = {
	connect: function(callback) {
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
		var tags;

		function capitaliseFirstLetter(string) {
			return string.charAt(0).toUpperCase() + string.slice(1);
		}

		if (this.url in localStorage) {
			tags = JSON.parse(localStorage[this.url]).map(function (tag) {
				return tag; // capitaliseFirstLetter(tag);
			});
		} else {
			tags = [];
		}

//		tags = tags.concat(this.title.split(' ').map(function (tag) {
//			return tag.toLowerCase();
//		}).filter(function (tag) {
//			var stopWords = ['and', 'the', 'free', 'for', 'how', 'with', 'your', 'what', 'online', 'why', 'best',  'home'];
//			return tag.length > 2 && /.*\w.*/.test(tag) && stopWords.indexOf(tag) === -1;
//		}));

		var urlMatch = this.url.match(/\/\/(?:www\.)?([^/]+)/);
		if (urlMatch !== null) {
			tags.push(urlMatch[1]);
		}

		return tags.filter(function (tag) {
			var stopWords = ['toread', 'reference', 'web', 'blog', 'archive', 'ifttt'];
			return tag.indexOf(':') === -1 && stopWords.indexOf(tag) === -1;
		});
	},

	hasNewTitle: function () {
		return this.liveTitle !== null && this.liveTitle !== this.title;
	},

	requestTags: function(callback) {
		$.ajax({
			url: 'https://' + delicious.username + ':' + delicious.password + '@api.del.icio.us/v1/posts/suggest',

			data: {
				url: this.url
			},

			dataType: 'xml',

			success: function (data, textStatus, jqXHR) {
				var tagNodes = $(data).find('*[tag]');
				
				var tags = tagNodes.map(function(idx, tagContainer) {
					return $(tagContainer).attr('tag');
				}).get();

				callback(tags);
			}.bind(this),
		});
	},

	remove: function () {
		chrome.bookmarks.remove(this.id, function () {
			getRow(this).remove();
			bookmarkList[bookmarkList.indexOf(this)] = null;
		}.bind(this));
	},

	save: function () {
		if (!this.hasNewTitle()) {
			return;
		}

		chrome.bookmarks.update(this.id, {
			title: this.liveTitle
		}, function (updatedBookmark) {
			this.title = updatedBookmark.title;
			updateTable(this);
		}.bind(this));
	}
}


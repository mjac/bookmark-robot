function Tag(tagName) {
	this.bookmarks = {};
	this.name = tagName;
	this.tags = {};

	this._allBookmarks = null;
}

Tag.tagMap = {};

Tag.prototype = {
	AddBookmark: function (bookmark) {
		this.bookmarks[bookmark.url] = bookmark;
	},

	RemoveBookmark: function (bookmark) {
		delete this.bookmarks[bookmark.url];
	},

	AddBookmarks: function (bookmarks) {
		this.bookmarks = $.extend(this.bookmarks, bookmarks);
	},

	AddTag: function (tag) {
		this.tags[tag.name] = tag;
	},

	AddTags: function (tagList) {
		this.tags = $.extend(this.tags, tagList);
	},

	Clone: function () {
		var tag = new Tag(this.name);

		tag.bookmarks = $.extend({}, this.bookmarks);

		tag.tags = $.extend({}, this.tags);

		$.each(tag.tags, function (idx, elem) {
			tag.tags[idx] = elem.clone();
		});

		return tag;
	},

	Accept: function (visitor) {
		visitor.visit(this);

		$.each(this.tags, function (tagName, tag) {
			tag.accept(visitor);
		});
	}
};



function RemoveDuplicates (fn) {
	// Use BookmarkHierarchyVisitor
	var duplicates = this._gatherDuplicates([]);

	function removeRoute(route) {
		var tag = route.hierarchy[route.hierarchy.length - 1];
		tag.removeBookmark(route.bookmark);
	}

	$.each(duplicates, function (url, routeList) {
		routeList.reduce(function (min, route) {
			var distance = fn(route);

			if (min === null) {
				return [distance, route];
			}

			if (distance < min[0]) {
				removeRoute(min[1]);
				return [distance, route];
			}

			removeRoute(route);

			return min;
		}, null);
	});
}

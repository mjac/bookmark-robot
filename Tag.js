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

		$.each(this.tags, function (idx, elem) {
			tag.AddTag(elem.Clone());
		});

		return tag;
	},

	Accept: function (visitor) {
		visitor.visit(this);

		$.each(this.tags, function (tagName, tag) {
			tag.Accept(visitor);
		});
	}
};


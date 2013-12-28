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

function TagOptimiser()
{
}

TagOptimiser.SortByCount = function (tags) {
	var tags = $.map(tags, function (val) {
		return val;
	});
		
	tags.sort(function (a, b) {
		if (len(a.tags) < len(b.tags)) {
			return 1;
		}

		if (len(a.tags) > len(b.tags)) {
			return -1;
		}

		if (len(a.bookmarks) < len(b.bookmarks)) {
			return 1;
		}

		if (len(a.bookmarks) > len(b.bookmarks)) {
			return -1;
		}

		return 0;
	});

	return tags;
};

TagOptimiser.prototype = {
	Visit: function (tag) {
		var desc = TagOptimiser.SortByCount(tag.tags);

		while (desc.length > 0) {
			var tag = desc.pop();

			for (var tagIdx in desc) {
				var commonTag = desc[tagIdx];

				if (commonTag.contains(tag)) {
					commonTag.addTag(tag.clone());
					break;
				}
			}
		}
	},

	Unvisit: function () {
	}
};


function TagPruner()
{
}

TagPruner.prototype = {
	Visit: function(tag)
	{
		var oldTags = tag.tags;

		tag.tags = {};

		$.each(oldTags, function (idx, subTag) {
			subTag.prune();

			var subTagLen = len(subTag.tags);
			var subBookmarkLen = len(subTag.bookmarks);

			var tooSmall = subTagLen <= 1 && subBookmarkLen <= 3;
			var sameName = tag.name.indexOf(subTag.name) >= 0 || subTag.name.indexOf(tag.name) >= 0;
			var selfSmall = subBookmarkLen < 20 && len(tag.bookmarks) < 20;

			if (tooSmall || sameName || selfSmall) {
				tag.addBookmarks(subTag.bookmarks);
				tag.addTags(subTag.tags);
			} else {
				tag.addTag(subTag);
			}
		}.bind(tag));
	}
};


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

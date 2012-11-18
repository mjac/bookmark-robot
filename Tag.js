function Tag(tagName) {
	this.allBookmarks = null;
	this.name = tagName;
	this.bookmarks = [];
	this.tags = [];
}

Tag.prototype = {
	addBookmark: function (bookmark) {
		this.bookmarks.push(bookmark);
		this.allBookmarks = null;
	},

	addBookmarks: function (bookmarks) {
		this.bookmarks = this.bookmarks.concat(bookmarks);
		this.allBookmarks = null;
	},

	addTag: function (tag) {
		this.tags.push(tag);
		this.allBookmarks = null;
	},

	addTags: function (tagList) {
		this.tags = this.tags.concat(tagList);
		this.allBookmarks = null;
	},

	getAllBookmarks: function () {
		if (this.allBookmarks === null) {
			this.allBookmarks = this._getAllBookmarks();
		}

		return this.allBookmarks;
	},

	_getAllBookmarks: function () {
		return this.tags.reduce(function (bookmarks, tag) {
			return bookmarks.concat(tag.getAllBookmarks());
		}, this.bookmarks.concat());
	},

	removeBookmark: function (bookmark) {
		var bookmarkIdx = this.bookmarks.indexOf(bookmark);
		this.bookmarks.splice(bookmarkIdx, 1);
		this.allBookmarks = null;
	},

	contains: function (tag) {
		var selfBookmarks = this.getAllBookmarks();
		var subsetBookmarks = tag.getAllBookmarks();

		return subsetBookmarks.every(function (bookmark) {
			return selfBookmarks.indexOf(bookmark) >= 0;
		});
	},

	optimise: function (recursive) {
		var desc = order(this.tags);
		
		var newTags = [];

		while (desc.length > 0) {
			var tag = desc.pop();

			var found = false;

			for (var tagIdx in desc) {
				var commonTag = desc[tagIdx];

				if (commonTag.contains(tag)) {
					commonTag.addTag(tag);
					found = true;
					break;
				}
			}

			if (!found) {
				newTags.push(tag);
			}
		}

		if (recursive) {
			newTags.forEach(function (tag) {
				tag.optimise();
			});
		}

		this.tags = order(newTags);

		this.allBookmarks = null;
	},

	removeDuplicates: function (fn) {
		var duplicates = this._gatherDuplicates([]);
		console.log('Duplicates', len(duplicates));
var b = 0, c = 0, d = 0;
		function removeRoute(route) {
			++b;
			var tag = route.hierarchy[route.hierarchy.length - 1];
			tag.removeBookmark(route.bookmark);
		}

		$.each(duplicates, function (url, routeList) {
			d += routeList.length;
			routeList.reduce(function (min, route) {
				++c;
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
		console.log(b, c, d);
	},

	_gatherDuplicates: function (hierarchy) {
		var newHierarchy = hierarchy.concat([this]);

		var bookmarks = {};

		this.bookmarks.forEach(function (bookmark) {
			if (!(bookmark.url in bookmarks)) {
				bookmarks[bookmark.url] = [];
			}

			bookmarks[bookmark.url].push({
				hierarchy: newHierarchy,
				bookmark: bookmark
			});
		});

		this.tags.forEach(function (subTag) {
			var subBookmarks = subTag._gatherDuplicates(newHierarchy);

			$.each(subBookmarks, function (url, hierarchyList) {
				if (url in bookmarks) {
					bookmarks[url] = bookmarks[url].concat(hierarchyList);
				} else {
					bookmarks[url] = hierarchyList;
				}
			});
		});

		return bookmarks;
	},

	prune: function() {
		var newTags = [];

		$.each(this.tags, function (idx, subTag) {
			subTag.prune();

			if (subTag.tags.length <= 1 && subTag.bookmarks.length <= 3 || this.name.indexOf(subTag.name) >= 0 || subTag.name.indexOf(this.name) >= 0) {
				this.addBookmarks(subTag.bookmarks);
				this.addTags(subTag.tags);
			} else {
				newTags.push(subTag);
			}
		}.bind(this));

		this.tags = newTags;
		this.allBookmarks = null;
	},

	createHierarchy: function(parentTree) {
		var tags = this.tags;

		tags.sort(function (tag1, tag2) {
			if (tag1.name < tag2.name) {
				return -1;
			}

			if (tag1.name > tag2.name) {
				return 1;
			}

			return 0;
		});

		var bookmarks = this.bookmarks;

		bookmarks.sort(function (bookmark1, bookmark2) {
			if (bookmark1.title < bookmark2.title) {
				return -1;
			}

			if (bookmark1.title > bookmark2.title) {
				return 1;
			}

			return 0;
		});

		chrome.bookmarks.create({
			title: this.name,
			parentId: parentTree.id
		}, function (tagTree) {
			tags.forEach(function (subTag) {
				subTag.createHierarchy(tagTree);
			});

			bookmarks.forEach(function (bookmark) {
				chrome.bookmarks.move(bookmark.id, {
					parentId: tagTree.id
				});
			});
		});
	},

	markBookmarksUnsorted: function() {
		if (this.bookmarks.length < 1) {
			return;
		}

		var unsortedTag = null;

		this.tags.forEach(function (tag) {
			if (tag.name === 'unsorted') {
				unsortedTag = tag;
			}
		});

		if (unsortedTag === null) {
			unsortedTag = new Tag('unsorted');
			this.tags.push(unsortedTag);
		}

		unsortedTag.addBookmarks(this.bookmarks);
		this.bookmarks = [];
		this.allBookmarks = null;
	}
};


function Tag(tagName) {
	this.bookmarks = {};
	this.name = tagName;
	this.tags = {};

	this._allBookmarks = null;
}

Tag.tagMap = {};

Tag.normalizeTags = function (tags) {
	// Only removing length because jQuery has a bug in $.each that decides the input object/array is an 
	// array if there is a length property
	// 'constructor' causes JS error
	tags = tags.filter(function (tag) {
		var stopWords = ['toread', 'article', 'reference', 'web', 'blog', 'archive', 'ifttt', 'length', 'are', 'you', 'constructor'];
		return tag.indexOf(':') === -1 && stopWords.indexOf(tag) === -1;
	});

	tags.sort();

	tags = tags.reduce(function (arr, val) {
		if (arr[arr.length - 1] !== val) {
			arr.push(val);
		}

		return arr;
	}, []);

	function capitaliseFirstLetter(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}

	tags = tags.map(function (tag) {
		var similarTags = [
			tag.substring(0, tag.length - 1),
			tag + 's',
			tag.replace('s', '#'),
			tag.replace('#', 's')
		].filter(function (similarTag) {
			return similarTag !== tag;
		});

		var tagVariations = similarTags.concat(
			similarTags.map(capitaliseFirstLetter),
			similarTags.map(function (tag) {
				return tag.toUpperCase();
			}),
			similarTags.map(function (tag) {
				return tag.toLowerCase();
			})
		);

		var variationExists = tagVariations.some(function (baseTag) {
			if (baseTag in Tag.tagMap) {
				tag = baseTag;
				return true;
			}

			return false;
		});

		if (variationExists) {
			++Tag.tagMap[tag];
		} else {
			Tag.tagMap[tag] = 1;
		}

		return tag;
	});

	return tags;
};

Tag.prototype = {
	addBookmark: function (bookmark) {
		this.bookmarks[bookmark.url] = bookmark;
		this._clearCache();
	},

	addBookmarks: function (bookmarks) {
		this.bookmarks = $.extend(this.bookmarks, bookmarks);
		this._clearCache();
	},

	addTag: function (tag) {
		this.tags[tag.name] = tag;
		this._clearCache();
	},

	addTags: function (tagList) {
		this.tags = $.extend(this.tags, tagList);
		this._clearCache();
	},

	clone: function () {
		var tag = new Tag(this.name);

		tag.bookmarks = $.extend({}, this.bookmarks);

		tag.tags = $.extend({}, this.tags);

		$.each(tag.tags, function (idx, elem) {
			tag.tags[idx] = elem.clone();
		});

		return tag;
	},

	contains: function (tag) {
		var selfBookmarks = this.getAllBookmarks();
		var subsetBookmarks = tag.getAllBookmarks();

		for (url in subsetBookmarks) {
			if (!(url in selfBookmarks)) {
				return false;
			}
		}

		return true;
	},

	createHierarchy: function(parentTree) {
		var tags = $.map(this.tags, function (i) { return i; });

		tags.sort(function (tag1, tag2) {
			if (tag1.name < tag2.name) {
				return -1;
			}

			if (tag1.name > tag2.name) {
				return 1;
			}

			return 0;
		});

		var bookmarks = $.map(this.bookmarks, function (i) { return i; });

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
			title: this.name,// + ' (' + bookmarks.length + ', ' + tags.length + ')',
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

	getAllBookmarks: function () {
		if (this._allBookmarks === null) {
			this._allBookmarks = this._getAllBookmarks();
		}

		return this._allBookmarks;
	},

	optimise: function () {
		var desc = this.sortByCount();

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

		$.each(this.tags, function (tagName, tag) {
			tag.optimise();
		});

		this._clearCache();
	},

	markBookmarksUnsorted: function() {
		if (this.bookmarks.length < 1) {
			return;
		}

		if (!('unsorted' in this.tags)) {
			this.addTag(new Tag('unsorted'));
		}

		this.tags.unsorted.addBookmarks(this.bookmarks);

		this.bookmarks = {};
	},

	prune: function() {
		var oldTags = this.tags;

		this.tags = {};

		$.each(oldTags, function (idx, subTag) {
			subTag.prune();

			var subTagLen = len(subTag.tags);
			var subBookmarkLen = len(subTag.bookmarks);

			var tooSmall = subTagLen <= 1 && subBookmarkLen <= 3;
			var sameName = this.name.indexOf(subTag.name) >= 0 || subTag.name.indexOf(this.name) >= 0;
			var selfSmall = subBookmarkLen < 20 && len(this.bookmarks) < 20;

			if (tooSmall || sameName || selfSmall) {
				this.addBookmarks(subTag.bookmarks);
				this.addTags(subTag.tags);
			} else {
				this.addTag(subTag);
			}
		}.bind(this));
	},

	removeBookmark: function (bookmark) {
		delete this.bookmarks[bookmark.url];
		this._clearCache();
	},

	removeDuplicates: function (fn) {
		var duplicates = this._gatherDuplicates([]);

		function removeRoute(route) {
			var tag = route.hierarchy[route.hierarchy.length - 1];

			tag.removeBookmark(route.bookmark);

			route.hierarchy.forEach(function (tag) {
				tag._clearCache();
			});
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
	},

	sortByCount: function () {
		var tags = $.map(this.tags, function (val) {
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
	},

	_clearCache: function () {
		this._allBookmarks = null;
	},

	_gatherDuplicates: function (hierarchy) {
		var newHierarchy = hierarchy.concat([this]);

		var bookmarks = {};

		$.each(this.bookmarks, function (idx, bookmark) {
			if (!(bookmark.url in bookmarks)) {
				bookmarks[bookmark.url] = [];
			}

			bookmarks[bookmark.url].push({
				hierarchy: newHierarchy,
				bookmark: bookmark
			});
		});

		$.each(this.tags, function (idx, subTag) {
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

	_getAllBookmarks: function () {
		var args = [{}, this.bookmarks];

		args = args.concat($.map(this.tags, function (tag) {
			return tag.getAllBookmarks();
		}));

		return $.extend.apply($, args);
	}
};


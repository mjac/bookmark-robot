$(document).ready(function() {
	var bookmarkStore = new ChromeBookmarkStore();
	var bookmarkTableView = new BookmarkTableView($('#bookmarksTable'), bookmarkStore);
	
	var bookmarkContentRepository = new RemoteBookmarkContentRepository();

	bookmarkTableView.UpdateTree();

	var select = bookmarkTableView.Select.bind(bookmarkTableView);
	var performAction = bookmarkTableView.PerformAction.bind(bookmarkTableView);

	$('#actionConnect').on('click', function () {
		var activeConnect = [];
		var connectList = [];
		var connectionLimit = 5;

		performAction(function (idx, bookmark) {
			connectList.push(bookmark);
		});

		var url = connectList[0].url;
		bookmarkContentRepository.GetHTML(url, function (data) {
			console.log(data);
		});
	});

	$('#actionSave').on('click', function () {
		performAction(function (idx, bookmark) {
			if (!bookmark.hasNewTitle()) {
				return;
			}

			bookmarkStore.UpdateBookmarkTitle(bookmark, bookmark.title, function(bookmark, bookmarkTitle)
				{
					bookmark.title = bookmarkTitle;
				});
		});
	});

	$('#actionDelete').on('click', function () {
		if (!confirm('Are you sure you want to delete these bookmarks?')) {
			return;
		}

		performAction(function (idx, bookmark) {
			// Use ChromeBookmarkStore
			chrome.bookmarks.remove(this.id, function () {
				getRow(this).remove();
				bookmarkList[bookmarkList.indexOf(this)] = null;
			}.bind(this));
		});
	});

	$('#selectAll').on('click', function () {
		select(function () {
			return true;
		});
	});

	$('#selectInvert').on('click', function () {
		select(function (idx, bookmark, row) {
			return !row.hasClass('selected');
		});
	});

	$('#selectNone').on('click', function () {
		select(function () {
			return false;
		});
	});

	$('#selectChanged').on('click', function () {
		select(function (idx, bookmark, row) {
			return bookmark.hasNewTitle();
		});
	});

	$('#selectLoaded').on('click', function () {
		select(function (idx, bookmark, row) {
			return bookmark.found === true;
		});
	});

	$('#selectFailed').on('click', function () {
		select(function (idx, bookmark, row) {
			return bookmark.found === false;
		});
	});

	$('#selectRepeated').on('click', function () {
		select(function () {
			var url = {};
			return function (idx, bookmark, row) {
				if (bookmark.url in url) {
					return true;
				}

				url[bookmark.url] = true;

				return false;
			};
		}());
	});

	$('#viewChecked').on('click', function () {
		$('#bookmarksTable').toggleClass('showSelected', $(this).attr('checked'));
	});

	$('#viewHttp').on('click', function () {
		onlyHttp = $(this).is(':checked');
		bookmarkTableView.UpdateTree();
	});
});

function getTagMap(bookmarkList) {
	var tagMap = {};

	for (var bookmarkIdx in bookmarkList) {
		var bookmark = bookmarkList[bookmarkIdx];

		if (bookmark === null) {
			continue;
		}

		var tags = bookmark.getTags();

		if (tags.length < 1) {
			tags = ['unsorted'];
		}

		for (var tagIdx in tags) {
			var tag = tags[tagIdx];

			if (!(tag in tagMap)) {
				tagMap[tag] = new Tag(tag);
			}

			tagMap[tag].addBookmark(bookmark);
		}
	}

	return tagMap;
}

function getOptimal(bookmarkList, recurse) {
		var tagMap = getTagMap(bookmarkList);

		var tag = new Tag(new Date().toISOString());
		tag.addTags(tagMap);
		tag.optimise(recurse);
		tag.prune();
		tag.removeDuplicates(function (a) {
			var ownTag = a.hierarchy[a.hierarchy.length - 1];

			var bookmarkDiff = Math.abs(20 - len(ownTag.bookmarks));
			var hierarchyDiff = Math.abs(1 + Math.log(bookmarkList.length) / Math.log(20) - a.hierarchy.length);

			var tagDiff = 0;
			if (a.hierarchy.length > 1) {
				var parentTag = a.hierarchy[a.hierarchy.length - 2];
				tagDiff = Math.abs(20 - len(parentTag.tags));
			}

			var diff = 100 * hierarchyDiff + tagDiff + 5 * bookmarkDiff;
			return diff;
//			return -a.hierarchy.reduce(function (dist, tag) {
//				return dist + len(tag.tags) / 2;
//			}, 0);
		});
		tag.prune();
		tag.markBookmarksUnsorted();

		return tag;
}

var onlyHttp = true;

var bookmarkList = [];

function getRow(bookmark) {
	return getRowIdx(bookmarkList.indexOf(bookmark));
}

function getRowIdx(bookmarkIdx) {
	return $('#bookmarksTable > tbody > tr[data-id=' + bookmarkIdx + "]");
}

function updateTable(bookmark) {
	var rowNode = getRow(bookmark);

	var hasNewTitle = bookmark.hasNewTitle()
	var titleNode = rowNode.find('td.title a');

	titleNode.text(hasNewTitle ? bookmark.liveTitle : bookmark.title);

	titleNode.toggleClass('new', hasNewTitle);

	rowNode.toggleClass('found', bookmark.found === true);
	rowNode.toggleClass('failed', bookmark.found === false);
	rowNode.toggleClass('loading', bookmark.loading);
}

function getTree() {
	bookmarkList = [];

	chrome.bookmarks.getTree(function (bookmarkTree) {
		readTree(bookmarkTree[0].children, [], bookmarkList);
		writeTree();
	});
}

function writeTree() {
	var tableBody = $('#bookmarksTable > tbody');

	tableBody.empty();

	for (bookmarkIdx in bookmarkList) {
		var bookmark = bookmarkList[bookmarkIdx];

		var bookmarkRow = tableBody.append('<tr data-id="' + bookmarkIdx + '"><td class="select"><input type="checkbox" value="' + bookmarkIdx + '" /></td><td class="title"><a>' + bookmark.title + '</a></td><td class="url"><a>' + bookmark.url + '</a></td></tr>');
	}
}

function readTree(bookmarkTree, hierarchy, bookmarks) {
	if ('children' in bookmarkTree) {
		var subHierarchy = hierarchy.concat([bookmarkTree.title]);
		readTree(bookmarkTree.children, subHierarchy, bookmarks);
	} else if ($.isArray(bookmarkTree)) {
		for (localIdx in bookmarkTree) {
			var folder = bookmarkTree[localIdx];
			readTree(folder, hierarchy, bookmarks);
		}
	} else {
		var newBookmark = new Bookmark(bookmarkTree, hierarchy);

		if (!onlyHttp || /^http/.test(newBookmark.url) && !/(\/\/localhost|\.pdf$)/.test(newBookmark.url)) {
			bookmarks.push(newBookmark);
		}
	}
}

function performAction(fn) {
	$('#bookmarksTable input[type=checkbox]:checked').each(function (idx, input) {
		fn(idx, bookmarkList[$(input).val()]);
	});
}

function select(fn) {
	$('#bookmarksTable > tbody > tr').each(function (rowIdx, row) {
		var rowNode = $(row);
		var idx = rowNode.data('id');
		var bookmark = bookmarkList[idx];

		if (bookmark === null) {
			return;
		}

		var isMatch = fn(idx, bookmark, rowNode);

		rowNode.find('input[type=checkbox]').prop('checked', isMatch);
		rowNode.toggleClass('selected', isMatch);
	});
}

function loadTags() {
	var bookmarkIdx = 0;

	function _loadTag() {
		var bookmark;

		do {
			if (bookmarkIdx >= bookmarkList.length) {
				return;
			}
			
			bookmark = bookmarkList[bookmarkIdx];
			++bookmarkIdx;

			if (bookmark === null) {
				continue;
			}
		} while (bookmark.url in localStorage);
		
		bookmark.requestTags(function (tags) {
			localStorage[bookmark.url] = JSON.stringify(tags);
		});

		setTimeout(_loadTag, 500);
	};

	_loadTag();
}

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

function getTagList(tagMap) {
	return $.map(tagMap, function (a) { return a; });
}

function len(bookmarks) {
	var a = 0;

	$.each(bookmarks, function () {
		++a;
	});

	return a;
}


var tagLog = function () {
	var bookmarks = [];

	return function (actionTitle, tag) {
		var newBookmarks = tag.getAllBookmarks();

		console.log(actionTitle, len(bookmarks) + " -> " + len(newBookmarks));

		bookmarks = newBookmarks;
	};
}();

function getOptimal(bookmarkList, recurse) {
		console.log('Bookmark List', bookmarkList.length);
		var tagMap = getTagMap(bookmarkList);

		var tag = new Tag(new Date().toISOString());
		tag.addTags(tagMap);
		tagLog('Add Tags', tag);
		tag.optimise(recurse);
		tagLog('Optimise', tag);
		tag.prune();
		tagLog('Prune', tag);
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
		tagLog('Remove Duplicates', tag);
		tag.prune();
		tagLog('Prune', tag);
		tag.markBookmarksUnsorted();

		return tag;
}

function writeOptimal() {
	chrome.bookmarks.getTree(function (bookmarkTree) {
		getOptimal(bookmarkList, true).createHierarchy(bookmarkTree[0].children[0]);
	});
}

$(document).ready(function() {
	getTree();

	$('#actionConnect').on('click', function () {
		var activeConnect = [];
		var connectList = [];
		var connectionLimit = 5;

		performAction(function (idx, bookmark) {
			connectList.push(bookmark);
		});

		function addConnections(num) {
			while (--num >= 0 && connectList.length > 0) {
				var bookmark = connectList.shift();

				activeConnect.push(bookmark);

				bookmark.connect(function (success) {
					activeConnect.splice(activeConnect.indexOf(bookmark), 1);
				});
			}
		}

		var interval = setInterval(function () {
			addConnections(connectionLimit - activeConnect.length);

			if (connectList.length < 1) {
				clearInterval(interval);
				return;
			}
		}, 50);
	});

	$('#actionSave').on('click', function () {
		performAction(function (idx, bookmark) {
			bookmark.save();
		});
	});

	$('#actionDelete').on('click', function () {
		if (!confirm('Are you sure you want to delete these bookmarks?')) {
			return;
		}

		performAction(function (idx, bookmark) {
			bookmark.remove();
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
		getTree();
	});


	var tableBody = $('#bookmarksTable > tbody');
	tableBody.delegate('tr', 'click', function (ev) {
		ev.preventDefault();

		var inputNode = $(this).find('input[type=checkbox]');

		var check = !inputNode.attr('checked');

		inputNode.attr('checked', check);
		$(this).toggleClass('selected', check);
	});

	tableBody.delegate('td.url a', 'click', function (ev) {
		ev.stopPropagation();
		window.open($(this).text());
	});

	tableBody.delegate('input[type=checkbox]', 'click', function (ev) {
		ev.stopPropagation();
		$(this).closest('tr').toggleClass('selected', $(this).attr('checked'));
	});
});

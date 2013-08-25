$(function () {
	function loadTree() {
		chrome.bookmarks.getTree(function (bookmarkTree) {
			var jsTreeJson = mapBookmarksToJstree(bookmarkTree[0].children);

			$("#demo1").jstree({ 
				core: {
					animation: 0
				},
				json_data: {
					data: jsTreeJson
				},
				plugins: [ "themes", "json_data", "ui" ]
			});
		});
	}

	function mapBookmarksToJstree(bookmarkTree) {
		if ('children' in bookmarkTree) {
			return {
				data: bookmarkTree.title,
				children: mapBookmarksToJstree(bookmarkTree.children)
			};
		}

		if ($.isArray(bookmarkTree)) {
			return bookmarkTree.map(function (bookmarkTree) {
				return mapBookmarksToJstree(bookmarkTree);
			});
		}

		var newBookmark = new Bookmark(bookmarkTree, []);

		return {
			data: newBookmark.title,
			metadata: newBookmark
		};
	}

	$(document).ready(function () {
		loadTree();
	});
});

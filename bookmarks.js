require([
	'BookmarkTableView',
	'ChromeBookmarkStore',
	'TagStores/DefaultCompositeTagStore',
	'BookmarkContentRepository',
	'HtmlParser',
	'MultipleAsyncRequest',
	'BookmarkUpdateFactory'
], function (
	bookmarkTableViewConstructor,
	bookmarkStore,
	compositeTagStore,
	bookmarkContentRepository,
	htmlParser,
	requestConstructor,
	bookmarkUpdateFactory
) {
	bookmarkTableView = new bookmarkTableViewConstructor($('#bookmarksTable'), bookmarkStore, compositeTagStore)
	bookmarkTableView.UpdateTree();

	var select = bookmarkTableView.Select.bind(bookmarkTableView);
	var performAction = bookmarkTableView.PerformAction.bind(bookmarkTableView);

	var updateMap = {};

	$('#actionConnect').on('click', function () {
		var request = new requestConstructor();

		request.SetMaxPendingRequests(5);

		var connect = function (bookmark, callback) {
			var url = bookmark.url;

			function processUpdate(bookmarkUpdate) {
				bookmarkTableView.UpdateTable(bookmarkUpdate, bookmark);
				callback();
			}
		
			bookmarkContentRepository.GetHTML(url, function (data) {
				var title = htmlParser.GetTitle(data);
				var bookmarkUpdate = bookmarkUpdateFactory.CreateUpdate(bookmark.id, title);
				updateMap[bookmarkUpdate.id] = bookmarkUpdate;
				processUpdate(bookmarkUpdate);
			}, function (statusCode) {
				var bookmarkUpdate = bookmarkUpdateFactory.CreateUpdateFromFailure(bookmark.id, statusCode);
				processUpdate(bookmarkUpdate);
			});
		};

		bookmarkTableView.PerformAction(function (idx, bookmark) {
			request.AddRequest(function (callback) {
				connect(bookmark, callback);
			});
		});

		request.Execute();
	});

	$('#actionSave').on('click', function () {
		bookmarkTableView.PerformAction(function (idx, bookmark) {
			if (!(bookmark.id in updateMap)) {
				return;
			}

			var bookmarkUpdate = updateMap[bookmark.id];
			if (!bookmarkUpdate.title) {
				return;
			}

			if (bookmarkUpdate.title === bookmark.title) {
				return;
			}

			bookmarkStore.UpdateBookmarkTitle(bookmark, bookmarkUpdate.title, function (bookmark, bookmarkTitle) {
				bookmark.title = bookmarkTitle;
				bookmarkTableView.UpdateTable(bookmarkUpdate, bookmark);
			});
		});
	});

	$('#actionDelete').on('click', function () {
		if (!confirm('Are you sure you want to delete these bookmarks?')) {
			return;
		}

		bookmarkTableView.PerformAction(function (idx, bookmark) {
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
			return row.hasClass('new');
		});
	});

	$('#selectFailed').on('click', function () {
		select(function (idx, bookmark, row) {
			return row.hasClass('failed');
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
});

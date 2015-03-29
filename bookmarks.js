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

	$('#actionConnect').on('click', function () {
		var request = new requestConstructor();

		request.SetMaxPendingRequests(5);

		var bookmarkUpdates = [];

		var connect = function (bookmark, callback) {
			var url = bookmark.url;
		
			bookmarkContentRepository.GetHTML(url, function (data) {
				var title = htmlParser.GetTitle(data);

				var bookmarkUpdate = bookmarkUpdateFactory.CreateUpdate(bookmark.id, title);
				bookmarkUpdates.push(bookmarkUpdate);

				bookmarkTableView.UpdateTable(bookmarkUpdate, bookmark);

				callback();
			}, function (statusCode) {
				var bookmarkUpdate = bookmarkUpdateFactory.CreateUpdateFromFailure(bookmark.id, statusCode);
				bookmarkUpdates.push(bookmarkUpdate);

				bookmarkTableView.UpdateTable(bookmarkUpdate, bookmark);

				callback();
			});
		};

		bookmarkTableView.PerformAction(function (idx, bookmark) {
			request.AddRequest(function (callback) {
				connect(bookmark, callback);
			});
		});


		request.SetFinalCallback(function () {
			console.log('DONE');
			console.log(bookmarkUpdates);
		});

		request.Execute();
	});

	$('#actionSave').on('click', function () {
		bookmarkTableView.PerformAction(function (idx, bookmark) {
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
});

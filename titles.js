require([
	'knockout',
	'RootFolder',
	'BookmarkTreeReader',
	'ChromeBookmarkStore',
	'BookmarkContentRepository',
	'BookmarkUpdateFactory',
	'MultipleAsyncRequest',
	'HtmlParser'
], function (
	ko,
	rootFolderConstructor,
	bookmarkTreeReader,
	bookmarkStore,
	bookmarkContentRepository,
	bookmarkUpdateFactory,
	requestConstructor,
	htmlParser
	) {
	var updateMap;

	var request;
	var bookmarks;

	bookmarkStore.GetBookmarkTree(function (bookmarkTree)
	{
		var beforeRootFolder = new rootFolderConstructor();
		bookmarkTreeReader.readTree(bookmarkTree[0].children, beforeRootFolder);

		bookmarks = beforeRootFolder.GetAllBookmarks();

		start();
	}.bind(this));

	function getTitleRequest(bookmarks)
	{
		var request = new requestConstructor();

		request.SetMaxPendingRequests(8);

		var connect = function (bookmark, callback) {
			bookmarkContentRepository.GetHTML(bookmark.url, function (data) {
				var title = htmlParser.GetTitle(data);
				var bookmarkUpdate = bookmarkUpdateFactory.CreateUpdate(bookmark.id, title);

				processUpdate(bookmarkUpdate);
			}, function (statusCode) {
				var bookmarkUpdate = bookmarkUpdateFactory.CreateUpdateFromFailure(bookmark.id, statusCode);
				processUpdate(bookmarkUpdate);
			});

			function processUpdate(bookmarkUpdate) {
				callback();

				var requestStatus = request.GetStatus();
				model.requestCount(requestStatus.Completed);
				model.requestTotal(requestStatus.Total);

				updateResults(bookmarkUpdate, bookmark);
			}
		};

		bookmarks.forEach(function (bookmark) {
			request.AddRequest(function (callback) {
				connect(bookmark, callback);
			});
		});

		request.SetFinalCallback(function () {
			model.loadingTitles(false);
		});

		return request;
	}

	function updateResults(bookmarkUpdate, bookmark)
	{
		if (bookmarkUpdate.success) {
			if (bookmarkUpdate.title !== bookmark.title) {
				if (bookmarkUpdate.title) {
					updateMap[bookmarkUpdate.id] = bookmarkUpdate;

					model.updatedBookmarks.push({
						url: bookmark.url,
						original: bookmark.title,
						updated: bookmarkUpdate.title
					});
				} else {
					model.emptyTitleBookmarks.push({
						url: bookmark.url,
						title: bookmark.title
					});
				}
			}
		} else {
			model.missingBookmarks.push({
				url: bookmark.url,
				title: bookmark.title
			});
		}
	}

	function reset()
	{
		updateMap = {};

		model.requestCount(0);
		model.requestTotal(0);
		model.updatedBookmarks([]);
		model.missingBookmarks([]);
		model.emptyTitleBookmarks([]);
	}

	function start()
	{
		reset();

		model.loadingTitles(true);

		request = getTitleRequest(bookmarks);
		request.Execute();
	}

	function stop()
	{
		if (request) {
			request.Stop();
		}
	}

	var model = {
		loadingTitles: ko.observable(false),
		requestCount: ko.observable(0),
		requestTotal: ko.observable(0),
		updatedBookmarks: ko.observableArray(),
		missingBookmarks: ko.observableArray(),
		emptyTitleBookmarks: ko.observableArray(),
		start: function () {
			stop();
			start();
		},
		stopLoading: function () {
			stop();
		},
		updateTitles: function () {
			bookmarks.forEach(function (bookmark) {
				if (bookmark.id in updateMap) {
					var bookmarkUpdate = updateMap[bookmark.id];
					bookmarkStore.UpdateBookmarkTitle(bookmark, bookmarkUpdate.title, function (bookmark, bookmarkTitle) {
						bookmark.title = bookmarkTitle;
					});
				}
			});

			model.updatedBookmarks([]);
		}
	};

	ko.applyBindings(model);
});


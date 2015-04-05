require([
	'RootFolder',
	'BookmarkTreeReader',
	'ChromeBookmarkStore',
	'BookmarkContentRepository',
	'BookmarkUpdateFactory',
	'MultipleAsyncRequest',
	'HtmlParser'
], function (
	rootFolderConstructor,
	bookmarkTreeReader,
	bookmarkStore,
	bookmarkContentRepository,
	bookmarkUpdateFactory,
	requestConstructor,
	htmlParser
	) {
	var updateMap = {};

	bookmarkStore.GetBookmarkTree(function (bookmarkTree)
	{
		var beforeRootFolder = new rootFolderConstructor();
		bookmarkTreeReader.readTree(bookmarkTree[0].children, beforeRootFolder);

		var request = new requestConstructor();

		request.SetMaxPendingRequests(8);

		function updateInterval()
		{
			var requestStatus = request.GetStatus();
			$('#requestCount').text(requestStatus.Completed);	
			$('#requestTotal').text(requestStatus.Total);	

			$('#requestUpdate').show();
		}

		var connect = function (bookmark, callback) {
			var url = bookmark.url;

			function processUpdate(bookmarkUpdate) {
				callback();
				updateInterval();

				var row = $(bookmarkUpdate.success ? '#updatedTitles' : '#cannotFind');
				if (bookmarkUpdate.title !== bookmark.title) {
					row.append($('<li />').text(bookmark.title));
				}
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

		beforeRootFolder.GetAllBookmarks().forEach(function (bookmark) {
			request.AddRequest(function (callback) {
				connect(bookmark, callback);
			});
		});

		request.SetFinalCallback(function () {
			clearInterval(interval);
		});

		request.Execute();

	}.bind(this));
});


require([
	'jquery',
	'jquery.jstree',
	'RootFolder',
	'ChromeBookmarkStore',
	'BookmarkTreeReader',
	'BookmarkTreeViewer',
	'FolderFilter'
], function (
	$,
	jstree,
	rootFolderConstructor,
	bookmarkStore,
	bookmarkTreeReader,
	bookmarkTreeViewerConstructor,
	folderFilter
	) {
	bookmarkStore.GetBookmarkTree(function (bookmarkTree)
	{
		var rootFolder = new rootFolderConstructor();
		bookmarkTreeReader.readTree(bookmarkTree[0].children, rootFolder);

		var bookmarkMap = {};

		rootFolder = folderFilter(rootFolder, function (bookmark) {
			if (bookmark.url in bookmarkMap) {
				return true;
			}
			
			bookmarkMap[bookmark.url] = bookmark;
			return false;
		});

		if (rootFolder.IsEmpty()) {
			$('#duplicateFoundSection').hide();			
			$('#duplicateNotFoundSection').show();			
		} else {
			$('#duplicateFoundSection').show();			
			$('#duplicateNotFoundSection').hide();			
			$('#duplicateCount').text(rootFolder.GetAllBookmarks().length);

			var duplicatesTreeViewer = new bookmarkTreeViewerConstructor('#duplicates', true);
			duplicatesTreeViewer.ShowFolder(rootFolder);
		}
		
		$('#RemoveDuplicates').click(function () {
			bookmarkStore.RemoveDuplicates();
		});
	}.bind(this));
});

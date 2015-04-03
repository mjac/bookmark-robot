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
		
		var duplicatesTreeViewer = new bookmarkTreeViewerConstructor('#duplicates', true);
		duplicatesTreeViewer.ShowFolder(rootFolder);

	}.bind(this));
});
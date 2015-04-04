require([
	'jquery',
	'jquery.jstree',
	'RootFolder',
	'Folder',
	'ChromeBookmarkStore',
	'TagStores/UrlTagStore',
	'TagStores/IntranetTagStore',
	'TagStores/FileTagStore',
	'TagStores/TitleTagStore',
	'BookmarkTreeReader',
	'FolderSorter',
	'FolderStrategy/GreedyFolderStrategy',
	'BookmarkTreeViewer',
	'PropertySort'
], function (
	$,
	jstree,
	rootFolderConstructor,
	folderConstructor,
	bookmarkStore,
	urlTagStore,
	intranetTagStore,
	fileTagStore,
	titleTagStore,
	bookmarkTreeReader,
	folderSorter,
	folderStrategy,
	bookmarkTreeViewerConstructor,
	propertySort
	) {
	function Organize(title, tagStore, bookmarkList, forceEmptyRoot) {
		var tagMap = {};

		var sortedBookmarks = [];
		var unsortedBookmarks = [];

		bookmarkList.forEach(function (bookmark) {
			var tags = tagStore.RequestTags(bookmark);
			if (tags.length > 0) {
				tagMap[bookmark.id] = tags;
				sortedBookmarks.push(bookmark);
			} else {
				unsortedBookmarks.push(bookmark);
			}
		});

		var folder = folderStrategy.OrganizeIntoFolders(sortedBookmarks, tagMap);
		folder.title = title;

		if (forceEmptyRoot) {
			unsortedBookmarks = unsortedBookmarks.concat(folder._bookmarks);
			folder._bookmarks = [];
		}

		return {
			Folder: folder,
			UnsortedBookmarks: unsortedBookmarks
		};
	}

	function TryCategorize(title, tagStore, bookmarkList, afterRootFolder, forceEmptyRoot) {
		var fileFolder = Organize(title, tagStore, bookmarkList, forceEmptyRoot);
		afterRootFolder.AddFolder(fileFolder.Folder);

		return fileFolder.UnsortedBookmarks;
	}

	bookmarkStore.GetBookmarkTree(function (bookmarkTree)
	{
		var beforeRootFolder = new rootFolderConstructor();
		bookmarkTreeReader.readTree(bookmarkTree[0].children, beforeRootFolder);

		var beforeTreeViewer = new bookmarkTreeViewerConstructor('#before', true);
		beforeTreeViewer.ShowFolder(beforeRootFolder);

		var bookmarkList = beforeRootFolder.GetAllBookmarks();
		bookmarkList.sort(propertySort('id'));

		var afterRootFolder = new rootFolderConstructor();

		bookmarkList = TryCategorize('Files', fileTagStore, bookmarkList, afterRootFolder);
		bookmarkList = TryCategorize('Intranet', intranetTagStore, bookmarkList, afterRootFolder);
		bookmarkList = TryCategorize('Websites', urlTagStore, bookmarkList, afterRootFolder, true);
		bookmarkList = TryCategorize('Category', titleTagStore, bookmarkList, afterRootFolder, true);

		var unsortedFolder = new folderConstructor('Unsorted');
		unsortedFolder._bookmarks = bookmarkList;
		afterRootFolder.AddFolder(unsortedFolder);

		folderSorter(afterRootFolder);

		var afterTreeViewer = new bookmarkTreeViewerConstructor('#after', true);
		afterTreeViewer.ShowFolder(afterRootFolder);

		$('#UpdateBookmarks').click(function () {
			bookmarkStore.CreateHierarchy(afterRootFolder);
		});
/*
		$('#RemoveEmpty').click(function () {
			bookmarkStore.RemoveEmptyFolders();
		});
*/
	}.bind(this));
});
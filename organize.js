require([
    'RootFolder',
    'Folder',
    'MultipleAsyncRequest',
    'BookmarkTableView',
    'ChromeBookmarkStore',
    'TagStores/UrlTagStore',
    'TagStores/IntranetTagStore',
    'TagStores/FileTagStore',
    'TagStores/TitleTagStore',
    'BookmarkTreeReader',
    'FolderSorter',
    'FolderStrategy/GreedyFolderStrategy',
    'BookmarkTreeViewer'
], function (
    rootFolderConstructor,
    folderConstructor,
    requestConstructor,
    bookmarkTableViewConstructor,
    bookmarkStore,
    urlTagStore,
    intranetTagStore,
    fileTagStore,
    titleTagStore,
    bookmarkTreeReader,
    folderSorter,
    folderStrategy,
    bookmarkTreeViewerConstructor
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
	
    bookmarkStore.GetBookmarkTree(function (bookmarkTree)
    {
        var beforeRootFolder = new rootFolderConstructor();
        bookmarkTreeReader.readTree(bookmarkTree[0].children, beforeRootFolder);
        
        var beforeTreeViewer = new bookmarkTreeViewerConstructor('#before');
        beforeTreeViewer.ShowFolder(beforeRootFolder);
		
        var bookmarkList = beforeRootFolder.GetAllBookmarks();
		
        var afterRootFolder = new rootFolderConstructor();
		
		var fileFolder = Organize('Files', fileTagStore, bookmarkList);
		afterRootFolder.AddFolder(fileFolder.Folder);
		
		var intranetFolder = Organize('Intranet', intranetTagStore, fileFolder.UnsortedBookmarks);
		afterRootFolder.AddFolder(intranetFolder.Folder);
		
		var websiteFolder = Organize('Websites', urlTagStore, intranetFolder.UnsortedBookmarks, true);
		afterRootFolder.AddFolder(websiteFolder.Folder);
		
		var titleFolder = Organize('Category', titleTagStore, websiteFolder.UnsortedBookmarks, true);
		afterRootFolder.AddFolder(titleFolder.Folder);
		
		var unsortedFolder = new folderConstructor('Unsorted');
		unsortedFolder._bookmarks = titleFolder.UnsortedBookmarks;
		afterRootFolder.AddFolder(unsortedFolder);
		
		folderSorter(afterRootFolder);
		
		var afterTreeViewer = new bookmarkTreeViewerConstructor('#after');
		afterTreeViewer.ShowFolder(afterRootFolder);

		$('#UpdateBookmarks').click(function () {
			bookmarkStore.CreateHierarchy(afterRootFolder);
		});

		$('#RemoveEmpty').click(function () {
			bookmarkStore.RemoveEmptyFolders();
		});
    }.bind(this));
});
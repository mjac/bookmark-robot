require([
    'RootFolder',
    'Folder',
    'MultipleAsyncRequest',
    'BookmarkTableView',
    'ChromeBookmarkStore',
    'TagStores/UrlTagStore',
    'TagStores/IntranetTagStore',
    'TagStores/FileTagStore',
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
    bookmarkTreeReader,
    folderSorter,
    folderStrategy,
    bookmarkTreeViewerConstructor
) {
	function Organize(title, tagStore, bookmarkList) {
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
		
		var intranetFolder = Organize('Local Domains', intranetTagStore, fileFolder.UnsortedBookmarks);
		afterRootFolder.AddFolder(intranetFolder.Folder);
		
		// Need to adapt this to remove unsorted bookmarks in the root directory
		// Allow bookmarks in base directory = false
		var websiteFolder = Organize('Websites', urlTagStore, intranetFolder.UnsortedBookmarks);
		afterRootFolder.AddFolder(websiteFolder.Folder);
		
		folderSorter(afterRootFolder);
		
		var afterTreeViewer = new bookmarkTreeViewerConstructor('#after');
		afterTreeViewer.ShowFolder(afterRootFolder);
    }.bind(this));
});
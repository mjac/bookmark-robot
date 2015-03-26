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
    function AddTags(bookmarkList, tagStore, callback) {
        var bookmarkToTagMap = {};
        
        bookmarkList.forEach(function (bookmark) {
			bookmarkToTagMap[bookmark.id] = tagStore.RequestTags(bookmark);
        });
		
		return bookmarkToTagMap;
    }
    
	function organize(title, tagStore, bookmarkList) {
		var tagMap = AddTags(bookmarkList, tagStore);
		
		var folder = folderStrategy.OrganizeIntoFolders(bookmarkList, tagMap);
		folder.title = title;
		
		return folder;
	}
	
    bookmarkStore.GetBookmarkTree(function (bookmarkTree)
    {
        var beforeRootFolder = new rootFolderConstructor();
        bookmarkTreeReader.readTree(bookmarkTree[0].children, beforeRootFolder);
        
        var beforeTreeViewer = new bookmarkTreeViewerConstructor('#before');
        beforeTreeViewer.ShowFolder(beforeRootFolder);
		
        var afterRootFolder = new rootFolderConstructor();
        var bookmarkList = beforeRootFolder.GetAllBookmarks();
		
		afterRootFolder.AddFolder(organize('Files', fileTagStore, bookmarkList));
		afterRootFolder.AddFolder(organize('Local Domains', intranetTagStore, bookmarkList));
		afterRootFolder.AddFolder(organize('Websites', urlTagStore, bookmarkList));
		
		var afterTreeViewer = new bookmarkTreeViewerConstructor('#after');
					
		folderSorter(afterRootFolder);
		afterTreeViewer.ShowFolder(afterRootFolder);
    }.bind(this));
});
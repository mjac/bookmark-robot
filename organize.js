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
    
    bookmarkStore.GetBookmarkTree(function (bookmarkTree)
    {
        var beforeRootFolder = new rootFolderConstructor();
        bookmarkTreeReader.readTree(bookmarkTree[0].children, beforeRootFolder);
        
        var beforeTreeViewer = new bookmarkTreeViewerConstructor('#before');
        beforeTreeViewer.ShowFolder(beforeRootFolder);
            
        var afterRootFolder = new rootFolderConstructor();
        var bookmarkList = beforeRootFolder.GetAllBookmarks();
		
        var fileTagMap = AddTags(bookmarkList, fileTagStore);
		var fileFolder = folderStrategy.OrganizeIntoFolders(bookmarkList, fileTagMap);
		
		fileFolder.title = 'Files';
		afterRootFolder.AddFolder(fileFolder);
        
		var intranetTagMap = AddTags(bookmarkList, intranetTagStore);
		var intranetFolder = folderStrategy.OrganizeIntoFolders(bookmarkList, intranetTagMap);
		
		intranetFolder.title = 'Local Domains';
		afterRootFolder.AddFolder(intranetFolder);
		
		var urlTagMap = AddTags(bookmarkList, urlTagStore);
		var newFolder = folderStrategy.OrganizeIntoFolders(bookmarkList, urlTagMap);
			
		newFolder.title = 'Websites';
		afterRootFolder.AddFolder(newFolder);
		
		var afterTreeViewer = new bookmarkTreeViewerConstructor('#after');
					
		folderSorter(afterRootFolder);
		afterTreeViewer.ShowFolder(afterRootFolder);
    }.bind(this));
});
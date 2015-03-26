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
        var bookmarkList = [];
        var bookmarkToTagMap;
		
        var beforeRootFolder = new rootFolderConstructor();
        bookmarkTreeReader.readTree(bookmarkTree[0].children, beforeRootFolder);
        
        var beforeTreeViewer = new bookmarkTreeViewerConstructor('#before');
        beforeTreeViewer.ShowFolder(beforeRootFolder);
            
        var afterRootFolder = new rootFolderConstructor();
        var bookmarkList = beforeRootFolder.GetAllBookmarks();
		
        bookmarkToTagMap = AddTags(bookmarkList, fileTagStore);
		var fileFolder = folderStrategy.OrganizeIntoFolders(bookmarkList, bookmarkToTagMap);
		
		fileFolder.title = 'Files';
		afterRootFolder.AddFolder(fileFolder);
        
		bookmarkToTagMap = AddTags(bookmarkList, intranetTagStore);
		var intranetFolder = folderStrategy.OrganizeIntoFolders(bookmarkList, bookmarkToTagMap);
		
		intranetFolder.title = 'Local Domains';
		afterRootFolder.AddFolder(intranetFolder);
		
		bookmarkToTagMap = AddTags(bookmarkList, urlTagStore);
		var newFolder = folderStrategy.OrganizeIntoFolders(bookmarkList, bookmarkToTagMap);
			
		newFolder.title = 'Websites';
		afterRootFolder.AddFolder(newFolder);
		
		var afterTreeViewer = new bookmarkTreeViewerConstructor('#after');
					
		folderSorter(afterRootFolder);
		afterTreeViewer.ShowFolder(afterRootFolder);
    }.bind(this));
});
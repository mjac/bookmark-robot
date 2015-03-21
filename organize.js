require([
    'RootFolder',
    'MultipleAsyncRequest',
    'BookmarkTableView',
    'ChromeBookmarkStore',
    'TagStores/DefaultCompositeTagStore',
    'BookmarkTreeReader',
    'FolderStrategy/FlatFolderStrategy',
	'BookmarkTreeViewer'
], function (
    rootFolderConstructor,
    requestConstructor,
    bookmarkTableViewConstructor,
    bookmarkStore,
    compositeTagStore,
    bookmarkTreeReader,
    flatFolderStrategy,
	bookmarkTreeViewerConstructor
) {
    function AddTags(bookmarkList, callback) {
        var request = new requestConstructor();
        
        bookmarkList.forEach(function (bookmark) {
            request.AddRequest(function (requestCallback) {
                compositeTagStore.RequestTags(bookmark, function (bookmarkUrl, tags) {
                    bookmark.tags = tags;
                    requestCallback();
                });
            });
        });
        
        request.SetFinalCallback(callback);
        
        request.Execute();
    }
    
    bookmarkStore.GetBookmarkTree(function (bookmarkTree)
    {
        var bookmarkList = [];
        var rootFolder = new rootFolderConstructor();
        
        bookmarkTreeReader.readTree(bookmarkTree[0].children, rootFolder);
        
        var bookmarkList = rootFolder.GetAllBookmarks();
        
        AddTags(bookmarkList, function () {
			var beforeTreeViewer = new bookmarkTreeViewerConstructor('#before');
            beforeTreeViewer.ShowFolder(rootFolder);
			
			var afterTreeViewer = new bookmarkTreeViewerConstructor('#after');
            var newFolders = flatFolderStrategy.OrganizeIntoFolders(bookmarkList);
            afterTreeViewer.ShowFolder(newFolders);
        }.bind(this));
    }.bind(this));
});
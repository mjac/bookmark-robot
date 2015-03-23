require([
    'RootFolder',
    'Folder',
    'MultipleAsyncRequest',
    'BookmarkTableView',
    'ChromeBookmarkStore',
    'TagStores/UrlTagStore',
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
    bookmarkTreeReader,
    folderSorter,
    folderStrategy,
    bookmarkTreeViewerConstructor
) {
    function AddTags(bookmarkList, tagStore, callback) {
        var request = new requestConstructor();
        
        var bookmarkToTagMap = {};
        
        bookmarkList.forEach(function (bookmark) {
            request.AddRequest(function (requestCallback) {
                urlTagStore.RequestTags(bookmark, function (bookmarkUrl, tags) {
                    bookmarkToTagMap[bookmark.id] = tags;
                    requestCallback();
                });
            });
        });
        
        request.SetFinalCallback(function () {
            callback(bookmarkToTagMap);
        });
        
        request.Execute();
    }
    
    bookmarkStore.GetBookmarkTree(function (bookmarkTree)
    {
        var bookmarkList = [];
        
        var beforeRootFolder = new rootFolderConstructor();
        bookmarkTreeReader.readTree(bookmarkTree[0].children, beforeRootFolder);
        
        var beforeTreeViewer = new bookmarkTreeViewerConstructor('#before');
        beforeTreeViewer.ShowFolder(beforeRootFolder);
            
        var afterRootFolder = new rootFolderConstructor();
        var bookmarkList = beforeRootFolder.GetAllBookmarks();
        
        AddTags(bookmarkList, urlTagStore, function (bookmarkToTagMap) {
            var afterTreeViewer = new bookmarkTreeViewerConstructor('#after');
            
            var newFolder = folderStrategy.OrganizeIntoFolders(bookmarkList, bookmarkToTagMap);
            newFolder.title = 'Websites';
            afterRootFolder.AddFolder(newFolder);
            
            var unsortedFolder = new folderConstructor('Unsorted');
            
            unsortedFolder._bookmarks = unsortedFolder._bookmarks.concat(newFolder._bookmarks);
            newFolder._bookmarks = [];
            
            afterRootFolder.AddFolder(unsortedFolder);
                        
            folderSorter(afterRootFolder);
            afterTreeViewer.ShowFolder(afterRootFolder);
        }.bind(this));
    }.bind(this));
});
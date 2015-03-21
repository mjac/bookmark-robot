require([
    'RootFolder',
    'MultipleAsyncRequest',
    'BookmarkTableView',
    'ChromeBookmarkStore',
    'TagStores/DefaultCompositeTagStore',
    'BookmarkTreeReader',
    'FolderStrategy/FlatFolderStrategy'
], function (
    rootFolderConstructor,
    requestConstructor,
    bookmarkTableViewConstructor,
    bookmarkStore,
    compositeTagStore,
    bookmarkTreeReader,
    flatFolderStrategy
) {
    function mapTreeData(folder)
    {
        var treeFolder = [];
        
        var subFolders = folder.GetFolders();
        subFolders.forEach(function (folder) {
            treeFolder.push({
                text: folder.title,
                state: { opened: false },
                children: mapTreeData(folder)
            });
        });
        
        var subBookmarks = folder.GetBookmarks();
        subBookmarks.forEach(function (bookmark) {
            treeFolder.push(bookmark.title);
        });
        
        return treeFolder;
    }

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

    function setTreeData(id, data)
    {
        $(id).jstree({
            core: { data: data }
        });
    }
    
    bookmarkStore.GetBookmarkTree(function (bookmarkTree)
    {
        var bookmarkList = [];
        var rootFolder = new rootFolderConstructor();
        
        bookmarkTreeReader.readTree(bookmarkTree[0].children, rootFolder);
        
        var bookmarkList = rootFolder.GetAllBookmarks();
        
        AddTags(bookmarkList, function () {
            var treeData = mapTreeData(rootFolder);
            setTreeData('#before', treeData);
            
            var newFolders = flatFolderStrategy.OrganizeIntoFolders(bookmarkList);
            var newTreeData = mapTreeData(newFolders);
            setTreeData('#after', newTreeData);
        }.bind(this));
    }.bind(this));
});
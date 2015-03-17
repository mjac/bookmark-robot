$(function() {
	var bookmarkStore;
	var bookmarkTableView;
    
    require([
        'Bookmark',
        'Folder',
        'MultipleAsyncRequest',
        'BookmarkTableView',
        'ChromeBookmarkStore',
        'TagStores/DefaultCompositeTagStore'
    ], function (
        bookmarkConstructor,
        folderConstructor,
        requestConstructor,
        bookmarkTableViewConstructor,
        bookmarkStore,
        compositeTagStore
    ) {
        function readTree(bookmarkTree, bookmarks) {
            if ('children' in bookmarkTree) {
                var folder = new folderConstructor(bookmarkTree.title);
                bookmarks.AddFolder(folder);
                    
                readTree(bookmarkTree.children, folder);
            } else if ($.isArray(bookmarkTree)) {
                for (localIdx in bookmarkTree) {
                    var bookmarkChild = bookmarkTree[localIdx];
                    readTree(bookmarkChild, bookmarks);
                }
            } else {
                var newBookmark = new bookmarkConstructor(bookmarkTree.title, bookmarkTree.url);
                bookmarks.AddBookmark(newBookmark);
            }
        }

        bookmarkStore.GetBookmarkTree(function (bookmarkTree)
        {
            var bookmarkList = [];
            var rootFolder = new folderConstructor('Root');
            
            readTree(bookmarkTree[0].children, rootFolder);
            
            var bookmarkList = rootFolder.GetAllBookmarks();
            console.log(bookmarkList[0]);
            AddTags(bookmarkList, function () {
                //setTreeData(bookmarkList.map(treeNode));
            }.bind(this));
        }.bind(this));
        
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
    });
    
    function setTreeData(id, data)
    {
        $(id).jstree({
            'core': { 'data': data }
        });
    }
});

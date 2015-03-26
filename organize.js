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
        var request = new requestConstructor();
        
        var bookmarkToTagMap = {};
        
        bookmarkList.forEach(function (bookmark) {
            request.AddRequest(function (requestCallback) {
                tagStore.RequestTags(bookmark, function (bookmarkUrl, tags) {
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
		
        AddTags(bookmarkList, fileTagStore, function (bookmarkToTagMap) {
			var fileFolder = folderStrategy.OrganizeIntoFolders(bookmarkList, bookmarkToTagMap);
			
			fileFolder.title = 'Files';
			afterRootFolder.AddFolder(fileFolder);
        
			AddTags(fileFolder._bookmarks, intranetTagStore, function (bookmarkToTagMap) {
				var intranetFolder = folderStrategy.OrganizeIntoFolders(fileFolder._bookmarks, bookmarkToTagMap);
				fileFolder._bookmarks = [];
				
				intranetFolder.title = 'Local Domains';
				afterRootFolder.AddFolder(intranetFolder);
				
				AddTags(intranetFolder._bookmarks, urlTagStore, function (bookmarkToTagMap) {
					var newFolder = folderStrategy.OrganizeIntoFolders(intranetFolder._bookmarks, bookmarkToTagMap);
					intranetFolder._bookmarks = [];
						
					newFolder.title = 'Websites';
					afterRootFolder.AddFolder(newFolder);
					
					var afterTreeViewer = new bookmarkTreeViewerConstructor('#after');
					
					var unsortedFolder = new folderConstructor('Unsorted');
					
					unsortedFolder._bookmarks = unsortedFolder._bookmarks.concat(newFolder._bookmarks);
					newFolder._bookmarks = [];
					
					afterRootFolder.AddFolder(unsortedFolder);
								
					folderSorter(afterRootFolder);
					afterTreeViewer.ShowFolder(afterRootFolder);
				}.bind(this));
			});
		});
    }.bind(this));
});
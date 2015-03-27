define(['RootFolder', 'Folder', 'PropertySort'], function (rootFolderConstructor, folderConstructor, propertySort) {
	var minBookmarksPerFolder = 4;
	
    function GreedyFolderStrategy()
    {
    }
	
	GreedyFolderStrategy.prototype.OrganizeIntoFolders = function (bookmarkList, bookmarkToTagMap) {
        var rootFolder = new rootFolderConstructor();
        
		var tags = {};
		
        bookmarkList.forEach(function (bookmark) {
			var bookmarkTags = bookmarkToTagMap[bookmark.id];
            bookmarkTags.forEach(function (tag) {
				if (!(tag in tags)) {
					tags[tag] = [];
				}
				
				tags[tag].push(bookmark);
			});
        });
		
		var tagFrequency = [];
		for (var tag in tags) {
			var tagLength = tags[tag].length;
			if (tagLength >= minBookmarksPerFolder) {
				tagFrequency.push([tag, tagLength]);
			}
		}
		
		tagFrequency.sort(propertySort(1, true));
		
		var addedBookmarks = {};
		var foldersUnderRoot = tagFrequency.reduce(function (folders, tagPair) {
			var tag = tagPair[0];
			var bookmarks = tags[tag];
			
			var tagFolder = new folderConstructor(tag);
			
			bookmarks.forEach(function (bookmark) {
				if (!(bookmark.id in addedBookmarks)) {
					tagFolder.AddBookmark(bookmark);
					addedBookmarks[bookmark.id] = true;
				}
			});
			
			if (tagFolder.GetBookmarks().length > minBookmarksPerFolder) {
				rootFolder.AddFolder(tagFolder);
			}
			
			return folders;
		}, rootFolder);
		
        bookmarkList.forEach(function (bookmark) {
			if (!(bookmark.id in addedBookmarks)) {
				rootFolder.AddBookmark(bookmark);
			}
        });
        
        return rootFolder;
	};
	
	return new GreedyFolderStrategy();
});
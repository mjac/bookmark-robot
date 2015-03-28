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

		DepluralizeTags(tags);
	
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

	function DepluralizeTags(tags)
	{
		for (var tag in tags) {
			if (tag.slice(-1) === 's') {
				var depluralized = tag.substring(0, tag.length - 1);
				if (depluralized in tags) {
					var frequency = tags[tag].length;
					var depluralizedFrequency = tags[depluralized].length;

					var sourceTag, targetTag;
					if (depluralizedFrequency > frequency) {
						sourceTag = tag;
						targetTag = depluralized;
					} else {
						sourceTag = depluralized;
						targetTag = tag;
					}

					tags[targetTag] = tags[targetTag].concat(tags[sourceTag]);
					delete tags[sourceTag];
				}
			}
		}
	}
	
	return new GreedyFolderStrategy();
});

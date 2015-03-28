define(['RootFolder', 'Folder', 'PropertySort'], function (rootFolderConstructor, folderConstructor, propertySort) {
	var minBookmarksPerFolder = 4;
	
    function GreedyFolderStrategy()
    {
    }
	
	GreedyFolderStrategy.prototype.OrganizeIntoFolders = function (bookmarkList, bookmarkToTagMap) {
        var rootFolder = new rootFolderConstructor();
        
		var tags = {};
		var addedBookmarks = {};
		
        bookmarkList.forEach(function (bookmark) {
			var bookmarkTags = bookmarkToTagMap[bookmark.id];
            bookmarkTags.forEach(function (tag) {
				if (!(tag in tags)) {
					tags[tag] = [];
				}
				
				tags[tag].push(bookmark);
			});

			addedBookmarks[bookmark.id] = false;
        });

		DepluralizeTags(tags);
	
		var tagFrequency = [];
		for (var tag in tags) {
			var tagLength = tags[tag].length;
			tagFrequency.push([tag, tagLength]);
		}
		
		tagFrequency.sort(propertySort(1, true));
		
		tagFrequency.forEach(function (tagPair) {
			var tag = tagPair[0];
			
			var bookmarks = tags[tag];
			var leftOverBookmarks = bookmarks.filter(function (bookmark) {
				return !addedBookmarks[bookmark.id];
			});

			if (leftOverBookmarks.length < minBookmarksPerFolder) {
				return;
			}

			var tagFolder = new folderConstructor(tag);
			
			leftOverBookmarks.forEach(function (bookmark) {
			if(addedBookmarks[bookmark.id]) console.log(bookmark, tagPair);
				tagFolder.AddBookmark(bookmark);
				addedBookmarks[bookmark.id] = true;
			});

			rootFolder.AddFolder(tagFolder);
		});
		
        bookmarkList.forEach(function (bookmark) {
			if (!addedBookmarks[bookmark.id]) {
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

					tags[sourceTag].forEach(function (bookmark) {
						if (tags[targetTag].indexOf(bookmark) === -1) {
							tags[targetTag].push(bookmark);
						}
					});

					delete tags[sourceTag];
				}
			}
		}
	}
	
	return new GreedyFolderStrategy();
});

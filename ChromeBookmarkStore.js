define(function () {
    function ChromeBookmarkStore()
    {
    }

    ChromeBookmarkStore.prototype = {
        CreateBookmarkFolder: function(name, id, callback)
        {
            chrome.bookmarks.create({
                title: name,
                parentId: id
            }, function (tagTree) {
                callback(tagTree);
            });
        },

        MoveBookmark: function(bookmarkId, targetLocationId)
        {
            chrome.bookmarks.move(bookmarkId, {
                parentId: targetLocationId
            });
        },

        WriteBookmarkList: function(bookmarkList) {
            chrome.bookmarks.getTree(function (bookmarkTree) {
                bookmarkList.createHierarchy(bookmarkTree[0].children[0]);
            });
        },

        GetBookmarkTree: function (callback) {
            chrome.bookmarks.getTree(function (bookmarkTree) {
                callback(bookmarkTree[0].children);
            });
        },

        RemoveBookmark: function (bookmark, callback) {
            chrome.bookmarks.remove(bookmark.id, function () {
                callback(bookmark);
            });
        },

        UpdateBookmarkTitle: function (bookmark, newTitle, callback) {
            chrome.bookmarks.update(bookmark.id, {
                title: newTitle
            }, function (updatedBookmark) {
                callback(bookmark, updatedBookmark.title);
            });
        },

		RemoveEmptyFolders: function () {
			function removeAll(bookmarkTree) {
				if ('url' in bookmarkTree) {
					return;
				}

				if (bookmarkTree.children.length > 0) {
					bookmarkTree.children.forEach(removeAll);
					return;
				}

				chrome.bookmarks.remove(bookmarkTree.id);
			}

            chrome.bookmarks.getTree(function (bookmarkTree) {
				removeAll(bookmarkTree[0]);
            });
		},

		CreateHierarchy: function (folder) {
			var store = this;

			function write(folder, bookmarkTree) {
				var childrenByName = {};

				if (bookmarkTree.children) {
					bookmarkTree.children.forEach(function (subBookmarkTree) {
						if (!('url' in subBookmarkTree)) {
							childrenByName[subBookmarkTree.title] = subBookmarkTree;	
						}
					});
				}

				folder._folders.forEach(function (subFolder) {
					if (subFolder.title in childrenByName) {
						write(subFolder, childrenByName[subFolder.title]);
					} else {
						store.CreateBookmarkFolder(subFolder.title, bookmarkTree.id, function (tagTree) {
							childrenByName[subFolder.title] = tagTree;
							write(subFolder, childrenByName[subFolder.title]);
						});
					}
				});

				folder._bookmarks.forEach(function (bookmark) {
					store.MoveBookmark(bookmark.id, bookmarkTree.id);
				});
			}

            chrome.bookmarks.getSubTree('1', function (bookmarkTreeParent) {
                var bookmarksBar = bookmarkTreeParent[0];
				write(folder, bookmarksBar);
            });
		}
    };
    
    return new ChromeBookmarkStore();
});
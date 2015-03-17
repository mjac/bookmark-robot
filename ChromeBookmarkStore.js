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
        }
    };
    
    return new ChromeBookmarkStore();
});
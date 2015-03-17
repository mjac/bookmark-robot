define(function () {
    function Folder(title) {
        this.title = title;
        this._bookmarks = [];
        this._folders = [];
    };

    Folder.prototype = {
        AddBookmark: function (bookmark) {
            this._bookmarks.push(bookmark);
        },
        
        AddFolder: function (folder) {
            this._folders.push(folder);
        },
        
        GetAllBookmarks: function (folder) {
            var bookmarks = this._bookmarks.concat();
            
            this._folders.forEach(function (folder) {
                var subBookmarks = folder.GetAllBookmarks();
                bookmarks = bookmarks.concat(subBookmarks);
            });
            
            return bookmarks;
        }
    };
    
    return Folder;
});
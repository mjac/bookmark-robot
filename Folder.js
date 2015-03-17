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
        }
    };
    
    return Folder;
});
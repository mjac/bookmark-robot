define(function () { 
    function BookmarkTreeViewer(id, showCounts)
    {
        this.id = id;
		this.showCounts = !!showCounts;
    }
    
    BookmarkTreeViewer.prototype.ShowFolder = function (rootFolder)
    {
        var treeData = this._mapTreeData(rootFolder);
        setTreeData(this.id, treeData);
    };
    
    BookmarkTreeViewer.prototype._mapTreeData = function (folder)
    {
        var treeFolder = [];

        var subFolders = folder.GetFolders();
        subFolders.forEach(function (folder) {
			var title = folder.title;
			if (this.showCounts) {
				title += ' (' + folder.GetAllBookmarks().length + ')';
			}

            treeFolder.push({
                text: title,
                state: { opened: false },
                children: this._mapTreeData(folder)
            });
        }.bind(this));
        
        var subBookmarks = folder.GetBookmarks();
        subBookmarks.forEach(function (bookmark) {
            var treeBookmark = {
                text: bookmark.title,
                url: bookmark.url
            };
            treeFolder.push(treeBookmark);
        });
        
        return treeFolder;
    };

    function setTreeData(id, data)
    {
        $(id).jstree({
            core: { data: data }
        });
        
        $(id).bind("select_node.jstree", function (e, data) {
            var sourceNode = data.node.original;
            if ('url' in sourceNode) {
                window.open(sourceNode.url, '_blank');
            }
        }) ;
    }
    
    return BookmarkTreeViewer;
});

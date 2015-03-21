define(function () { 
    function BookmarkTreeViewer(id)
    {
        this.id = id;
    }
    
    BookmarkTreeViewer.prototype.ShowFolder = function (rootFolder)
    {
        var treeData = mapTreeData(rootFolder);
        setTreeData(this.id, treeData);
    }
    
    function mapTreeData(folder)
    {
        var treeFolder = [];
        
        var subFolders = folder.GetFolders();
        subFolders.forEach(function (folder) {
            treeFolder.push({
                text: folder.title,
                state: { opened: false },
                children: mapTreeData(folder)
            });
        });
        
        var subBookmarks = folder.GetBookmarks();
        subBookmarks.forEach(function (bookmark) {
            treeFolder.push(bookmark.title);
        });
        
        return treeFolder;
    }

    function setTreeData(id, data)
    {
        $(id).jstree({
            core: { data: data }
        });
    }
    
    return BookmarkTreeViewer;
});

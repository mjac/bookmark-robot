define(function () {
	function BookmarkTreeViewer(id, showCounts)
	{
		this.id = id;
		this.showCounts = !!showCounts;
	}

	BookmarkTreeViewer.prototype.ShowFolder = function (rootFolder)
	{
		var treeData = this._mapTreeData(rootFolder);
		treeData.state.opened = true;

		setTreeData(this.id, [treeData]);
	};

	BookmarkTreeViewer.prototype._mapTreeData = function (folder)
	{
		var title = folder.title;
		if (this.showCounts) {
			title += ' (' + folder.GetAllBookmarks().length + ')';
		}

		var treeFolder = {
			text: title,
			state: {opened: false},
			children: []
		};

		var subFolders = folder.GetFolders();
		subFolders.forEach(function (subFolder) {
			var subFolderData = this._mapTreeData(subFolder);
			treeFolder.children.push(subFolderData);
		}.bind(this));

		var subBookmarks = folder.GetBookmarks();
		subBookmarks.forEach(function (bookmark) {
			var treeBookmark = {
				text: bookmark.title,
				url: bookmark.url
			};
			treeFolder.children.push(treeBookmark);
		});

		return treeFolder;
	};

	function setTreeData(id, data)
	{
		$(id).jstree({
			core: {data: data}
		});

		$(id).bind("select_node.jstree", function (e, data) {
			var sourceNode = data.node.original;
			if ('url' in sourceNode) {
				window.open(sourceNode.url, '_blank');
			}
		});
	}

	return BookmarkTreeViewer;
});

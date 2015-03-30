define(['RootFolder'], function (rootFolderConstructor) {
	function FlatFolderStrategy()
	{
	}

	FlatFolderStrategy.prototype.OrganizeIntoFolders = function (bookmarkList) {
		var rootNode = new rootFolderConstructor();

		bookmarkList.forEach(function (bookmark) {
			rootNode.AddBookmark(bookmark);
		});

		return rootNode;
	};

	return new FlatFolderStrategy();
});
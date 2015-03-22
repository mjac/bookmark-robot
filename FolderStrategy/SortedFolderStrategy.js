define(['PropertySort'], function (propertySort) {
    function SortedFolderStrategy(innerStrategy)
    {
		this._innerStrategy = innerStrategy;
    }
	
	SortedFolderStrategy.prototype.OrganizeIntoFolders = function (bookmarkList) {
        var rootFolder = this._innerStrategy.OrganizeIntoFolders(bookmarkList);
		SortFolder(rootFolder);
		
		return rootFolder;
	};
	
	var sortByTitle = propertySort('title');
	
	function SortFolder(folder)
	{
		folder._bookmarks.sort(sortByTitle);
		folder._folders.sort(sortByTitle);
		folder._folders.forEach(SortFolder);
	}
	
	return SortedFolderStrategy;
});
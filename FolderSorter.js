define(['PropertySort'], function (propertySort) {
	var sortByTitle = propertySort('title');
	
	function SortFolder(folder)
	{
		folder._bookmarks.sort(sortByTitle);
		folder._folders.sort(sortByTitle);
		folder._folders.forEach(SortFolder);
	}
	
	return SortFolder;
});
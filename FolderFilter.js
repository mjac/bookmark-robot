define(['Folder'], function (folderConstructor) {
	function ApplyFilter(folder, filter)
	{
		var newFolder = new folderConstructor();
		newFolder.title = folder.title;
		
		newFolder._bookmarks = folder._bookmarks.filter(filter);
		newFolder._folders = folder._folders.map(function (folder) {
			return ApplyFilter(folder, filter);
		}).filter(function (folder) {
			return !folder.IsEmpty();
		});

		return newFolder;
	}
	
	return ApplyFilter;
});
require([
	'Folder',
	'Bookmark',
	'FolderFilter'
], function (
	folderConstructor,
	bookmarkConstructor,
	folderFilter
	) {
	QUnit.module('FolderFilter');

	QUnit.test('Empty folder is still empty', function () {
		var folder = new folderConstructor('Folder Title');
		var filteredFolder = folderFilter(folder, filterNone);
		
		strictEqual(filteredFolder.IsEmpty(), true);
	});

	QUnit.test('Bookmark is not filtered', function () {
		var folder = new folderConstructor('Folder Title');
		folder.AddBookmark(new bookmarkConstructor('1', 'Title', 'Url'));
		
		var filteredFolder = folderFilter(folder, filterNone);
		
		strictEqual(filteredFolder.IsEmpty(), false);
	});

	QUnit.test('Bookmark is filtered', function () {
		var folder = new folderConstructor('Folder Title');
		folder.AddBookmark(new bookmarkConstructor('1', 'Title', 'Url'));
		
		var filteredFolder = folderFilter(folder, filterAll);
		
		strictEqual(filteredFolder.IsEmpty(), true);
	});
	
	function filterNone() {
		return true;
	}
	
	function filterAll() {
		return false;
	}
});

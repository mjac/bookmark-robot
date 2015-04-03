require(['Folder', 'Bookmark'], function (folderConstructor, bookmarkConstructor) {
	QUnit.module('Folder');

	QUnit.test('Folder is empty without bookmark', function () {
		var folder = new folderConstructor('Folder Title');
		strictEqual(folder.IsEmpty(), true);
	});

	QUnit.test('Folder is not empty with bookmark', function () {
		var folder = new folderConstructor('Folder Title');
		folder.AddBookmark(new bookmarkConstructor('1', 'Title', 'Url'));

		strictEqual(folder.IsEmpty(), false);
	});

	QUnit.test('Folder is not empty with subfolder', function () {
		var folder = new folderConstructor('Folder Title');
		folder.AddFolder(new folderConstructor('Subfolder Title'));

		strictEqual(folder.IsEmpty(), false);
	});
});

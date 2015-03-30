
test('', function () {
	var input = [
		'Coding/C++ Tips',
		'Cooking/How to cook bolognese',
	];

	var mockBookmarkStore = new MockBookmarkStore();

	var bookmarks = mockBookmarkStore.GetBookmarks(input);

});

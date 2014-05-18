require(['Tag', 'Bookmark'], function () {
	function ExampleVisitor()
	{
		this.lastVisited = null;

		this.visit = function (object) {
			this.lastVisited = object;
		};
	}

	test('Add bookmark to tag', function () {
		var tag = new Tag('TagName');

		var bookmark = new Bookmark('title', 'url');
		tag.AddBookmark(bookmark);

		strictEqual(tag.bookmarks['url'], bookmark);
	});

	test('Add multiple bookmarks to tag', function () {
		var tag = new Tag('TagName');

		var bookmark = new Bookmark('title', 'url1');
		var bookmark = new Bookmark('title', 'url2');
		tag.AddBookmark(bookmark);

		var tag2 = new Tag('TagName2');
		tag2.AddBookmarks(tag.bookmarks);

		propEqual(tag2.bookmarks, tag.bookmarks);
	});

	test('Remove bookmark from tag', function () {
		var tag = new Tag('TagName');

		var bookmark = new Bookmark('title', 'url');
		tag.AddBookmark(bookmark);
		tag.RemoveBookmark(bookmark);

		ok(typeof tag.bookmarks['url'] === 'undefined');
	});

	test('Add tag to tag', function () {
		var tag = new Tag('TagName');
		var tagChild = new Tag('TagChildName');

		tag.AddTag(tagChild);

		strictEqual(tag.tags['TagChildName'], tagChild);
	});

	test('Add tags to tag', function () {
		var tag = new Tag('TagName');

		var tagChild1 = new Tag('TagChildName1');
		tag.AddTag(tagChild1);

		var tagChild2 = new Tag('TagChildName2');
		tag.AddTag(tagChild2);

		var tag2 = new Tag('TagName2');
		tag2.AddTags(tag.tags);

		propEqual(tag2.tags, tag.tags);
	});

	test('Tags are cloned', function () {
		var tag = new Tag('TagName');

		var tagChild = new Tag('TagChildName');
		tag.AddTag(tagChild);

		var tag2 = tag.Clone();

		propEqual(tag2.bookmarks, tag.bookmarks);
	});

	test('Bookmarks are cloned', function () {
		var tag = new Tag('TagName');

		var tagChild = new Tag('TagChildName');
		tag.AddTag(tagChild);

		var tag2 = tag.Clone();

		propEqual(tag2.bookmarks, tag.bookmarks);
	});

	test('Visit is called on self', function () {
		var exampleVisitor = new ExampleVisitor();
		var tag = new Tag('TagName');

		tag.Accept(exampleVisitor);

		strictEqual(tag, exampleVisitor.lastVisited);
	});

	test('Visit is called on child tags', function () {
		var exampleVisitor = new ExampleVisitor();
		var tag = new Tag('TagName');

		var tagChild = new Tag('TagChildName');
		tag.AddTag(tagChild);

		tag.Accept(exampleVisitor);

		strictEqual(tagChild, exampleVisitor.lastVisited);
	});
});

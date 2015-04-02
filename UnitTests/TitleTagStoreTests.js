require(['TagStores/TitleTagStore', 'Bookmark'], function (tagStore, bookmarkConstructor) {
	QUnit.module('TitleTagStore');

	QUnit.test('Single word in title becomes tag', function (assert) {
		testSingleTag('coding', 'coding', assert);
	});

	QUnit.test('Stop word does not become tag', function (assert) {
		testMultipleTags('is', [], assert);
	});

	QUnit.test('Title with multiple words turned into multiple tags', function (assert) {
		testMultipleTags('definition functions with dependencies', ['definition', 'functions', 'dependencies'], assert);
	});

	QUnit.test('Title tags do not include period', function (assert) {
		testSingleTag('Tutorials.', 'tutorials', assert);
	});

	QUnit.test('Title tags become lowercase', function (assert) {
		testSingleTag('Coding', 'coding', assert);
	});

	QUnit.test('Punctuation is removed', function (assert) {
		testSingleTag('coding?', 'coding', assert);
	});

	QUnit.test('Question marks are removed from tags', function (assert) {
		testSingleTag('Design?', 'design', assert);
	});

	QUnit.test('Notification counts at start of title are ignored', function (assert) {
		testSingleTag('(100) Tutorials', 'tutorials', assert);
	});

	QUnit.test('Programming languages are recognised', function (assert) {
		testMultipleTags('C# F# C++', ['c#', 'f#', 'c++'], assert);
	});

	function testSingleTag(title, expectedTitle, assert)
	{
		testMultipleTags(title, [expectedTitle], assert);
	}

	function testMultipleTags(title, expectedTitles, assert)
	{
		var bookmark = new bookmarkConstructor('1', title, 'url');

		var tags = tagStore.RequestTags(bookmark);
		assert.deepEqual(tags, expectedTitles);
	}
});

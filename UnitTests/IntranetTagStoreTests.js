require(['TagStores/IntranetTagStore', 'Bookmark'], function (tagStore, bookmarkConstructor) {
	QUnit.module('IntranetTagStore');

	QUnit.test('Localhost maps to own tag', function (assert) {
		testSingleTag('http://localhost/', 'localhost', assert);
	});

	QUnit.test('Local hostname maps to own tag', function (assert) {
		testSingleTag('http://teamcity/', 'teamcity', assert);
	});

	QUnit.test('Fully qualified hostname maps does not map to tag', function (assert) {
		testMultipleTags('http://google.co.uk/', [], assert);
	});

	function testSingleTag(url, expected, assert)
	{
		testMultipleTags(url, [expected], assert);
	}

	function testMultipleTags(url, expected, assert)
	{
		var bookmark = new bookmarkConstructor('1', 'title', url);

		var tags = tagStore.RequestTags(bookmark);
		assert.deepEqual(tags, expected);
	}
});

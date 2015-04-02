require(['TagStores/UrlTagStore', 'Bookmark'], function (tagStore, bookmarkConstructor) {
	QUnit.module('UrlTagStore');

	QUnit.test('Tag is URL hostname', function (assert) {
		testSingleTag('http://google.com/', 'google.com', assert);
	});

	QUnit.test('Tag is normalised to lowercase', function (assert) {
		testSingleTag('http://GOOGLE.COM/', 'google.com', assert);
	});

	QUnit.test('Tag has full hostname and subdomain', function (assert) {
		testMultipleTags('http://drive.google.com/', ['drive.google.com', 'google.com'], assert);
	});

	QUnit.test('Non qualified domain name does not map to tag', function (assert) {
		testMultipleTags('http://teamcity/', [], assert);
	});

	QUnit.test('Port is ignored', function (assert) {
		testSingleTag('http://google.com:25/', 'google.com', assert);
	});

	QUnit.test('Small hostname parts like co.uk are ignored', function (assert) {
		testSingleTag('http://google.co.uk/', 'google.co.uk', assert);
	});

	QUnit.test('WWW is removed from the hostname', function (assert) {
		testSingleTag('http://www.google.co.uk/', 'google.co.uk', assert);
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

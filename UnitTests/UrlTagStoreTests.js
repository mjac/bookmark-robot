require(['TagStores/UrlTagStore'], function () {
    var tagStore = new UrlTagStore();
    
	QUnit.test('Tag is URL hostname', function (assert) {
        testSingleTag('http://google.com/', 'google.com', assert);
	});
    
	QUnit.test('Tag is normalised to lowercase', function (assert) {
        testSingleTag('http://GOOGLE.COM/', 'google.com', assert);
	});
    
	QUnit.test('Tag has full hostname and subdomain', function (assert) {
        testMultipleTags('http://drive.google.com/', ['drive.google.com', 'google.com'], assert);
	});
    
	QUnit.test('Localhost maps to own tag', function (assert) {
        testSingleTag('http://localhost/', 'localhost', assert);
	});
    
	QUnit.test('Local hostname maps to intranet', function (assert) {
        testSingleTag('http://teamcity/', 'intranet', assert);
	});
    
    function testSingleTag(url, expected, assert)
    {
        testMultipleTags(url, [expected], assert);
    }
    
    function testMultipleTags(url, expected, assert)
    {
        var done = assert.async();
        
        tagStore.RequestTags(url, function (bookmarkUrl, tags) {
            assert.deepEqual(tags, expected);
            done();
        });
    }
});

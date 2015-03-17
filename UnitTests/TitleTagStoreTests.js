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
    
	QUnit.test('Title tags become lowercase', function (assert) {
        testSingleTag('Coding', 'coding', assert);
	});
    
	QUnit.test('Punctuation is removed', function (assert) {
        testSingleTag('coding?', 'coding', assert);
	});
    
    function testSingleTag(title, expectedTitle, assert)
    {
        testMultipleTags(title, [expectedTitle], assert);
    }
    
    function testMultipleTags(title, expectedTitles, assert)
    {
        var done = assert.async();
        
        var bookmark = new bookmarkConstructor(title, 'url');
        
        tagStore.RequestTags(bookmark, function (bookmark, tags) {
            assert.deepEqual(tags, expectedTitles);
            done();
        });
    }
});

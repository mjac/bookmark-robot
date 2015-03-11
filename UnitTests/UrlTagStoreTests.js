require(['TagStores/UrlTagStore'], function () {
    var tagStore = new UrlTagStore();
    
	QUnit.test('Correct bookmark is retrieved from URL', function (assert) {
        var done = assert.async();
        
        tagStore.RequestTags('http://google.com/', function (bookmarkUrl, tags) {
            assert.deepEqual(tags, ['google.com'], "Correct tag should be found");
            done();
        });
	});
});

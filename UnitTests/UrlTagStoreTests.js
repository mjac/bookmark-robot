require(['TagStores/UrlTagStore'], function () {
    var tagStore = new UrlTagStore();
    
	QUnit.test('Tag is URL hostname', function (assert) {
        var done = assert.async();
        
        tagStore.RequestTags('http://google.com/', function (bookmarkUrl, tags) {
            assert.deepEqual(tags, ['google.com']);
            done();
        });
	});
});

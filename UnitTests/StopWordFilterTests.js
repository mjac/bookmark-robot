require(['StopWordFilter'], function () {
    var filter = new StopWordFilter();
    
	QUnit.test('Single stop word is removed', function (assert) {
        testMultipleWords('a', [], assert);
    });
    
	QUnit.test('Many stop words are removed', function (assert) {
        testMultipleWords('a a', [], assert);
    });
    
	QUnit.test('Other words are maintained at start', function (assert) {
        testSingleWord('coding is', 'coding', assert);
    });
    
	QUnit.test('Other words are maintained at end', function (assert) {
        testSingleWord('to coding', 'coding', assert);
    });
    
    function testSingleWord(inputText, expectedWord, assert)
    {
        testMultipleWords(inputText, [expectedWord], assert);
    }
    
    function testMultipleWords(inputText, expectedWords, assert)
    {
        var words = filter.RemoveStopWords(inputText);
        console.log(inputText, words, expectedWords);
        assert.deepEqual(words, expectedWords);
    }
});

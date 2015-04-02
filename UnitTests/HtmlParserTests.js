require(['HtmlParser'], function (HtmlParser) {
	QUnit.module('HtmlParser');

	QUnit.test('Missing title returns null', function () {
		var pageHtml = GetExamplePageHtml('');
		var title = HtmlParser.GetTitle(pageHtml);
		strictEqual(title, null);
	});

	QUnit.test('Empty returns null', function () {
		var pageHtml = GetExamplePageHtmlWithTitle('');
		var title = HtmlParser.GetTitle(pageHtml);
		strictEqual(title, null);
	});

	QUnit.test('Page title is returned', function () {
		var pageTitle = 'page title';
		var pageHtml = GetExamplePageHtmlWithTitle(pageTitle);

		var title = HtmlParser.GetTitle(pageHtml);

		strictEqual(title, pageTitle);
	});

	QUnit.test('Page title is trimmed', function () {
		var pageTitle = 'page title';
		var pageTitleWithPadding = '\n ' + pageTitle + '\n';
		var pageHtml = GetExamplePageHtmlWithTitle(pageTitleWithPadding);

		var title = HtmlParser.GetTitle(pageHtml);

		strictEqual(title, pageTitle);
	});

	QUnit.test('Page title is unescaped', function () {
		var pageTitle = 'hypergeometric &raquo; SSH Do&#8217;s and Don&#8217;ts';
		var pageHtml = GetExamplePageHtmlWithTitle(pageTitle);

		var title = HtmlParser.GetTitle(pageHtml);

		strictEqual(title, 'hypergeometric » SSH Do’s and Don’ts');
	});

	function GetExamplePageHtml(headHtml)
	{
		return '<html><head>' + headHtml + '</head></html>';
	}

	function GetExamplePageHtmlWithTitle(title)
	{
		return GetExamplePageHtml('<title>' + title + '</title>');
	}
});

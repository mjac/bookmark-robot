var HtmlParser = {
	GetTitle: function (pageHtml) {
		var titleResult = /<title>\s*([^<]*?)\s*<\/title>/.exec(pageHtml);
		if (!titleResult) {
			return null;
		}
		
		var titleHtml = titleResult[1];
		
		var fakeTitleElement = document.createElement('div');
		fakeTitleElement.innerHTML = titleHtml;
		
		var title = fakeTitleElement.innerText;
		if (!title) {
			return null;
		}
		
		return title;
	}
};
function DeliciousTagStore(deliciousConfig)
{
	this._endpointUrl = 'https://' + delicious.username + ':' + delicious.password + '@api.del.icio.us/v1/posts/suggest';
}

DeliciousTagStore.prototype = {
	GetTagsForUrl: function (bookmarkUrl, callback)
	{
		$.ajax({
			url: this._endpointUrl,

			data: {
				url: bookmarkUrl
			},

			dataType: 'xml',

			success: function (data, textStatus, jqXHR) {
				var tagNodes = $(data).find('*[tag]');

				var tags = tagNodes.map(function(idx, tagContainer) {
					return $(tagContainer).attr('tag');
				}).get();

				callback(bookmarkUrl, tags);
			}
		});
	}
};



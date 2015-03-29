define(function () {
	function RemoteBookmarkContentRepository()
	{
	}

	RemoteBookmarkContentRepository.prototype = {
		GetHTML: function (bookmarkUrl, callbackSuccess, callbackFailure) {
			this.found = null;
			this.loading = true;

			$.ajax({
				url: bookmarkUrl, 

				dataType: 'html',

				timeout: 5000,

				success: function (data, textStatus, jqXHR) {
					callbackSuccess(data);
				},

				error: function (jqXHR, textStatus, errorThrown) {
					if (callbackFailure) {
						callbackFailure(jqXHR.status);
					}
				}
			});
		}
	};

	return new RemoteBookmarkContentRepository();
});

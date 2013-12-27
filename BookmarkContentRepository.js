function RemoteBookmarkContentRepository()
{
}

RemoteBookmarkContentRepository.prototype = {
	GetHTML: function (bookmarkUrl, callbackSuccess, callbackFailure) {
		this.found = null;
		this.loading = true;

		updateTable(this);

		$.ajax({
			url: this.url, 

			dataType: 'html',

			timeout: 5000,

			success: function (data, textStatus, jqXHR) {
				callbackSuccess(data);
			},

			error: function (jqXHR, textStatus, errorThrown) {
				callbackFailure();
			}
		});
	}
};

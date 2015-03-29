define(function () {
	function BookmarkUpdate(id)
	{
		this.id = id;
		this.success = false;
		this.title = null;
		this.statusCode = null;
	}

	function BookmarkUpdateFactory()
	{
	}

	BookmarkUpdateFactory.prototype.CreateUpdate = function (id, title) {
		var update = new BookmarkUpdate(id);
		update.success = true;
		update.title = title;

		return update;
	};

	BookmarkUpdateFactory.prototype.CreateUpdateFromFailure = function (id, statusCode) {
		var update = new BookmarkUpdate(id);
		update.success = false;
		update.statusCode = statusCode;

		return update;
	};

	return new BookmarkUpdateFactory();
});

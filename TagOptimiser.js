function TagOptimiser()
{
}

TagOptimiser.SortByCount = function (tags) {
	var tags = $.map(tags, function (val) {
		return val;
	});
		
	tags.sort(function (a, b) {
		if (len(a.tags) < len(b.tags)) {
			return 1;
		}

		if (len(a.tags) > len(b.tags)) {
			return -1;
		}

		if (len(a.bookmarks) < len(b.bookmarks)) {
			return 1;
		}

		if (len(a.bookmarks) > len(b.bookmarks)) {
			return -1;
		}

		return 0;
	});

	return tags;
};

TagOptimiser.prototype = {
	Visit: function (tag) {
		var desc = TagOptimiser.SortByCount(tag.tags);

		while (desc.length > 0) {
			var tag = desc.pop();

			for (var tagIdx in desc) {
				var commonTag = desc[tagIdx];

				if (commonTag.contains(tag)) {
					commonTag.addTag(tag.clone());
					break;
				}
			}
		}
	},

	Unvisit: function () {
	}
};



function TagPruner()
{
}

TagPruner.prototype = {
	Visit: function(tag)
	{
		var oldTags = tag.tags;

		tag.tags = {};

		$.each(oldTags, function (idx, subTag) {
			subTag.prune();

			var subTagLen = len(subTag.tags);
			var subBookmarkLen = len(subTag.bookmarks);

			var tooSmall = subTagLen <= 1 && subBookmarkLen <= 3;
			var sameName = tag.name.indexOf(subTag.name) >= 0 || subTag.name.indexOf(tag.name) >= 0;
			var selfSmall = subBookmarkLen < 20 && len(tag.bookmarks) < 20;

			if (tooSmall || sameName || selfSmall) {
				tag.addBookmarks(subTag.bookmarks);
				tag.addTags(subTag.tags);
			} else {
				tag.addTag(subTag);
			}
		}.bind(tag));
	}
};


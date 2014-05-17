function RemoveDuplicates (fn) {
	// Use BookmarkHierarchyVisitor
	var duplicates = this._gatherDuplicates([]);

	function removeRoute(route) {
		var tag = route.hierarchy[route.hierarchy.length - 1];
		tag.removeBookmark(route.bookmark);
	}

	$.each(duplicates, function (url, routeList) {
		routeList.reduce(function (min, route) {
			var distance = fn(route);

			if (min === null) {
				return [distance, route];
			}

			if (distance < min[0]) {
				removeRoute(min[1]);
				return [distance, route];
			}

			removeRoute(route);

			return min;
		}, null);
	});
}

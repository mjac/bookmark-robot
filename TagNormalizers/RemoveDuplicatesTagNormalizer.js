function RemoveDuplicatesTagNormalizer()
{
	this.NormalizeTags = function (tags) {
		tags.sort();

		return tags.reduce(function (arr, val) {
			if (arr[arr.length - 1] !== val) {
				arr.push(val);
			}

			return arr;
		}, []);
	};
}

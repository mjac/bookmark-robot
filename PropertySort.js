define(function () {
	return function (propertyName, desc) {
		var lessThan = desc ? 1 : -1;
		
		return function (a, b) {
			if (a[propertyName] < b[propertyName]) {
				return lessThan;
			}
			if (a[propertyName] > b[propertyName]) {
				return -lessThan;
			}
			return 0;
		}
	}
});
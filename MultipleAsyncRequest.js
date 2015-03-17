function MultipleAsyncRequest()
{
	this.finalCallback = null;
	this.requests = [];
}

MultipleAsyncRequest.prototype = {
	AddRequest: function (request) {
		this.requests.push(request);
	},

	SetFinalCallback: function (finalCallback) {
		this.finalCallback = finalCallback;
	},

	Execute: function () {
		var finalCallback = this.finalCallback;
		var requestsRemaining = this.requests.length;
		
		this.requests.forEach(function (request) {
			request(function () {
				requestsRemaining--;
				
				if (requestsRemaining < 1 && finalCallback) {
					finalCallback();
				}
			});
		});
	}
};
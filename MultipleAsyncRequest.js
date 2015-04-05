define(function () {
	function MultipleAsyncRequest()
	{
		this.finalCallback = null;
		this.requests = [];

		this.pendingRequests = 0;
		this.totalRequests = 0;

		this.maxPendingRequests = null;
	}

	MultipleAsyncRequest.prototype = {
		AddRequest: function (request) {
			this.requests.push(request);
		},
		GetStatus: function () {
			return {
				Completed: this.nextRequestIndex - this.pendingRequests,
				Total: this.totalRequests
			};
		},
		SetFinalCallback: function (finalCallback) {
			this.finalCallback = finalCallback;
		},
		SetMaxPendingRequests: function (maxPendingRequests) {
			this.maxPendingRequests = maxPendingRequests;
		},
		Execute: function () {
			this.nextRequestIndex = 0;
			this.totalRequests = this.requests.length;

			this.pendingRequests = 0;

			this._ProcessRequests();
		},
		_ProcessRequests: function () {
			var finalCallback = this.finalCallback;

			while (this.nextRequestIndex < this.totalRequests) {
				if (this.maxPendingRequests !== null && this.pendingRequests >= this.maxPendingRequests) {
					return;
				}

				var request = this.requests[this.nextRequestIndex];

				this.pendingRequests++;
				this.nextRequestIndex++;

				request(function () {
					this.pendingRequests--;
					this._ProcessRequests();
				}.bind(this));
			}

			if (this.pendingRequests < 1 && finalCallback) {
				finalCallback();
			}
		}
	};

	return MultipleAsyncRequest;
});

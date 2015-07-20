'use strict'

function UserAuth() {
	return {
		init = function(app, config) {
			console.log(config);
		}
	}
}

module.exports = new UserAuth();
'use strict';
 
function TokenService() {

	var jwt = require('jsonwebtoken'),
		_ = require('lodash-node');

	var dafaultOptions = {
		expiresInMinutes: 1440
	};

	return {

		generate: function(user, secret, options) {

			_.extend(options, dafaultOptions);

			return {
				id: jwt.sign(user, secret, options),
				expiration: new Date().getTime() + options.expiresInMinutes * 60000
			};
		}
	};
}

module.exports = new TokenService();
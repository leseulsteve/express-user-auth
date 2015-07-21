'use strict';

var tokenService = function(userSchema) {

	var jwt = require('jsonwebtoken'),
		_ = require('lodash');

	var dafaultOptions = {
		expiresInMinutes: 1440
	};

	return {

		generate: function(user, secret, options) {

			_.extend(options, dafaultOptions)

			return {
				id: jwt.sign(user, secret, options);,
				expiration: new Date().getTime() + options.expiresInMinutes * 60000
			};
		}
	};
}

module.exports = tokenService;
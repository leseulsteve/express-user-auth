'use strict';

function TokenService() {

	var jwt = require('jsonwebtoken'),
		_ = require('lodash-node');

	var config;

	return {

		init: function(userConfig) {
			config = userConfig;
		},

		generate: function(user) {

			return {
				id: jwt.sign(user, config.secret, config.options),
				expiration: new Date().getTime() + config.options.expiresInMinutes * 60000
			};
		}
	};
}

module.exports = new TokenService();
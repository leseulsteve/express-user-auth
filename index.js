'use strict';

var expressJwt = require('express-jwt');

function UserAuth() {

	return {

		init: function(app, config) {

			app.use(config.apiUrl,
				expressJwt({
					secret: config.secret
				}).unless({
					path: app.config.unprotected
				}));
		},

		getSecureUserSchema: function() {
			return require('./node_modules/express-user-auth/');
		}
	}
}

module.exports = new UserAuth();
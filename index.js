'use strict';

var expressJwt = require('jsonwebtoken');

function UserAuth() {

	return {

		init: function(app, config) {

			/*app.use(config.apiUrl,
				expressJwt({
					secret: config.secret
				}).unless({
					path: app.config.unprotected
				}));*/
		},

		getSecureUserSchema: function() {
			return require('./models/secure-user');
		}
	}
}

module.exports = new UserAuth();
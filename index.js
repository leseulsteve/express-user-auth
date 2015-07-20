'use strict';

var expressJwt = require('express-jwt');

function UserAuth() {

	return {

		init: function(app, userSchema, config) {

			app.set('jwtConfig', config);

			app.use(config.protected,
				expressJwt({
					secret: config.secret
				}).unless({
					path: config.unprotected
				})
			);
		},

		getSecureUserSchema: function() {
			return require('./models/secure-user');
		}
	}
}

module.exports = new UserAuth();
'use strict';

function UserAuth() {

	var expressJwt = require('express-jwt'),
		TokenService = require('./lib/services/token-service');

	return {

		init: function(app, UserSchema, MailTransporter, config) {

			app.use(config.protectedRoute,
				expressJwt({
					secret: config.token.secret
				}).unless({
					path: config.unprotectedRoute
				})
			);

			app.use(function(err, req, res, next) {
				if (!err) return next();
				if (err.name === 'UnauthorizedError') {
					res.status(401).send({
						message: 'invalid token...'
					});
				}
			});

			TokenService.init(config.token);

			var UserAuthController = require('./lib/controllers/user-auth')(UserSchema, MailTransporter, config);

			app.route(config.resetPassword.url)
        .post(UserAuthController.resetPassword);

      app.route(config.signin.url)
      	.post(UserAuthController.signin);
		},

		getSecureUserSchema: function() {
			return require('./lib/models/secure-user');
		}
	}
}

module.exports = new UserAuth();
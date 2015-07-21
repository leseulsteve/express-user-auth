'use strict';

function UserAuth() {

	var expressJwt = require('express-jwt'),
		TokenService = require('./lib/services/token-service');

	return {

		init: function(app, UserSchema, MailTransporter, config) {

			app.use(config.apiRoot,
				expressJwt({
					secret: config.token.secret
				}).unless({
					path: (config.unprotectedRoutes || []).concat([config.apiRoot + '/auth/signin', config.apiRoot + '/auth/send_password_token'])
				})
			);

			app.use(config.apiRoot, function(err, req, res, next) {
				if (!err) return next();
				if (err.name === 'UnauthorizedError') {
					res.status(401).send({
						message: 'invalid token...'
					});
				}
			});

			TokenService.init(config.token);

			var UserAuthController = require('./lib/controllers/user-auth')(UserSchema, MailTransporter, config);

			app.route(config.apiRoot + '/auth/signin')
      	.post(UserAuthController.signin);

			app.route(config.apiRoot + '/auth/send_password_token')
        .post(UserAuthController.sendPasswordToken);

      app.route(config.apiRoot + '/auth/change_passport')
        .post(UserAuthController.changePassword);
		},

		getSecureUserSchema: function() {
			return require('./lib/models/secure-user');
		}
	}
}

module.exports = new UserAuth();
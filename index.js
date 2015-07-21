'use strict';

function UserAuth() {

	var expressJwt = require('express-jwt'),
		tokenService = require('./lib/services/token-service'),
		SignIn = require('./lib/middlewares/signin'),
		ResetPassword = require('./lib/middlewares/reset-password');


	return {

		init: function(app, UserSchema, config) {

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

			ResetPassword.init(UserSchema, config);
			SignIn.init(app, UserSchema, config);

			app.route(config.resetPassword.url)
        .post(ResetPassword.sendToken);
		},

		setMailTransporter: function(transporter) {
			ResetPassword.setMailTransporter(transporter);
		},

		getSecureUserSchema: function() {
			return require('./lib/models/secure-user');
		}
	}
}

module.exports = new UserAuth();
'use strict';

function UserAuth() {

	var expressJwt = require('express-jwt'),
		tokenService = require('./services/token-service'),
		SignIn = require('./lib/middlewares/signin'),
		ResetPassword = require('./lib/middlewares/reset-password');


	return {

		init: function(app, userSchema, config) {

			app.use(config.protected,
				expressJwt({
					secret: config.secret
				}).unless({
					path: config.unprotected
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

			ResetPassword.init(app, config);
			SignIn.init(app, config);
		},

		setMailTransporter: function(transporter) {
			ResetPassword.setMailTransporter(transporter);
		}

		getSecureUserSchema: function() {
			return require('./lib/models/secure-user');
		}
	}
}

module.exports = new UserAuth();
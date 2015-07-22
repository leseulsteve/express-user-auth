'use strict';

function UserAuth() {

	var expressJwt = require('express-jwt'),
		TokenService = require('./lib/services/token-service'),
		_ = require('lodash-node'),
		UserAuthController;

	var unless = function(path, middleware, unprotectedRoutes) {
		return function(req, res, next) {
			if (_.contains(unprotectedRoutes, req.path)) {
				return next();
			} else {
				return middleware(req, res, next);
			}
		};
	};

	return {

		init: function(app, UserSchema, MailTransporter, config) {

			TokenService.init(config.token, UserSchema);

			var unprotectedRoutes = (config.unprotectedRoutes || []).concat([config.apiRoot + '/auth/signin', config.apiRoot + '/auth/send_password_token'], config.apiRoot + '/auth/signup'])

			app.use(unless('/' + config.apiRoot + '/*', TokenService.validate, unprotectedRoutes));
			app.use(unless('/' + config.apiRoot + '/*', TokenService.injectUser, unprotectedRoutes));

			UserAuthController = require('./lib/controllers/user-auth')(UserSchema, MailTransporter, config);

			app.route('/' + config.apiRoot + '/auth/signin')
				.post(UserAuthController.signin);

			app.route('/' + config.apiRoot + '/auth/send_password_token')
				.post(UserAuthController.sendPasswordToken);

			app.route('/' + config.apiRoot + '/auth/change_passport')
				.post(UserAuthController.changePassword);

			app.route('/' + config.apiRoot + '/auth/signup')
				.post(UserAuthController.signup);

			app.route('/' + config.apiRoot + '/auth/confirm_email')
				.post(UserAuthController.confirmEmail);
		},

		getSecureUserSchema: function() {
			return require('./lib/models/secure-user');
		}
	}
}

module.exports = new UserAuth();
'use strict';

function UserAuth() {

	var expressJwt = require('express-jwt'),
		TokenService = require('./lib/services/token-service'),
		_ = require('lodash-node');

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

			TokenService.init(config.token);

			var unprotectedRoutes = (config.unprotectedRoutes || []).concat([config.apiRoot + '/auth/signin', config.apiRoot + '/auth/send_password_token'])

			app.use(unless('/' + config.apiRoot + '/*', TokenService.validate, unprotectedRoutes));
			app.use(unless('/' + config.apiRoot + '/*', TokenService.injectUser, unprotectedRoutes));

			var UserAuthController = require('./lib/controllers/user-auth')(UserSchema, MailTransporter, config);

			app.route('/' + config.apiRoot + '/auth/signin')
				.post(UserAuthController.signin);

			app.route('/' + config.apiRoot + '/auth/send_password_token')
				.post(UserAuthController.sendPasswordToken);


			app.route('/' + config.apiRoot + '/auth/change_passport')
				.post(UserAuthController.changePassword);
		},

		getSecureUserSchema: function() {
			return require('./lib/models/secure-user');
		}
	}
}

module.exports = new UserAuth();
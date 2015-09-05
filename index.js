'use strict';

function UserAuth() {

	var TokenService = require('./lib/services/token-service'),
		_ = require('lodash-node');

	var unless = function(path, middleware, unprotectedRoutes) {
		return function(req, res, next) {
			var wildCardRoutes = _.filter(unprotectedRoutes, function(unprotectedRoute) {
				return _.endsWith(unprotectedRoute, '*');
			});
			for (var i = 0; i < wildCardRoutes.length; i++) {
				var unprotectedRoute = wildCardRoutes[i]
				if (unprotectedRoute.slice(0, -2) === req.path.substr(1).substring(0, req.path.substr(1).lastIndexOf('/'))) {
					i = wildCardRoutes.length;
					return next();
				}
			};
			if (_.contains(unprotectedRoutes, req.path.substr(1))) {
				return next();
			} else {
				return middleware(req, res, next);
			}
		};
	};

	return {

		init: function(app, UserSchema, config, MailTransporter) {

			TokenService.init(config.token, UserSchema);

			var unprotectedRoutes = (config.unprotectedRoutes || []).concat([config.apiRoot + '/auth/signin', config.apiRoot + '/auth/send_password_token'])

			if (config.signup && !config.signup.userCreationRoles) {
				unprotectedRoutes.push(config.apiRoot + '/auth/signup');
			}

			app.use(unless('/' + config.apiRoot + '/*', TokenService.validate, unprotectedRoutes));
			app.use(unless('/' + config.apiRoot + '/*', TokenService.injectUser, unprotectedRoutes));

			var UserAuthController = require('./lib/controllers/user-auth')(UserSchema, config, MailTransporter),
				UserController = require('./lib/controllers/users')(UserSchema, config);

			if (config.signup.sendConfirmationEmail) {
				app.route('/' + config.apiRoot + '/auth/confirm_email')
					.post(UserAuthController.confirmEmail);
			}

			if (MailTransporter) {
				app.route('/' + config.apiRoot + '/auth/send_password_token')
					.post(UserAuthController.sendPasswordToken);

				app.route('/' + config.apiRoot + '/auth/change_passport')
					.post(UserAuthController.changePassword);
			}

			app.route('/' + config.apiRoot + '/auth/signin')
				.post(UserAuthController.signin);

			app.route('/' + config.apiRoot + '/auth/signout')
				.post(UserAuthController.signout);

			app.route('/' + config.apiRoot + '/auth/signup')
				.post(UserAuthController.signup);

			app.route('/' + config.apiRoot + '/user')
				.post(UserController.create)
				.get(UserController.find);

			app.route('/' + config.apiRoot + '/user/:userId')
				//.all(ressourceAuthorization)
				.get(UserController.findOne)
				.put(UserController.update)
				.delete(UserController.destroy);

			app.param('userId', UserController.injectUser);

		},

		getSecureUserSchema: function() {
			return require('./lib/models/secure-user');
		}
	}
}

module.exports = new UserAuth();
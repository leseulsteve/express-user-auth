'use strict';

var ResetPasswordService = function(MailTransporter, config) {

	var TokenService = require('./token-service'),
		q = require('q'),
		mailOptions = {
			from: config.resetPassword.emailFromField,
			subject: config.resetPassword.emailSubjectField
		};

	return {

		reset: function(user) {

			var token = TokenService.generate(user),
				deffered = q.defer();

			mailOptions.to = user.email;
			mailOptions.text = 'Votre nouveau token: ' + token.id;

			MailTransporter.sendMail(mailOptions, function(error, info) {
				error ? deffered.reject(error) : deffered.resolve(info);
			});

			return deffered.promise;
		}
	};
};

module.exports = ResetPasswordService;
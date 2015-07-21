'use strict';

var ResetPasswordService = function(MailTransporter, config) {

	var TokenService = require('./token-service'),
		q = require('q');

	return {

		reset: function(user, urlRedirection) {

			var token = TokenService.generate(user),
				deffered = q.defer();

			var mailOptions = _.extend({
				to: user.email,
				text: urlRedirection + '/' + user._id + '?token=' + token.id
			}, config.resetPassword.mailOptions);

			MailTransporter.sendMail(mailOptions, function(error, info) {
				error ? deffered.reject(error) : deffered.resolve(info);
			});

			return deffered.promise;
		}
	};
};

module.exports = ResetPasswordService;
'use strict';

var SendSignupConfirm = function(MailTransporter, config) {

	var TokenService = require('./token-service'),
		q = require('q'),
		_ = require('lodash-node');

	return {

		send: function(user, urlRedirection) {

			var token = TokenService.generate(user),
				deffered = q.defer();

			var mailOptions = _.extend({
				to: user.email,
				text: urlRedirection + '/?token=' + token.id
			}, config.confirmEmail.mailOptions);

			MailTransporter.sendMail(mailOptions, function(error, info) {
				error ? deffered.reject(error) : deffered.resolve(info);
			});

			return deffered.promise;
		}
	};
};

module.exports = SendSignupConfirm;
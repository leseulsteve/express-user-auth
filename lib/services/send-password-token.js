'use strict';

var fs = require('fs'),
	Handlebars = require('handlebars');

var ResetPasswordService = function(MailTransporter, config) {

	var TokenService = require('./token-service'),
		q = require('q'),
		_ = require('lodash-node');

	return {

		reset: function(user, urlRedirection) {

			var token = TokenService.generate(user),
				deffered = q.defer();

			var mailOptions = _.extend({
				to: user.email,
				text: urlRedirection + '/?token=' + token.id
			}, config.resetPassword.mailOptions);

			fs.readFile(config.resetPassword.template, function(error, template) {
				
				if (error) {
					throw error;
				}

				mailOptions.html = Handlebars.compile(template.toString())({
					resetToken: urlRedirection + '/?token=' + token.id
				});

				MailTransporter.sendMail(mailOptions, function(error, info) {
					error ? deffered.reject(error) : deffered.resolve(info);
				});

			});

			return deffered.promise;
		}
	};
};

module.exports = ResetPasswordService;
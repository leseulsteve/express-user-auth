'use strict';

var fs = require('fs'),
	Handlebars = require('handlebars');

var SendSignupConfirm = function(MailTransporter, config) {

	var TokenService = require('./token-service'),
		q = require('q'),
		_ = require('lodash-node');

	return {

		send: function(user, urlRedirection) {

			var token = TokenService.generate(user),
				deffered = q.defer();

			var mailOptions = _.assign({
				to: user.email,
				text: urlRedirection + '/?token=' + token.id
			}, config.confirmEmail.mailOptions);

			fs.readFile(config.confirmEmail.template, function(error, template) {
				
				if (error) {
					throw error;
				}

				mailOptions.html = Handlebars.compile(template.toString())({
					confirmationToken: urlRedirection + '/?token=' + token.id
				});

				MailTransporter.sendMail(mailOptions, function(error, info) {
					error ? deffered.reject(error) : deffered.resolve(info);
				});

			});

			return deffered.promise;
		}
	};
};

module.exports = SendSignupConfirm;
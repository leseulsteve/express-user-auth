'use strict';

function TokenService() {

	var jwt = require('jsonwebtoken'),
		_ = require('lodash-node'),
		UserSchema;

	var config;

	return {

		init: function(userConfig, User) {
			UserSchema = User;
			config = userConfig;
		},

		generate: function(user) {

			return {
				id: jwt.sign(user, config.secret, config.options),
				expiration: new Date().getTime() + config.options.expiresInMinutes * 60000
			};
		},

		validate: function(req, res, next) {

			var header = req.header('Authorization');

			if (!header) {
				return res.status(401).send({
					message: 'No token foud'
				});
			}

			var token = header.replace('Bearer ', '');

			jwt.verify(token, config.secret, function(err, decoded) {
				if (err) {

					if (err.name === 'TokenExpiredError') {
						res.status(401).send({
							message: 'jwt expired',
							expiredAt: err.expiredAt
						});
					} else {
						res.status(401).send({
							message: err.message
						});
					}
				}

				req.token = token;

				next();
			});
		},

		injectUser: function(req, res, next) {

			var decoded = jwt.decode(req.token, {
				complete: true
			});

			var userId = decoded.payload._id;

			UserSchema.findOne({
				_id: userId
			}, function(error, user) {

				if (error) throw error;

				if (!user) {
					return res.status(400).send({
						message: 'Bad token'
					});
				}

				req.user = user;

				next();
			});
		}
	};
}

module.exports = new TokenService();
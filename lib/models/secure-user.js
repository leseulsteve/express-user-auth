'use strict';

var Schema = require('mongoose').Schema,
	crypto = require('crypto'),
	_ = require('lodash-node');

var config = {
	minlength: 7,
	hashIterations: 10000,
	keylen: 64
}

/**
 * A Validation function for local strategy password
 */
var validateLocalStrategyPassword = function(password) {
	return password && password.length >= config.minlength;
};

var SecureUserSchema = new Schema({
	username: {
		type: String,
		trim: true,
		unique: 'Le username doit Ãªtre unique',
		required: 'Le username est obligatoire',
	},
	email: {
		type: String,
		trim: true,
		unique: 'Le email doit Ãªtre unique',
		sparse: true //http://stackoverflow.com/questions/7955040/mongodb-mongoose-unique-if-not-null
	},
	roles: [{
		type: String
	}],
	emailNotConfirmed: {
		type: Boolean
	},
	password: {
		type: String,
		validate: [validateLocalStrategyPassword, 'Le mot de passe doit Ãªtre d\'au moins ' + config.minlength + ' caractÃ¨res']
	},
	salt: {
		type: String
	}
}, {
	collection: 'users',
	discriminatorKey: '_type'
});

SecureUserSchema.pre('save', function(next) {
	if (this.password && this.isModified('password') && this.password.length >= config.minlength) {
		this.salt = new Buffer(crypto.randomBytes(config.keylen).toString('base64'), 'base64');
		this.password = this.hashPassword(this.password);
	}
	next();
});

SecureUserSchema.methods.hashPassword = function(password) {
	if (this.salt && password) {
		return crypto.pbkdf2Sync(password, this.salt, config.hashIterations, config.keylen).toString('base64');
	} else {
		return password;
	}
};

SecureUserSchema.methods.authenticate = function(password) {
	return this.password === this.hashPassword(password);
};

module.exports = SecureUserSchema;
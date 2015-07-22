'use strict';

var Schema = require('mongoose').Schema;

module.exports = new Schema({
	username: {
		type: String
	},
	password: String,
	email: {
		type: String
	},
	roles: [{
		type: String
	}],
	emailConfirmed: {
		type: Boolean,
		default: false
	}
}, { collection : 'users', discriminatorKey : '_type' });
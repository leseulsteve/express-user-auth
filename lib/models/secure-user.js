'use strict';

var Schema = require('mongoose').Schema;

module.exports = new Schema({
	username: {
		type: String
	},
	password: String,
	email: {
		type: String
	}
}, { collection : 'users', discriminatorKey : '_type' });
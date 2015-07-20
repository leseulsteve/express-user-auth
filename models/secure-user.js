'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var SecureUserScheman = new Schema({
	username: String,
	password: String
}, { collection : 'users', discriminatorKey : '_type' });

module.exports = mongoose.model('SecureUser', SecureUserScheman);
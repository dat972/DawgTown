/****************************************************************/
/* Project: 	Dawgtown API									*/
/* Author: 		Abhishek Pratapa								*/
/* Version 		0.1 [BETA]										*/
/* 																*/
/* File: 		user.js 										*/
/*																*/
/****************************************************************/

// import mongoose for the data model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// The user data model
module.exports = mongoose.model('Users', new Schema({  
	username: String,
	password: String,
	address: String,
	city: String,
	state: String,
	country: String,
	phone_number: String
	zipcode: Number

}));
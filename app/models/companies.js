/****************************************************************/
/* Project: 	Dawgtown API									*/
/* Author: 		Abhishek Pratapa								*/
/* Version 		0.1 [BETA]										*/
/* 																*/
/* File: 		companies.js 									*/
/*																*/
/****************************************************************/

// import mongoose for the data model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// The companies data model
module.exports = mongoose.model('Companies', new Schema({  
	company_name: String,
	password: String,
	level: Number
}));
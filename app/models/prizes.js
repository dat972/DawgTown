/****************************************************************/
/* Project: 	Dawgtown API									*/
/* Author: 		Abhishek Pratapa								*/
/* Version 		0.1 [BETA]										*/
/* 																*/
/* File: 		prizes.js	 									*/
/*																*/
/****************************************************************/

// import mongoose for the data model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// The bones data model
module.exports = mongoose.model('prizes', new Schema({  
	Company_ID: Number,
	price: Number,
	name: String, 
	image: ,
	url: String,
	description: String 
}));
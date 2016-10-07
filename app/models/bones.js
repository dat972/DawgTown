/****************************************************************/
/* Project: 	Dawgtown API									*/
/* Author: 		Abhishek Pratapa								*/
/* Version 		0.1 [BETA]										*/
/* 																*/
/* File: 		bones.js	 									*/
/*																*/
/****************************************************************/

// import mongoose for the data model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// The bones data model
module.exports = mongoose.model('bones', new Schema({  
	Longitue: ,
	Latitude: ,
	Amount: ,
	Redeemed: 
}));
/****************************************************************/
/* Project: 	Dawgtown API									*/
/* Author: 		Abhishek Pratapa								*/
/* Version 		0.1 [BETA]										*/
/* 																*/
/* File: 		server.js 										*/
/*																*/
/* Methods: [authenticate, ]									*/
/*																*/
/****************************************************************/

/*************** IMPORTS SECTION ****************/

// Express import
var express 	= require('express');
var app 		= express();

// Parser import
var bodyParser  = require('body-parser');

// Debug Morgan import
var morgan      = require('morgan');

// Database modeler import
var mongoose    = require('mongoose');

// Token import
var jwt    		= require('jsonwebtoken');

// Import path for the program
var path    	= require("path");

// configuration file
var config 		= require('./config');

// Database model files
var user_db = require('./app/models/user');
var companies_db = require('./app/models/companies');
var bones_db = require('./app/models/bones');

/************* END IMPORTS SECTION **************/

/**************** SETUP SECTION *****************/

// Setup database connection and ports for the cloud app
var port = process.env.PORT || 8080;
mongoose.connect(config.database);
var db = mongoose.connection;

// set up API routes
var apiRoutes = express.Router();

// Set some app configurations
app.set('superSecret', config.secret);
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set up debug tools
app.use(morgan('dev'));

/************** END SETUP SECTION ***************/

/**************** VIEWS SECTION *****************/

/******* Help Views ******/

// routes information (start-up page)
app.get('/help', function(req, res) {
	res.sendFile(path.join(__dirname+'/views/help.html'));
});

/***** End Help Views ****/

/******* Full Views ******/

// index file on start-up
app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname+'/index.html'));
});

// the sign up html page
app.get('/signup', function(req, res) {
	res.sendFile(path.join(__dirname+'/views/signup.html'));
});

// the sign up html page
app.get('/login', function(req, res) {
	res.sendFile(path.join(__dirname+'/views/login.html'));
});

// the home html page
app.get('/home', function(req, res) {
	res.sendFile(path.join(__dirname+'/views/home.html'));
});

// the sign up html page
app.get('/blank', function(req, res) {
	res.sendFile(path.join(__dirname+'/views/blank.html'));
});

// the sign up html page
app.get('/template', function(req, res) {
	res.sendFile(path.join(__dirname+'/views/template.html'));
});

// the sign up html page
app.get('/refresh', function(req, res) {
	res.sendFile(path.join(__dirname+'/views/refresh.html'));
});

// the sign up html page
app.get('/location', function(req, res) {
	res.sendFile(path.join(__dirname+'/views/location.html'));
});

// the sign up html page
app.get('/addcl', function(req, res) {
	res.sendFile(path.join(__dirname+'/views/addcl.html'));
});

// the sign up html page
app.get('/deletecl', function(req, res) {
	res.sendFile(path.join(__dirname+'/views/deletecl.html'));
});

/***** End Full Views ****/

/***** Partial Views *****/

// the sign up html page
app.get('/live_preview.html', function(req, res) {
	res.sendFile(path.join(__dirname+'/views/live_preview.html'));
});

// the sign up html page
app.get('/active_posts.html', function(req, res) {
	res.sendFile(path.join(__dirname+'/views/active_posts.html'));
});

// the sign up html page
app.get('/scheduled.html', function(req, res) {
	res.sendFile(path.join(__dirname+'/views/scheduled.html'));
});

/*** End Partial Views ***/

/************** END VIEWS SECTION ***************/

/********* INFORMATION AND APP SECTION **********/

/*** Unprotected Routes **/

// Create User
app.post('/create_user', function(req, res) {
	
	// get the parameters via a body form or JSON
	var password_typed = req.body.password || req.param('password');
	var name_typed = req.body.name || req.param('name');

	// do some checks for creating a new user
	if(password_typed == null){
		res.json({ message: "type in password", success:false });
	}else if(name_typed == null){
		res.json({ message: "type in name", success:false });
	}else{
		user_db.findOne({
			name: name_typed
		}, function(err, user) {
			// throw error as not to crash our server
			if (err) throw err;
			
			if(user){
				res.json({ message: "Username is already taken", success:false });
			}else{
				// new model for the user
				var new_user = new user_db({ 
					name: name_typed, 
					password: password_typed,
				});

				// save the new user
				new_user.save(function(err) {
					// throw an error
					if (err) throw err;

					// save the user successfully
					console.log('User saved successfully');
					res.json({ message: "User is Created", success: true });
				});
			}
		});
	}
});

/* End Unprotected Routes */

/********* END OF INFO AND APP SECTION **********/

/********* TOKEN AUTHENTICATION SECTION *********/

// The authenticate route
apiRoutes.post('/authenticate', function(req, res) {
	// check if we can find a user in the database

	var password = req.body.password || req.param('password');
	var body_user = req.body.username || req.param('username');

	if(password == null){
		res.json({ message: "type in password" });
	}else if(body_user == null){
		res.json({ message: "type in name" });
	}else{
		// find entry in the moongose database
		user_db.findOne({
			name: body_user
		}, function(err, user) {
			// throw error as not to crash our server
			if (err) throw err;
			
			//check if the user exists
			if(user){
				// check the password
				if (user.password != password) {
					res.json({ success: false, message: 'Authentication failed. Wrong password.' });
				} else {
					// create a new token
					var token = jwt.sign(user, app.get('superSecret'), {
						expiresIn: 84600
					});

					// encode the username
					var encoded_username = new Buffer(req.body.username).toString('base64');
					
					// create a checksum
					var cs = checksum(token+encoded_username);

					// new token value
					token = token + "fheruser" + encoded_username + "codexkdr" + cs;

					//return the token
					res.json({
						success: true,
						message: 'Enjoy your token!',
						token: token
					});
				}
			}else{
				res.json({ success: false, message: 'Authentication failed. Wrong password.' });
			}
		});
	}
});

// The middleware for the API routes
apiRoutes.use(function(req, res, next) {

	// check header or url parameters or post parameters for token
	var token = req.body.token || req.param('token') || req.headers['x-access-token'];

	// decode token
	if (token) {
		// split the token
		var token_split = token.split("fheruser");
		var username_split = token_split[1].split("codexkdr");

		// find the actual token 
		var actual_token = token_split[0];
		var actual_username = username_split[0];
		var actual_checksum = username_split[1];

		// verifies secret and checks exp
		jwt.verify(actual_token, app.get('superSecret'), function(err, decoded) {			
			
			// verify the username checksum
			if(checksum(actual_token+actual_username) == actual_checksum && !err){
				// if everything is good, save to request for use in other routes
				req.username_passed_in = new Buffer(actual_username, 'base64').toString('ascii');
				req.decoded = decoded;
				next();
			}else{
				return res.json({ success: false, message: 'Failed to authenticate token.' });
			}
		});

	} else {

		// there is no token
		return res.status(403).send({ 
			success: false, 
			message: 'No token provided.'
		});
	}
});

/******* TOKEN AUTHENTICATION SECTION END *******/

/********* BEGINNING OF THE API ROUTES **********/

// home route
apiRoutes.get('/', function(req, res) {
	res.json({ message: 'Welcome to the coolest API on earth!', user:req.username_passed_in });
});

// get_bones : get the bones located in the surrounding area
apiRoutes.get('/bones_location', function(req, res) {
	// location data
	var longitude_sent = req.body.longitude || req.param('longitude');
	var latitude_sent = req.body.latitude || req.param('latitude');

	// set range
	var range_size = 0.003;

	// check for the variables
	if(longitude_sent == null){
		res.json({ message: "Sent in a longitude_sent" });
	}else if(latitude_sent == null){
		res.json({ message: "Sent in a latitude_sent" });
	}else{
		// search for range
		bones_db.find({
			longitude: {'$gte': parseFloat(longitude_sent)-range_size+"",'$lte': parseFloat(longitude_sent)+range_size+""},
			latitude: {'$gte': parseFloat(latitude_sent)-range_size+"",'$lte': parseFloat(latitude_sent)+range_size+""}
		}, function(err, bones) {
			res.json({ message: 'Here are the list of bones avaliable', bones_sent:bones });
		});
	}
});

// grab_bone : user picks up a specific bone adding it to his/her collection
apiRoutes.post('/grab_bone', function(req, res){
	var longitude_sent = req.body.longitude || req.param('longitude');
	var latitude_sent = req.body.latitude || req.param('latitude');
	var user_id = req.username_passed_in;
	var bone_id = req.body.bone_id || req.param('bone_id');

	// check request to make sure inputs are valid
	if(longitude_sent == null){
		res.json({messge: "Sent in an invalid longitude"})
	}else if(latitude_sent == null){
		res.json({message: "Sent in an invalid latitude"})
	}else if(!bones.find({'_id':bone_id})){
		res.json({message: "No bone ID was found"})
	}else if(
		// check to see if the bone is already owned by the user
		User_bone.find({'User_id':user_id, 'Bone_id':bone_id}) ){
			// if user already has bone return error message
			res.json({message: "User has already picked up this bone"})
	}else{
		// new model for the User_bone DB
				var new_bone = new User_bone({ 
					User_id: user_id,
					Bode_id: bone_id
				});
				// save the new user
				new_bone.save(function(err) {
					// throw an error
					if (err) throw err;
					// save the user successfully
					console.log('Added bone to User_bone DB');
					res.json({ message: "Bone added to DB", success: true });
				});
	}
});

// get_product : find all the products being offered by the companies in the area
apiRoutes.get('/get_product', function(req, res){
	// location data
	var longitude_sent = req.body.longitude || req.param('longitude');
	var latitude_sent = req.body.latitude || req.param('latitude');

	// set range
	var range_size = 0.003;

	// check for the variables
	if(longitude_sent == null){
		res.json({ message: "Sent in a longitude_sent" });
	}else if(latitude_sent == null){
		res.json({ message: "Sent in a latitude_sent" });
	}else{
		// search for range
		prizes.find({
			longitude: {'$gte': parseFloat(longitude_sent)-range_size+"",'$lte': parseFloat(longitude_sent)+range_size+""},
			latitude: {'$gte': parseFloat(latitude_sent)-range_size+"",'$lte': parseFloat(latitude_sent)+range_size+""}
		}, function(err, bones) {
			res.json({ message: 'Here are the list of the prizes avaliable', prizes_sent:prizes });
		});
	}
});

// redeem the bones : use bones to purchase one of the selected products
apiRoutes.post('/redeem', function(req, res) {
	var bone_id = req.body.bone_id || req.param('bone_id');
	var prize_id = req.body.prize_id || req.param('prize_id');
	var user_id = req.username_passed_in;
	// var user_info ...

	// 1) check if prize ID is valid
	if(!prizes.find('_id':prize_id)){
		res.json({message: "No prize with that ID was found in the DB"});
	}

	// 2) get price of selected prize
	var selected_prize = prizes.find({'_id':prize_id});
	var price = selected_prize.price;

	// 3) Create a list user_bones[] that contains the Bone_id of all the unspent bones

	// first bring in all the bones the user has collected
	var user_bones = [];
	var user_bones_total = User_bone.find({'User_id':user_id}).toArray(function (err, documents){});
	for (var i=0; i < user_bones_total.length; i++){
		user_bones.push(user_bones_total[i].Bone_id)
	}
	// then create a list of all the bones that have been spent
	var spent_bones = [];
	var user_spent_bones = User_prizes.find().toArray(function(err, documents){});
	for (var j=0; j < user_spent_bones.length; j++){
		for(var k=0; k < user_spent_bones[j].Bones.length; k++){
			spent_bones.push(user_spent_bones[j].Bones[k]);
		}
	}
	// compare user_bones and spent_bones and remove the spent bones from the user bones list
	// after executing the loop user_bones = all the unspent Bone_id 's'
	var x = 0;
	while(x < spent_bones.length){
		for (var i=0; i < user_bones.length; i++){
			if(user_bones[i] === spent_bones[x]){
				user_bones.splice(i, 1);
			}
		}
		x++;
	}

	// Create a list of the bones that will be used in the purchase
	var total = 0;
	var spending_bones = [];
	for(var k=0; k<user_bones.length; k++){
		if(total < price){
			var temp = User_bone.find({'User_id':user_bones[k]});
			var bone_price = temp.price;
			total += bone_price;
			spending_bones.push(user_bones[k]);
		}else{
			break;
		}
	}
	// check total after going through all bones to see if it is enough to purcahse the item
	if (total < price){
		res.json({message: "User does not have enough bones to purcahase item"})
	}else{ // 5) If user does have enough to purcahse item add the item to the User_prize DB
		var new_prize = new User_prizes({ 
					User_id: user_id,
					Prize_id: prize_id,
					Bones: spending_bones
				});
				// save the new user
				new_prize.save(function(err) {
					// throw an error
					if (err) throw err;
					// save the user successfully
					console.log('Added prize to User_prizes DB');
					res.json({ message: "Prize added to DB", success: true });
				});
	}

});



// logout route
apiRoutes.post('/logout', function(req, res) {
	user_db.findOne({
		name: req.username_passed_in
	}, function(err, user) {
		// empty token
		var token = jwt.sign(user, app.get('superSecret'), {
			expiresIn: 0
		});

		// return a success message
		res.json({
			success: true,
			message: 'You have successfully logged out!'
		});
	});
})

/************ END OF THE API ROUTES *************/

/************* STARTING THE SERVER **************/

// start the server
app.use('/api', apiRoutes);
app.listen(port);
console.log('Magic happens at http://localhost:' + port);
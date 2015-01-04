var ejs = require("ejs");
var mysql = require('./mysql');
var common = require('./common');
/*
 * GET users listing.
 */

function updateCurrentDateInLoggedInUser (username) {
	var currentDate = common.FormatDate(new Date(), "%Y-%m-%d %H:%M:%S", false);
	var updateTime = "Update user SET lastlogin='" + currentDate
			+ "' where username='" + username + "'";

	mysql.fetchData(function(err, results) {
		if (err) {
			throw err;
		} else {
			console.log("last login time updated for the user.");
		}

	}, updateTime);
}

exports.login = function(req, res) {
	if (typeof (req.param("password")) === "undefined"
			|| typeof (req.param("email")) === "undefined") {
		console.log("Invalid Login");
		// some way to show invalid login
	}
	var getUser = "select * from user where username='" + req.param("email")
			+ "'" + " and password='" + req.param("password") + "'";

	// check using the database operations if it is correct
	mysql.fetchData(function(err, results) {
		if (err) {
			throw err;
		} else {
			if (results.length > 0) {
				console.log("valid Login");
				var loggedInUser = results[0];
				// on login success update the last login time as current time
				updateCurrentDateInLoggedInUser(req.param("email"));
				loggedInUser.lastlogin = common.FormatDate(loggedInUser.lastlogin, "%Y-%m-%d %H:%M:%S", false);
				// set the session object
				req.session.user = loggedInUser;
				ejs.renderFile('./views/Home.ejs', loggedInUser, function(err, result) {
					// render on success
					if (!err) {
						res.end(result);
					}
					// render or error
					else {
						res.end('An error occurred');
						console.log(err);
					}
				});

			} else {
				console.log("Invalid Login");

			}
		}
	}, getUser);

};

exports.logout = function(req, res) {
	req.session.destroy();
	res.redirect("/");

};

exports.register = function(req, res) {
	var data;
	var responseString;
	var Fname = req.param("first_name");
	if (Fname == null || typeof (Fname) == 'undefined') {
		data = {
			errorCode : 101,
			message : "First name requried for sucessful registration"
		};
		responseString = JSON.stringify(data);
		res.send(responseString);
	}
	var Lname = req.param("last_name");
	if (Lname == null || typeof (Lname) == 'undefined') {
		data = {
			errorCode : 101,
			message : "Last name requried for sucessful registration"
		};
		responseString = JSON.stringify(data);
		res.send(responseString);
	}
	var Email = req.param("email");
	if (Email == null || typeof (Email) == 'undefined') {
		data = {
			errorCode : 101,
			message : "Email requried for sucessful registration"
		};
		responseString = JSON.stringify(data);
		res.send(responseString);
	}
	var Password = req.param("password");
	if (Password == null || typeof (Password) == 'undefined') {
		data = {
			errorCode : 101,
			message : "Password requried for sucessful registration"
		};
		responseString = JSON.stringify(data);
		res.send(responseString);
	}
	var username = req.param("username");
	if (username == null || typeof (username) == 'undefined') {
		data = {
			errorCode : 101,
			message : "Username requried for sucessful registration"
		};
		responseString = JSON.stringify(data);
		res.send(responseString);
	}
	var todaysDate = common.FormatDate(new Date(), "%Y-%m-%d %H:%M:%S", true);
	var newUserData = {
		fname : Fname,
		lname : Lname,
		username : username,
		password : Password,
		lastlogin : todaysDate,
		email : Email
	};
	mysql.insertData(function(err, results) {
		if (err) {
			throw err;
		} else {
			console.log("new user registered.")
			res.redirect("/");
		}

	}, newUserData, "user");

};


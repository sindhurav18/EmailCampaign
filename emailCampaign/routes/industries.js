/**
 * New node file
 */

//[TODO: get the list of industries and corresponding keywords]
// algorithm to decide the effectivity of the subject line for the email 
var ejs = require("ejs");
var mysql = require('./mysql');



/**
 * New node file
 */

exports.getIndustryListJSON = function(req, res) {
	var getQuery = "select *from industries";
	mysql.fetchData(function(err, results) {
		if (err) {
			throw err;
		} else {
			console.log(results);
			var responseString = JSON.stringify(results);
			res.send(responseString);

		}
	}, getQuery);

};
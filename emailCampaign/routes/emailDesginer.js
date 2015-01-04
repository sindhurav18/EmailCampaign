/**
 * New node file
 */
// [TODO: Create, edit delete email templates]
// reference database table: emails
var ejs = require("ejs");
var mysql = require('./mysql');
var nodemailer = require('nodemailer');

exports.saveEmailForUser = function(req, res) {
	var responseString;
	var data;
	var userObject = req.session.user;
	var ownedId = userObject.Id;
	// get the params: bid,review,rating
	var email = req.param("emailContent");
	if (email == null || typeof (email) == 'undefined') {
		data = {
			errorCode : 101,
			message : "Please select an email template to design your email."
		};
		responseString = JSON.stringify(data);
		res.send(responseString);
	}
	var subjectL = req.param("subject");
	if (subjectL == null || typeof (subjectL) == 'undefined') {
		data = {
			errorCode : 101,
			message : "Please enter a subject line to design your email."
		};
		responseString = JSON.stringify(data);
		res.send(responseString);
	}
	var newEmailData = {
		ownerId : ownedId,
		emailString : email,
		subjectLine:subjectL

	};
	mysql
			.insertData(
					function(err, results) {
						if (err) {
							console.log("error while saving email.");
							data = {
								errorCode : 101,
								message : "There was some error while saving your email please try again."
							};
							responseString = JSON.stringify(data);
							res.send(responseString);
						} else {
							console.log("email saved.");
							data = {
								errorCode : 100,
								message : "Your email has been recorded."
							};
							responseString = JSON.stringify(data);
							res.send(responseString);
						}

					}, newEmailData, "emails");

};

exports.deleteEmail = function(req, res) {

	var Eid = req.param("email-id");
	var data;
	var responseString;
	if (Eid == null || typeof (Eid) == "undefined") {
		data = {
			errorCode : 101,
			message : "Please select an email to delete."
		};
		responseString = JSON.stringify(data);
		res.send(responseString);
	} else {
		var deleteQuery = "Delete from emails where id=" + Eid;
		mysql
				.fetchData(
						function(err, results) {
							if (err) {
								data = {
									errorCode : 101,
									message : "Error occured on the server side.Please try again."
								};
								responseString = JSON.stringify(data);
								res.send(responseString);
							} else {

								data = {
									errorCode : 100,
									message : "Email deleted succesfully."
								};
								responseString = JSON.stringify(data);
								res.send(responseString);
							}
						}, deleteQuery);

	}
};

exports.editEmail = function(req, res) {
	var Eid = req.param("Email-id");
	var Email = req.param("Email");
	var data;
	var responseString;
	if (Eid == null || typeof (Eid) == "undefined" || Email == null
			|| typeof (Email) == "undefined") {
		data = {
			errorCode : 101,
			message : "Please select a valid email template."
		};
		responseString = JSON.stringify(data);
		res.send(responseString);
	} else {
		var updateQuery = "Update emails Set emailString='" + Email
				+ "' where id=" + Eid;
		mysql
				.fetchData(
						function(err, results) {

							if (err) {
								data = {
									errorCode : 101,
									message : "Error occured on the server side.Please try again."
								};
								responseString = JSON.stringify(data);
								res.send(responseString);
							} else {

								console.log("Category updated.");
								data = {
									errorCode : 100,
									message : "The email template changes were saved successfully."
								};
								responseString = JSON.stringify(data);
								res.send(responseString);
							}
						}, updateQuery);

	}
};

exports.sendEmail = function(req, res) {
	var data;
	var responseString;
	var emailType=req.param("emailType");
	var subject = req.param("subject");
	var ind=req.param("selectedIndustry");
	if (subject == null || typeof (subject) == 'undefined') {
		data = {
			errorCode : 101,
			message : "Please give a subject to your email for increasing the open rate."
		};
		responseString = JSON.stringify(data);
		res.send(responseString);
	}
	var addressTo = req.param("addressTo");
	if (addressTo == null || typeof (addressTo) == 'undefined') {
		data = {
			errorCode : 101,
			message : "Please enter the group of people you wish to send the email to."
		};
		responseString = JSON.stringify(data);
		res.send(responseString);
	}
	var email = req.param("EmailBody");
	if (email == null || typeof (email) == 'undefined') {
		data = {
			errorCode : 101,
			message : "Please select an email template for your email."
		};
		responseString = JSON.stringify(data);
		res.send(responseString);
	}
	// get the contacts for the group
	var getC="Select * from contacts where groupId="+addressTo;
	mysql.fetchData(function(err, results) {
		if (err) {
			throw err;
		} else {
			var emails=results[0].email;
			for(var count=0; count < results.length;count++)
				{
					if(count==0)
						{
							continue;
						}
					else
						{
						emails=emails+","+results[count].email;
						}
					
				}
			
			var userObject = req.session.user;
			var senderEmail = userObject.email;
			var transporter = nodemailer.createTransport({
				service : 'gmail',
				auth : {
					user : 'maitreyeesunildesai@gmail.com',
					pass : 'msuniapplications'
				}
			});		
				
			var mailOptions = {
						from : senderEmail, // sender address
						to : emails, // list of receivers separated by commas
						subject : subject, // Subject line
						html : email

					};			
				transporter.sendMail(
							mailOptions,
							function(error, info) {
								if (error) {
									console.log(error);
									data = {
										errorCode : 101,
										message : "An error occured while sending the email. Please try again."
									};
									responseString = JSON.stringify(data);
									res.send(responseString);
								} else {
									
									var newEmail={
											
											ownerId:userObject.id,
											emailString:email,
											subjectLine:subject,
											industry:ind,
											sentTo:addressTo
									};
									mysql.insertData(function(err, results) {
												if (err) {
													console.log("error while saving email.");
													data = {
														errorCode : 101,
														message : "There was some error while saving your email please try again."
													};
													responseString = JSON.stringify(data);
													res.send(responseString);
												} else {
													res.redirect("/email");
												}

											}, newEmail, "emails");
									
									
								}
							});

		}
	}, getC);
	
	


};

function checkSubjectEffectivity(subjectLine, keywords) {
	var keywordArray = keywords.split(",");
	subjectLine=subjectLine.trim().toLowerCase();
	var count = 0;
	for (var counter = 0; counter < keywordArray.length; counter++) {
		var word = keywordArray[counter].toLowerCase();
		if (subjectLine.indexOf(word) > -1) {
			count = count + 1;
		}
	}
	var percent=(count/keywordArray.length)*100;
	return percent;
}

exports.checkEmailSubjectLine = function(req, res) {
	var industryID = req.param("industry");
	var subject = req.param("subject");
	var responseString;
	var getQuery = "Select *from industries where Id=" + industryID;
	mysql.fetchData(function(err, results) {

		if (err) {
			throw err;
		} else {
			var reqObj = results[0];
			var percentEffectivity= checkSubjectEffectivity(subject,reqObj.keywords);
			var keywordArray = reqObj.keywords.split(",");
			var suggestion="To inscrease your clicks use words like: "+ keywordArray[0]+","+keywordArray[1]+", "+keywordArray[2];
			var resultObj={
					sugg:suggestion,
					percent:percentEffectivity
			};
			responseString = JSON.stringify(resultObj);
			res.send(responseString);
		}
	}, getQuery);

};


exports.sendTemplateEmail = function(req, res) {
	var data;
	var responseString;
	var templateType=req.param("templateType");
	var subject = req.param("subject");
	var ind=req.param("selectedIndustry");
	if (subject == null || typeof (subject) == 'undefined') {
		data = {
			errorCode : 101,
			message : "Please give a subject to your email for increasing the open rate."
		};
		responseString = JSON.stringify(data);
		res.send(responseString);
	}
	var addressTo = req.param("addressTo");
	if (addressTo == null || typeof (addressTo) == 'undefined') {
		data = {
			errorCode : 101,
			message : "Please enter the group of people you wish to send the email to."
		};
		responseString = JSON.stringify(data);
		res.send(responseString);
	}
	var email = req.param("EmailBody");
	if (email == null || typeof (email) == 'undefined') {
		data = {
			errorCode : 101,
			message : "Please select an email template for your email."
		};
		responseString = JSON.stringify(data);
		res.send(responseString);
	}
	// get the contacts for the group
	var getC="Select * from contacts where groupId="+addressTo;
	mysql.fetchData(function(err, results) {
		if (err) {
			throw err;
		} else {
			var emails=results[0].email;
			for(var count=0; count < results.length;count++)
				{
					if(count==0)
						{
							continue;
						}
					else
						{
						emails=emails+","+results[count].email;
						}
					
				}
			
			var userObject = req.session.user;
			var senderEmail = userObject.email;
			var transporter = nodemailer.createTransport({
				service : 'gmail',
				auth : {
					user : 'maitreyeesunildesai@gmail.com',
					pass : 'msuniapplications'
				}
			});		
			if(templateType==1)
			{
					//classic
				var mailOptions = {
						from : senderEmail, // sender address
						to : emails, // list of receivers separated by commas
						subject : subject, // Subject line
						html : email,
						attachments: [{
					        filename: 'image.png',
					        path: '/path/to/file',
					        cid: 'unique@kreata.ee' //same cid value as in the html img src
					    }]
					};		
				
			}
			if(templateType==2)
			{
				//personal
				var mailOptions = {
						from : senderEmail, // sender address
						to : emails, // list of receivers separated by commas
						subject : subject, // Subject line
						html : email,
						attachments: [{
					        filename: 'image.png',
					        path: '/path/to/file',
					        cid: 'unique@kreata.ee' //same cid value as in the html img src
					    }]
					};		
			
			}
			if(templateType==3)
			{
				//professional
				var mailOptions = {
						from : senderEmail, // sender address
						to : emails, // list of receivers separated by commas
						subject : subject, // Subject line
						html : email,
						attachments: [{
					        filename: 'image.png',
					        path: '/path/to/file',
					        cid: 'unique@kreata.ee' //same cid value as in the html img src
					    }]
					};			
			
			}
				
				transporter.sendMail(
							mailOptions,
							function(error, info) {
								if (error) {
									console.log(error);
									data = {
										errorCode : 101,
										message : "An error occured while sending the email. Please try again."
									};
									responseString = JSON.stringify(data);
									res.send(responseString);
								} else {
									
									var newEmail={
											
											ownerId:userObject.id,
											emailString:email,
											subjectLine:subject,
											industry:ind,
											sentTo:addressTo
									};
									mysql.insertData(function(err, results) {
												if (err) {
													console.log("error while saving email.");
													data = {
														errorCode : 101,
														message : "There was some error while saving your email please try again."
													};
													responseString = JSON.stringify(data);
													res.send(responseString);
												} else {
													res.redirect("/email");
												}

											}, newEmail, "emails");
									
									
								}
							});

		}
	}, getC);
	
	


};

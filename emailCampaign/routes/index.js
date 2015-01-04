var ejs = require("ejs");
var mysql = require('./mysql');
var common = require('./common');
var nodemailer = require('nodemailer');
/*
 * GET home page.
 */

exports.index = function(req, res) {
	res.render('Landing', {
		title : 'Email campaign'
	});
};

exports.getSignupPage = function(req, res) {
	res.render('Sign-Up', {
		title : 'Email campaign'
	});
};

exports.getHome = function(req, res) {
	var user = req.session.user;
	if (typeof (user) == "undefined") {
		res.redirect("/");
	} else {

		ejs.renderFile('./views/Home.ejs', user, function(err, result) {
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
	}

};
exports.getAboutUs = function(req, res) {
	res.render('About-us', {
		title : 'Email campaign'
	});
};
exports.getFeatures = function(req, res) {
	res.render('Features', {
		title : 'Email campaign'
	});
};

exports.getContacts = function(req, res) {
	var user = req.session.user;
	if (typeof (user) == "undefined") {
		res.redirect("/");
	} else {

		var owned = user.id;
		console.log(owned);
		var getQuery = "select *from contactgroup where ownerId=" + owned;
		mysql.fetchData(function(err, results) {
			if (err) {
				throw err;
			} else {
				if (typeof (results) == "undefined") {
					results = new Array();

				}
				user.contactList = results;
				ejs.renderFile('./views/contacts.ejs', user, function(err,
						result) {
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

			}
		}, getQuery);

	}

};

exports.getEmailsPage = function(req, res) {

	var user = req.session.user;
	if (typeof (user) == "undefined") {
		res.redirect("/");
	} else {
		var getInd="Select *from industries";
		mysql.fetchData(function(err, results) {
			if (err) {
				throw err;
			} else {
				
				user.industries= results;
				var getEmails="SELECT subjectLine, groupName FROM emails JOIN contactgroup on emails.sentTo= contactgroup.id where emails.ownerId="+user.id;
				mysql.fetchData(function(err, resultsEmails) {
					if (err) {
						throw err;
					} else {
						var test=resultsEmails[0].subjectLine;
						user.historyEmails=resultsEmails;
						ejs.renderFile('./views/emails.ejs', user, function(err, result) {
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
					}
				}, getEmails);
				
			}
		}, getInd);
		
	}

};

exports.getIndexPage = function(req, res) {
	res.render('index', {
		title : 'Email campaign'
	});
};

exports.getSignInPage = function(req, res) {
	res.render('signin', {
		title : 'Email campaign'
	});
};
exports.getCreateListView = function(req, res) {
	res.render('CreateList', {
		title : 'Email campaign'
	});
};

exports.getTemplateView = function(req, res) {
	var user = req.session.user;
	if (typeof (user) == "undefined") {
		res.redirect("/");
	} else {
		ejs.renderFile('./views/templates.ejs', user, function(err, result) {
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
	}
	
	
};

exports.getListOverView = function(req, res) {

	var listName = req.param("list");
	var user = req.session.user;
	if (typeof (user) == "undefined") {
		res.redirect("/");
	} else {
		var owned = user.id;
		var getQuery = "select *from contactgroup where ownerId=" + owned
				+ " and groupName='" + listName + "'";
		mysql.fetchData(function(err, results) {
			if (err) {
				throw err;
			} else {
				var list = results[0];
				var listId = list.id;
				var getContact = "select *from contacts where groupId="	+ listId;
				mysql.fetchData(function(err, results) {
					if (err) {
						throw err;
					} else {
						if(typeof(results)=="undefined")
							{
								results=new Array();
							}
						user.list=results;
						user.currentList=listName;
						ejs.renderFile('./views/ListOverView.ejs', user, function(err, result) {
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
						
						
					}
				}, getContact);

			}
		}, getQuery);

	}

	
};



exports.AddContacts = function(req, res) {
	var user = req.session.user;
	var list=req.param("list");
	if (typeof (user) == "undefined") {
		res.redirect("/");
	} else {
		user.listID=list;
		ejs.renderFile('./views/AddContacts.ejs', user, function(err, result) {
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
	}
	
};
var selectedTemplate;
var selectedTemplateType;
var industryType;
exports.getClassicTemplate=function(req,res)
{
	var user = req.session.user;
	selectedTemplateType=2;
	industryType=4;
	if (typeof (user) == "undefined") {
		res.redirect("/");
	} else {
		var getInd="Select *from industries";
		mysql.fetchData(function(err, results) {
			if (err) {
				throw err;
			} else {
				
				user.industries= results;
				ejs.renderFile('./views/classic-template.ejs', user, function(err, result) {
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
				
			}
		}, getInd);
		
	}


};

exports.getPersonalTemplate=function(req,res)
{
	var user = req.session.user;
	industryType=3;
	selectedTemplateType=1;
	if (typeof (user) == "undefined") {
		res.redirect("/");
	} else {
		var getInd="Select *from industries";
		mysql.fetchData(function(err, results) {
			if (err) {
				throw err;
			} else {
				
				user.industries= results;
				ejs.renderFile('./views/personal-template.ejs', user, function(err, result) {
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
				
			}
		}, getInd);
		
	}
	

};


exports.getProfessionalTemplate=function(req,res)
{
	var user = req.session.user;
	industryType=2;
	selectedTemplateType=3;
	if (typeof (user) == "undefined") {
		res.redirect("/");
	} else {
		var getInd="Select *from industries";
		mysql.fetchData(function(err, results) {
			if (err) {
				throw err;
			} else {
				
				user.industries= results;
				ejs.renderFile('./views/professional-template.ejs', user, function(err, result) {
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
				
			}
		}, getInd);
		
	}
	

};

exports.getCreateEmailPage=function(req,res)
{
	var user = req.session.user;
	var industry=req.param("industry");
	if (typeof (user) == "undefined") {
		res.redirect("/");
	} else {
		
		var getQuery = "select *from contactgroup where ownerId=" + user.id;
		mysql.fetchData(function(err, results) {
			if (err) {
				throw err;
			} else {
				if (typeof (results) == "undefined") {
					results = new Array();

				}
				user.contactList = results;
				user.industry=industry;
				ejs.renderFile('./views/CreateEmail.ejs', user, function(err, result) {
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

			}
		}, getQuery);
		
	}
};

exports.getSendEmailUsingTemplate=function(req,res)
{
	selectedTemplate=req.param("template");	
	selectedTemplateType=req.param("TemplateType");
	//var industry=6;
	var user = req.session.user;
	if (typeof (user) == "undefined") {
		res.redirect("/");
	} else {
		
		var getQuery = "select *from contactgroup where ownerId=" + user.id;
		mysql.fetchData(function(err, results) {
			if (err) {
				throw err;
			} else {
				if (typeof (results) == "undefined") {
					results = new Array();

				}
				user.contactList = results;
				user.industry=industryType;
				ejs.renderFile('./views/CreateEmailUsingTemplate.ejs', user, function(err, result) {
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

			}
		}, getQuery);
		
	}

}


exports.sendTemplateEmail = function(req, res) {
	var data;
	var responseString;
	//var templateType=req.param("templateType");
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
			if(selectedTemplateType==1)
			{
					//personal
				var mailOptions = {
						from : senderEmail, // sender address
						to : emails, // list of receivers separated by commas
						subject : subject, // Subject line
						html : selectedTemplate,
						attachments: [{
					        filename: 'image.png',
					        path: '/path/to/file',
					        cid: 'unique@kreata.ee' //same cid value as in the html img src
					    }]
					};		
				
			}
			if(selectedTemplateType==2)
			{
				//classic
				var mailOptions = {
						from : senderEmail, // sender address
						to : emails, // list of receivers separated by commas
						subject : subject, // Subject line
						html : selectedTemplate,
						attachments: [{
					        filename: 'image.png',
					        path: '/path/to/file',
					        cid: 'unique@kreata.ee' //same cid value as in the html img src
					    }]
					};		
			
			}
			if(selectedTemplateType==3)
			{
				//professional
				var mailOptions = {
						from : senderEmail, // sender address
						to : emails, // list of receivers separated by commas
						subject : subject, // Subject line
						html : selectedTemplate,
						attachments: [{
					        filename: 'image.png',
					        path: '/public/images/img1.jpg',
					        cid: 'unique@kreata.ee' //same cid value as in the html img src
					    },
					    {
					        filename: 'image.png',
					        path: '/public/images/img2.jpg',
					        cid: 'unique@kreata90.ee' //same cid value as in the html img src
					    }
					    ]
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
											emailString:"",
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

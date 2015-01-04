/**
 * New node file
 */

// [TODO: add, edit delete contacts, also form groups of the contacts, get list
// of contacts, get list of groups in JSON/ HTML]
// reference database template contacts and contact groups
var ejs = require("ejs");
var mysql = require('./mysql');
var csv = require("fast-csv");

exports.getContactListJSON = function(req, res) {
	var userObj = req.session.user;
	var owned = userObj.id;
	var getQuery = "select *from contacts where ownerId=" + owned;
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

exports.getContactGroupListJSON = function(req, res) {
	var userObj = req.session.user;
	var owned = userObj.id;
	var getQuery = "select *from contactgroup where ownerId=" + owned;
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

exports.addContact = function(req, res) {
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
	var grpId = req.param("group-id");
	if (grpId == null || typeof (grpId) == 'undefined') {
		data = {
			errorCode : 101,
			message : "Please select a group for the contact"
		};
		responseString = JSON.stringify(data);
		res.send(responseString);
	}
	var ownedBy = req.session.user.Id;
	var newContactData = {
		fname : Fname,
		lname : Lname,
		email : Email,
		groupId : grpId,
		isRead : 0,
		ownerId : ownedBy
	};
	mysql.insertData(function(err, results) {
		if (err) {
			throw err;
		} else {
			console.log("new contact registered.");
			data = {
				errorCode : 100,
				message : "The contact was saved successfully"
			};
			responseString = JSON.stringify(data);
			res.send(responseString);
		}

	}, newContactData, "contacts");

};

exports.addBulkContacts = function(req, res) {
	
	var resdata;
	var user = req.session.user;
	var responseString;
	var connectionString = req.param("ContactConnection");
	var listName = req.param("listID");
	var contactList = req.param("manualEntry");
	var file = req.param("contact-file");
	if (typeof (contactList) == "undefined"|| contactList=="") {
		var getQuery = "select *from contactgroup where groupName= '"+ listName+ "' and ownerId="+user.id;
		console.log("at test 2");
		mysql.fetchData(function(err, results) {
			if (err) {
				throw err;
			} else {
				if (results.length > 0) {
					csv.fromPath(req.files.contactFile.path).on("data",function(data) {
						console.log(data);
						var Fname = data[0];
						var Lname = data[1];
						var Email = data[2];
						var grpId = results[0].id;
						var newContactData = {
							fname : Fname,
							lname : Lname,
							email : Email,
							groupId : grpId,
							isRead : 0,
							ownerId : user.id
						};
						mysql.insertData(function(err, results) {
							if (err) {
								throw err;
							} else {
								console.log("contacts registered");																					
							}

						}, newContactData, "contacts");
					}).on("end",function() {
								console.log("done:File end");
								var url = "/listOverView?list=" + listName;
								res.redirect(url);
							});
					

				} else {
					// error: no such group exists.
				}
				
			}

		}, getQuery);
	} else {
		// else parse the multi contact string and add the contacts
		var getQ = "select *from contactgroup where groupName= '" + listName
				+ "'";
		mysql.fetchData(function(err, results) {
			if (err) {
				throw err;
			} else {
				if (results.length > 0) {
					var contactPairs = contactList.split('\n');
					for (var each = 0; each < contactPairs.length; each++) {
						var pair = contactPairs[each];
						var data = pair.split(',');
						console.log(data);
						var Email = data[0];
						var name = data[1];
						var grpId = results[0].id;
						var owned = user.id;
						var newContactData = {
							fname : name,
							lname : name,
							email : Email,
							groupId : grpId,
							isRead : 0,
							ownerId : owned
						};
						mysql.insertData(function(err, results) {
							if (err) {
								throw err;
							} else {
								console.log("contacts registered");
								
							}

						}, newContactData, "contacts");

					}
					var url = "/listOverView?list=" + listName;
					res.redirect(url);

				} else {
					// error: no such group exists.
				}

			}

		}, getQ);
	}

};

exports.createGroup = function(req, res) {
	var data;
	var responseString;
	var Gname = req.param("group_name");
	var con = req.param("ContactConnection");
	var contactList = req.param("manualEntry");
	var file = req.param("contactFile");
	if (typeof (file) == "undefined" && typeof (contactList) == "undefined") {
		data = {
			errorCode : 101,
			message : "Required fields missing."
		};
		responseString = JSON.stringify(data);
		res.send(responseString);
	}
	if (Gname == null || typeof (Gname) == 'undefined' || con == null
			|| typeof (con) == 'undefined') {
		data = {
			errorCode : 101,
			message : "Required fields missing."
		};
		responseString = JSON.stringify(data);
		res.send(responseString);
	}
	var userObj = req.session.user;
	var owned = userObj.id;
	var checkValidity = "select * from contactgroup where groupName='" + Gname
			+ "' and ownerId=" + parseInt(owned);

	mysql
			.fetchData(
					function(err, results) {
						if (err) {
							throw err;
							console.log("at test 1");
						} else {

							// if the group namealready exists send an error
							// message
							if (results.length != 0) {
								data = {
									errorCode : 101,
									message : "Please choose a unique list name. You already have a list by this name"
								};
								responseString = JSON.stringify(data);
								res.send(responseString);
							}

							else {

								// enter the new group and its contacts
								var newGroupData = {
									groupName : Gname,
									ownerId : owned,
									connection : con
								};
								mysql.insertData(function(err, results) {
													if (err) {
														throw err;
													} else {
														if (typeof (contactList) == "undefined"|| contactList=="") {
															// file was uploaded
															var getQuery = "select *from contactgroup where groupName= '"+ Gname+ "' and ownerId="+owned;
															console.log("at test 2");
															mysql.fetchData(function(err, results) {
																if (err) {
																	throw err;
																} else {
																	if (results.length > 0) {
																		csv.fromPath(req.files.contactFile.path).on("data",function(data) {
																			console.log(data);
																			var Fname = data[0];
																			var Lname = data[1];
																			var Email = data[2];
																			var grpId = results[0].id;
																			var newContactData = {
																				fname : Fname,
																				lname : Lname,
																				email : Email,
																				groupId : grpId,
																				isRead : 0,
																				ownerId : owned
																			};
																			mysql.insertData(function(err, results) {
																				if (err) {
																					throw err;
																				} else {
																					console.log("contacts registered");																					
																				}

																			}, newContactData, "contacts");
																		}).on("end",function() {
																					console.log("done:File end");
																					res.redirect("/contacts");
																				});
																		

																	} else {
																		// error: no such group exists.
																	}
																	
																}

															}, getQuery);
															
														} else {
															// take the input
															// else parse the multi contact string and add the contacts
															var getQ = "select *from contactgroup where groupName= '" + Gname
																	+ "' and ownerId="
																	+ parseInt(owned);
															mysql.fetchData(function(err, results) {
																if (err) {
																	throw err;
																} else {
																	if (results.length > 0) {
																		var contactPairs = contactList.split('\n');
																		for (var each = 0; each < contactPairs.length; each++) {
																			var pair = contactPairs[each];
																			var data = pair.split(',');
																			console.log(data);
																			var Email = data[0];
																			var name = data[1];
																			var grpId = results[0].id;
																			var newContactData = {
																				fname : name,
																				lname : name,
																				email : Email,
																				groupId : grpId,
																				isRead : 0,
																				ownerId : owned
																			};
																			mysql.insertData(function(err, results) {
																				if (err) {
																					throw err;
																				} else {
																					console.log("contacts registered");																					
																				}

																			}, newContactData, "contacts");

																		}
																		var url = "/listOverView?list=" + Gname;
																		res.redirect(url);
																		

																	} else {
																		// error: no such group exists.
																	}
																	
																}

															}, getQ);
															// from contact list
															
														}
														
													}

												}, newGroupData, "contactgroup");

							}
						}
					}, checkValidity);

}

exports.deleteContact = function(req, res) {
	var Cid = req.param("contact-id");
	var data;
	var responseString;
	if (Cid == null || typeof (Cid) == "undefined") {
		data = {
			errorCode : 101,
			message : "Please select contact to delete."
		};
		responseString = JSON.stringify(data);
		res.send(responseString);
	} else {
		var deleteQuery = "Delete from contacts where id=" + Cid;
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
									message : "Contact deleted succesfully."
								};
								responseString = JSON.stringify(data);
								res.send(responseString);
							}
						}, deleteQuery);

	}
};

exports.deleteContactGroup = function(req, res) {
	var Cid = req.param("contact-id");
	var data;
	var responseString;
	if (Cid == null || typeof (Cid) == "undefined") {
		data = {
			errorCode : 101,
			message : "Please select contact to delete."
		};
		responseString = JSON.stringify(data);
		res.send(responseString);
	} else {
		var deleteQuery = "Delete from contacts where id=" + Cid;
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
									message : "Contact deleted succesfully."
								};
								responseString = JSON.stringify(data);
								res.send(responseString);
							}
						}, deleteQuery);

	}
};

exports.editContact = function(req, res) {
	var Cid = req.param("contact-id");
	var fname = req.param("first-name");
	var lname = req.param("last-name");
	var email = req.param("email");
	var group = req.param("group-id");
	var data;
	var responseString;
	if (Cid == null || typeof (Cid) == "undefined" || email == null
			|| typeof (email) == "undefined" || group == null
			|| typeof (group) == "undefined") {
		data = {
			errorCode : 101,
			message : "Please enter all the required fields."
		};
		responseString = JSON.stringify(data);
		res.send(responseString);
	} else {
		var updateQuery = "Update contacts Set fname='" + fname + "' , lname='"
				+ lname + "', email='" + email + "' , groupId=" + group
				+ " where id=" + Cid;
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
									message : "Your changes were saved successfully."
								};
								responseString = JSON.stringify(data);
								res.send(responseString);
							}
						}, updateQuery);

	}

};

exports.editContactGroup = function(req, res) {

	var gname = req.param("group-name");
	var group = req.param("group-id");
	var data;
	var responseString;
	if (gname == null || typeof (gname) == "undefined" || group == null
			|| typeof (group) == "undefined") {
		data = {
			errorCode : 101,
			message : "Please enter all the required fields."
		};
		responseString = JSON.stringify(data);
		res.send(responseString);
	} else {
		var updateQuery = "Update contactgroup Set groupName='" + gname
				+ "' where id=" + group;
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
									message : "Your changes were saved successfully."
								};
								responseString = JSON.stringify(data);
								res.send(responseString);
							}
						}, updateQuery);

	}
};

exports.renderTest = function(req, res) {
	ejs.renderFile('./views/test.ejs', function(err, result) {
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

};

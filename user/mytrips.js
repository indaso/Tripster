var express = require('express');
var router = express.Router();
var oracle = require('oracle');
global.User = require('./user');
//var location = require('location');



var connectData = {
	hostname: "tripsterdb.cmjcmauyxdtp.us-east-1.rds.amazonaws.com",
	port: 1521,
	database: "Wally",
	user: "masterusr",
	password: "CS450&frdS"
};

//should be an array of tripsObjs
var trips = [];
var tripids = [];

var idcount = [];
var tripObjs = [];

function contains(array, obj) {
	var i = array.length;
	while (i--) {
		if (array[i] === obj) {
			return true;
		}
	}
	return false;
}

function loadpage(req, res) {



	oracle.connect(connectData, function (err, connection) {
		if (err) {
			console.log("Error connecting to db:", err);
			return;
		}

		//get tripid, locationid to print into page (list)
		var query =
			"SELECT * FROM TRIPS T " +
			"INNER JOIN PLANS ON Plans.trip_id = T.trip_id " +
			"INNER JOIN HAS ON HAS.trip_id = T.trip_id " +
			"INNER JOIN INCLUDES ON Includes.album_id = Has.album_id " +
			"INNER JOIN CONTENT ON Includes.content_id = CONTENT.content_id " +
			"WHERE Plans.USER_ID = '" +
			global.currUser.username + "'";

		connection.execute(query, [], function (err, results) {
			if (err) {
				console.log("Error executing query:", err);
				return;
			}


			for (var i = 0; i < results.length; i++) {
				if (!contains(idcount, results[i].TRIP_ID)) {
					idcount.push(results[i].TRIP_ID);
					console.log('idcount = ' + idcount);
					var tripObj = {
						tripid: results[i].TRIP_ID,
						locationid: results[i].LOCATION_ID,
						albumid: results[i].ALBUM_ID,
						contents: [],
						crating: [],
						craters: [],
						//array of arrays size 2: comment, commenter
						tcomments: [],
						tratings: [],
						traters: []

					};
					tripObjs.push(tripObj);
				} else {
					for (var j = 0; j < tripObjs.length; j++) {
						if (tripObjs[j].tripid == results[i].TRIP_ID) {
							if (!contains(tripObjs[j].contents, results[i].URL)) {
								tripObjs[j].contents.push(results[i].URL);
							}
							/*tripObjs[j].ccomments.push(results[i].C_COMMENT);
							tripObjs[j].crating.push(results[i].C_RATING);
							tripObjs[j].tcomments.push(results[i].T_COMMENT);
							tripObjs[j].trating.push(results[i].T_RATING);*/
						}
					}
				}
			}

			var s = "SELECT P.TRIP_ID, TC.T_COMMENT AS tcomment, TC.T_COMMENTER_ID AS tcommenter  " +
				"FROM PLANS P " +
				"INNER JOIN T_COMMENTS TC ON TC.TRIP_ID = P.TRIP_ID " +
				"WHERE P.USER_ID = '" + global.currUser.username +
				"' ORDER BY P.TRIP_ID";
			console.log(s);
			connection.execute(s, [], function (err, results) {
				if (err) {
					console.log("Error executing query:", err);
					return;
				}
				//console.log('tcomment results ----');
				//console.log(results);
				for (var i = 0; i < results.length; i++) {
					for (var j = 0; j < tripObjs.length; j++) {
						if (results[i].TRIP_ID == tripObjs[j].tripid) {
							var temp = [results[i].TCOMMENT, results[i].TCOMMENTER];
							//console.log('added comment/commenter pair ----');
							//console.log(temp);
							tripObjs[j].tcomments.push(temp);
						}
					}
				}

				var s1 = "SELECT P.TRIP_ID, TR.T_RATING AS trating, TR.T_RATER_ID AS trater " +
					"FROM PLANS P INNER JOIN T_RATES TR ON TR.TRIP_ID = P.TRIP_ID " +
					"WHERE P.USER_ID = '" + global.currUser.username + "' ORDER BY P.TRIP_ID";
				console.log(s1);
				connection.execute(s1, [], function (err, results) {
					if (err) {
						console.log("Error executing query:", err);
						return;
					}
					//console.log("trip ratings results-------");
					//console.log(results);
					for (var i = 0; i < results.length; i++) {
						for (var j = 0; j < tripObjs.length; j++) {
							if (results[i].TRIP_ID == tripObjs[j].tripid) {
								tripObjs[j].tratings.push(results[i].TRATING);
								//console.log('pushed onto tratings: ' + results[i].trating);
								tripObjs[j].traters.push(results[i].TRATER);
								//console.log('pushed onto traters: ' + results[i].trater);
							}
						}
					}

					for (var k = 0; k < tripObjs.length; k++) {
						var sum = 0;
						for (var l = 0; l < tripObjs[k].tratings.length; l++) {
							sum += tripObjs[k].tratings[l];
						}
						var avg = sum / tripObjs[k].tratings.length;
						tripObjs[k].tratings = [avg];
					}

					connection.close();

					//console.log("tripobjs:=======================");
					//console.log(tripObjs);

					/*
										////////------------------------------------------------------------



										var s3 = "SELECT P.TRIP_ID, I.CONTENT_ID, CC.C_COMMENT AS ccomment, CC.C_COMMENTER_ID AS ccommenter  " +
											"FROM PLANS P " +
											"INNER JOIN HAS ON P.TRIP_ID = HAS.TRIP_ID " +
											"INNER JOIN INCLUDES I ON I.ALBUM_ID = HAS.ALBUM_ID " +
											"INNER JOIN C_COMMENTS CC ON CC.CONTENT_ID = I.CONTENT_ID " +
											"WHERE P.USER_ID = '" + global.currUser.username +
											"' ORDER BY I.CONTENT_ID";
										console.log(s3);
										connection.execute(s3, [], function (err, results) {
											if (err) {
												console.log("Error executing query:", err);
												return;
											}
											//console.log('tcomment results ----');
											//console.log(results);
											for (var i = 0; i < results.length; i++) {
												for (var j = 0; j < tripObjs.length; j++) {
													if (results[i].TRIP_ID == tripObjs[j].tripid) {
														var temp = [results[i].TCOMMENT, results[i].TCOMMENTER];
														console.log('added comment/commenter pair ----');
														console.log(temp);
														tripObjs[j].tcomments.push(temp);
													}
												}
											}

											var s1 = "SELECT P.TRIP_ID, TR.T_RATING AS trating, TR.T_RATER_ID AS trater " +
												"FROM PLANS P INNER JOIN T_RATES TR ON TR.TRIP_ID = P.TRIP_ID " +
												"WHERE P.USER_ID = '" + global.currUser.username + "' ORDER BY P.TRIP_ID";
											console.log(s1);
											connection.execute(s1, [], function (err, results) {
												if (err) {
													console.log("Error executing query:", err);
													return;
												}
												//console.log("trip ratings results-------");
												//console.log(results);
												for (var i = 0; i < results.length; i++) {
													for (var j = 0; j < tripObjs.length; j++) {
														if (results[i].TRIP_ID == tripObjs[j].tripid) {
															tripObjs[j].tratings.push(results[i].TRATING);
															//console.log('pushed onto tratings: ' + results[i].trating);
															tripObjs[j].traters.push(results[i].TRATER);
															//console.log('pushed onto traters: ' + results[i].trater);
														}
													}
												}

												for (var k = 0; k < tripObjs.length; k++) {
													var sum = 0;
													for (var l = 0; l < tripObjs[k].tratings.length; l++) {
														sum += tripObjs[k].tratings[l];
													}
													var avg = sum / tripObjs[k].tratings.length;
													tripObjs[k].tratings = [avg];
												}

												console.log("tripobjs:=======================");
												console.log(tripObjs);
												connection.close();
											});
											console.log("content comments qury results: ");
											console.log(results);
											connection.close();

										});



										//----------------------------------------------------------- */


					//connection.close();
					//Render mytrips page
					res.render('mytrips', {
						trips: tripObjs
					});
				});


			});

		});

	});


}

function loadpage2(req, res) {



	oracle.connect(connectData, function (err, connection) {
		if (err) {
			console.log("Error connecting to db:", err);
			return;
		}

		//get tripid, locationid to print into page (list)
		var query =
			"SELECT * FROM TRIPS T " +
			"INNER JOIN PLANS ON Plans.trip_id = T.trip_id " +
			"INNER JOIN HAS ON HAS.trip_id = T.trip_id " +
			"INNER JOIN INCLUDES ON Includes.album_id = Has.album_id " +
			"INNER JOIN CONTENT ON Includes.content_id = CONTENT.content_id " +
			"WHERE Plans.USER_ID = '" +
			req.params.user_id + "'";

		connection.execute(query, [], function (err, results) {
			if (err) {
				console.log("Error executing query:", err);
				return;
			}


			for (var i = 0; i < results.length; i++) {
				if (!contains(idcount, results[i].TRIP_ID)) {
					idcount.push(results[i].TRIP_ID);
					console.log('idcount = ' + idcount);
					var tripObj = {
						tripid: results[i].TRIP_ID,
						locationid: results[i].LOCATION_ID,
						albumid: results[i].ALBUM_ID,
						contents: [],
						crating: [],
						craters: [],
						//array of arrays size 2: comment, commenter
						tcomments: [],
						tratings: [],
						traters: []

					};
					tripObjs.push(tripObj);
				} else {
					for (var j = 0; j < tripObjs.length; j++) {
						if (tripObjs[j].tripid == results[i].TRIP_ID) {
							if (!contains(tripObjs[j].contents, results[i].URL)) {
								tripObjs[j].contents.push(results[i].URL);
							}
							/*tripObjs[j].ccomments.push(results[i].C_COMMENT);
							tripObjs[j].crating.push(results[i].C_RATING);
							tripObjs[j].tcomments.push(results[i].T_COMMENT);
							tripObjs[j].trating.push(results[i].T_RATING);*/
						}
					}
				}
			}

			var s = "SELECT P.TRIP_ID, TC.T_COMMENT AS tcomment, TC.T_COMMENTER_ID AS tcommenter  " +
				"FROM PLANS P " +
				"INNER JOIN T_COMMENTS TC ON TC.TRIP_ID = P.TRIP_ID " +
				"WHERE P.USER_ID = '" + req.params.user_id +
				"' ORDER BY P.TRIP_ID";
			console.log(s);
			connection.execute(s, [], function (err, results) {
				if (err) {
					console.log("Error executing query:", err);
					return;
				}
				//console.log('tcomment results ----');
				//console.log(results);
				for (var i = 0; i < results.length; i++) {
					for (var j = 0; j < tripObjs.length; j++) {
						if (results[i].TRIP_ID == tripObjs[j].tripid) {
							var temp = [results[i].TCOMMENT, results[i].TCOMMENTER];
							//console.log('added comment/commenter pair ----');
							//console.log(temp);
							tripObjs[j].tcomments.push(temp);
						}
					}
				}

				var s1 = "SELECT P.TRIP_ID, TR.T_RATING AS trating, TR.T_RATER_ID AS trater " +
					"FROM PLANS P INNER JOIN T_RATES TR ON TR.TRIP_ID = P.TRIP_ID " +
					"WHERE P.USER_ID = '" + req.params.user_id + "' ORDER BY P.TRIP_ID";
				console.log(s1);
				connection.execute(s1, [], function (err, results) {
					if (err) {
						console.log("Error executing query:", err);
						return;
					}
					//console.log("trip ratings results-------");
					//console.log(results);
					for (var i = 0; i < results.length; i++) {
						for (var j = 0; j < tripObjs.length; j++) {
							if (results[i].TRIP_ID == tripObjs[j].tripid) {
								tripObjs[j].tratings.push(results[i].TRATING);
								//console.log('pushed onto tratings: ' + results[i].trating);
								tripObjs[j].traters.push(results[i].TRATER);
								//console.log('pushed onto traters: ' + results[i].trater);
							}
						}
					}

					for (var k = 0; k < tripObjs.length; k++) {
						var sum = 0;
						for (var l = 0; l < tripObjs[k].tratings.length; l++) {
							sum += tripObjs[k].tratings[l];
						}
						var avg = sum / tripObjs[k].tratings.length;
						tripObjs[k].tratings = [avg];
					}

					connection.close();

					//console.log("tripobjs:=======================");
					//console.log(tripObjs);

					/*
										////////------------------------------------------------------------



										var s3 = "SELECT P.TRIP_ID, I.CONTENT_ID, CC.C_COMMENT AS ccomment, CC.C_COMMENTER_ID AS ccommenter  " +
											"FROM PLANS P " +
											"INNER JOIN HAS ON P.TRIP_ID = HAS.TRIP_ID " +
											"INNER JOIN INCLUDES I ON I.ALBUM_ID = HAS.ALBUM_ID " +
											"INNER JOIN C_COMMENTS CC ON CC.CONTENT_ID = I.CONTENT_ID " +
											"WHERE P.USER_ID = '" + global.currUser.username +
											"' ORDER BY I.CONTENT_ID";
										console.log(s3);
										connection.execute(s3, [], function (err, results) {
											if (err) {
												console.log("Error executing query:", err);
												return;
											}
											//console.log('tcomment results ----');
											//console.log(results);
											for (var i = 0; i < results.length; i++) {
												for (var j = 0; j < tripObjs.length; j++) {
													if (results[i].TRIP_ID == tripObjs[j].tripid) {
														var temp = [results[i].TCOMMENT, results[i].TCOMMENTER];
														console.log('added comment/commenter pair ----');
														console.log(temp);
														tripObjs[j].tcomments.push(temp);
													}
												}
											}

											var s1 = "SELECT P.TRIP_ID, TR.T_RATING AS trating, TR.T_RATER_ID AS trater " +
												"FROM PLANS P INNER JOIN T_RATES TR ON TR.TRIP_ID = P.TRIP_ID " +
												"WHERE P.USER_ID = '" + global.currUser.username + "' ORDER BY P.TRIP_ID";
											console.log(s1);
											connection.execute(s1, [], function (err, results) {
												if (err) {
													console.log("Error executing query:", err);
													return;
												}
												//console.log("trip ratings results-------");
												//console.log(results);
												for (var i = 0; i < results.length; i++) {
													for (var j = 0; j < tripObjs.length; j++) {
														if (results[i].TRIP_ID == tripObjs[j].tripid) {
															tripObjs[j].tratings.push(results[i].TRATING);
															//console.log('pushed onto tratings: ' + results[i].trating);
															tripObjs[j].traters.push(results[i].TRATER);
															//console.log('pushed onto traters: ' + results[i].trater);
														}
													}
												}

												for (var k = 0; k < tripObjs.length; k++) {
													var sum = 0;
													for (var l = 0; l < tripObjs[k].tratings.length; l++) {
														sum += tripObjs[k].tratings[l];
													}
													var avg = sum / tripObjs[k].tratings.length;
													tripObjs[k].tratings = [avg];
												}

												console.log("tripobjs:=======================");
												console.log(tripObjs);
												connection.close();
											});
											console.log("content comments qury results: ");
											console.log(results);
											connection.close();

										});



										//----------------------------------------------------------- */


					//connection.close();
					//Render mytrips page
					res.render('mytrips', {
						trips: tripObjs
					});
				});


			});

		});

	});


}

router.get('/mytrips', function (req, res) {
	if (global.currUser.signed_in) {
		loadpage(req, res);
		trips = [];
		tripids = [];

		idcount = [];
		tripObjs = [];

		//tripObjs = [];
	} else {
		res.redirect('/login');
	}
});

router.get('/mytrips/:user_id', function (req, res) {
	if (global.currUser.signed_in) {
		loadpage2(req, res);
		trips = [];
		tripids = [];

		idcount = [];
		tripObjs = [];
		//tripObjs = [];
	} else {
		res.redirect('/login');
	}
});


router.post('/mytrips', function (req, res) {

	if (global.currUser.signed_in) {
		var albumid = req.body.albumid;
		var tripid = req.body.tripid;
		var privacycontent = req.body.privacycontent;
		var content = req.body.content;
		var contentname = req.body.contentname;


		oracle.connect(connectData, function (err, connection) {
			if (err) {
				console.log("Error connecting to db creating trip:", err);
				return;
			}

			//Check to see if album id given is actually associated with trip id entered
			var loc_query = "SELECT * FROM HAS WHERE ALBUM_ID='" + albumid + "' AND " +
				"TRIP_ID = '" + tripid + "'";
			console.log(loc_query);
			connection.execute(loc_query, [], function (err, results) {
				if (err) {
					console.log('Error executing location query:', err);
					return;
				}

				console.log(results);
				//checking for result - means tripid and albumid match
				if (results.length === 1) {

					//establish new contentid for image - incrementing the count
					var q = "SELECT * FROM CONTENT";
					console.log(q);
					connection.execute(q, [], function (err, results) {

						if (err) {
							console.log('Error executing location query:::', err);
							return;
						}

						var contentid = results.length + 1;
						console.log('new content id --' + contentid);

						//add piece of content to CONTENT table
						var q2 = "INSERT INTO CONTENT VALUES ('photo', '";
						q2 = q2 + contentname + "', 'this is a caption', " + contentid + ", '" +
							privacycontent + "', '" + content + "')";
						console.log(q2);
						connection.execute(q2, [], function (err, results) {

							if (err) {
								console.log('Error executing location query:', err);
								return;
							}

							//Insert mapping from newly added content to desired album
							var create_query = "INSERT INTO INCLUDES VALUES ";
							create_query = create_query + "(" + contentid + ", " + albumid + ")";
							console.log(create_query);
							connection.execute(create_query, [], function (err, results) {

								if (err) {
									console.log('Error executing location query:', err);
									return;
								}

								//console.log("EXECUTD LAST QUERY, will close now");
								connection.close();
							});

						});

					});
				}

			});

		});


		loadpage(req, res);


	} else {
		res.redirect('/login');
	}
});



module.exports = router;
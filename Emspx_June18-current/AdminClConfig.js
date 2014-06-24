/**
 * Message EmailAdmin API 
 .@description: Email Admin api  for managing email component.
 .@author: Subhra Ranjan Padhy
 .@email-id:SubhraRanjan.Padhy@techmahindra.com
 */

var express = require('express');
var http = require('http');
var path = require('path');
var ConfigAdminApp = express();
var crypto = require('crypto');
var Binary = require('mongodb').Binary;
var userColl = undefined;
var saltLengthBytes = 64;
var hashIterations = 10000;
var keyLengthBytes = 64;
var mongoConnection = require('mongodb').MongoClient;
var mongo   = require('mongodb');
var mail = require("nodemailer").mail;
var util = require('util');


function authenticateUser(name, password, callback)
{
	try
	{
		readUser(name, function(result) {
			if (result instanceof Error)
			{
				console(result.message);
				if (callback)
					callback(result);
			}
			else
			{
				if (result)
				{
						crypto.pbkdf2(password, result.salt.read(0, result.salt.length()), hashIterations, keyLengthBytes, function(err, key){
						if (err)
						{
							console.log(err.message);
							if (callback)
								callback(err);
						}
						else
						{
							var derivedKey = new Binary(key);
							if(derivedKey.value() === result.password.value())
							{
								result.message=true;
								callback(result);
							}else{
								result.message=false;
								callback(result);
							}

						}
					});
				}
				else
				{
					console.log("User Record Not Found");
					callback(result);
				}
			}
		});
	}
	catch (exc)
	{
		console.log(exc.message);
		if (callback)
			callback(exc);
	}
};


//152.48.2.245
//ComponentConfiguration
var db     = new mongo.Db('AdimUI', new mongo.Server("127.0.0.1", 27017), { safe : false });
//var db = new mongo.Db("AdminUI" , new mongo.Server("127.0.0.1", 27017), { safe : false });


var adminAPI=require("./componentAPIAddress");
var Client = require('node-rest-client').Client;
var client = new Client();
// Express Environment Setting
ConfigAdminApp.set('port', process.env.PORT || 80);
ConfigAdminApp.use(express.favicon());
ConfigAdminApp.use(express.logger('dev'));
ConfigAdminApp.use(express.json());
ConfigAdminApp.use(express.urlencoded());
ConfigAdminApp.use(express.methodOverride());


ConfigAdminApp.configure(function () {
    ConfigAdminApp.use(express.static(path.join(__dirname, 'public')));
	ConfigAdminApp.use(express.cookieParser('Authentication Tutorial '));	
	ConfigAdminApp.use(express.static(path.join(__dirname, 'views/healthcare')));
    ConfigAdminApp.use(express.session());
  //  ConfigAdminApp.engine('html', require('hogan-express'));
    ConfigAdminApp.engine('html', require('ejs').renderFile);
    ConfigAdminApp.set('view engine', 'html');

});






// Express Error Handling
if ('development' == ConfigAdminApp.get('env')) {
  ConfigAdminApp.use(express.errorHandler());
}

http.createServer(ConfigAdminApp).listen(ConfigAdminApp.get('port'), function(){
  console.log('Express server listening on port ' + ConfigAdminApp.get('port'));
});


ConfigAdminApp.get("/home", function (req, res) {
	res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
	res.render("home");
    
});

db.open(function (err) {
	if (err) {
		throw err;
	}
	db.createCollection('ComponentConfigurationCollection', function(err, collection) { 
		console.log("ComponentConfigurationCollection created/connected successfully");
	});
	
	// **************************** Emspx UI Development Changes Start ***********************************************



ConfigAdminApp.get("/" ,function (req, res) { 
    if (req.session.username!==undefined) 
	{	  
    	getUserDetails(req.session.username, function(err, userInfo){
			if(err){
				console.log("Problem occurred while getting user details");
			}
			else{		
				console.log("lastlogin :"+userInfo.lastlogin);
				if(userInfo.lastLogin == null){
					var splitStr = userInfo.currentLogin.split(" ");
					userInfo.LoginDateTime = splitStr[0]+" "+splitStr[1]+" "+splitStr[2]+" "+splitStr[3]+" "+splitStr[4];
				}else{
                    console.log( "Lastlogin is not null" );
					var splitStr = userInfo.lastLogin.split(" ");
					userInfo.LoginDateTime = splitStr[0]+" "+splitStr[1]+" "+splitStr[2]+" "+splitStr[3]+" "+splitStr[4];	
				}
			
				/*
				 * Get EnterPrise details
				 */
				if (req.session.role == 'ADMIN'){
				
					getSuperAdminDetails(userInfo.username, function(err, superUserDoc){
						if (err){
							console.log("Problem occurred while getting Enterprise Details");
						}else{
							var enterPriseDetails = {};
							enterPriseDetails.name = superUserDoc.companyname;
							enterPriseDetails.address = superUserDoc.address;
							enterPriseDetails.state = superUserDoc.state;
							enterPriseDetails.city = superUserDoc.city;
							enterPriseDetails.country = superUserDoc.country;
							enterPriseDetails.zipcode = superUserDoc.countrycode;
							enterPriseDetails.telephone = superUserDoc.telephone;						   
							console.log("EnterPrise Info : "+enterPriseDetails);
							getAllUsersUnderAdmin(userInfo.username, req.session.role,function(err, userslist){
								if(err){
									console.log("err"+err);
									console.log("Problem occurred while getting Users list under super user : "+ superUser);
								}else{
									console.log("UsersList : "+userslist);
									if(userslist.length>0)
									{
										getAllRecentWFDetails(userslist, req.session.role, function(err, recentWF){
											if (err){
												console.log("Problem occurred while getting Work-flow details");
											}else{			
												res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
												res.render('home',{userRole: req.session.role, username : req.session.username,userInfo : userInfo, domainDetails : enterPriseDetails, recentWF : recentWF});
											}										
										});
									}
									else
									{
										res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
										res.render('home',{userRole: req.session.role, username : req.session.username,userInfo : userInfo, domainDetails : enterPriseDetails, recentWF : []});
									}
								}
							});
						}
							
					});
				} else{
					getUserEnterpriseDetails(userInfo.username, function(err, enterPriseDoc){
						if (err){
							console.log("Problem occurred while getting Enterprise Details");
						}else{
						
							console.log('enterPriseDetails superUser name'+enterPriseDoc.organizationInfo.username);
							console.log('enterPriseDetails company name'+enterPriseDoc.organizationInfo.companyname);
							console.log('enterPriseDetails add'+enterPriseDoc.organizationInfo.address);
							console.log('enterPriseDetails city'+enterPriseDoc.organizationInfo.city);
							console.log('enterPriseDetails city'+enterPriseDoc.organizationInfo.telephone);
							var enterPriseDetails = {};
							enterPriseDetails.name = enterPriseDoc.organizationInfo.companyname;
							enterPriseDetails.address = enterPriseDoc.organizationInfo.address
							enterPriseDetails.state = enterPriseDoc.organizationInfo.state;
							enterPriseDetails.city = enterPriseDoc.organizationInfo.city
							enterPriseDetails.country = enterPriseDoc.organizationInfo.country;
							enterPriseDetails.zipcode = enterPriseDoc.organizationInfo.countrycode;
							enterPriseDetails.telephone = enterPriseDoc.organizationInfo.telephone;				   
							console.log("EnterPrise Info : "+enterPriseDetails);
						 if (req.session.role == 'NON-IT'){
								 getUserRecentWFDetails(req.session.username, function(err, recentWF){
										if (err){
											console.log("Problem occurred while getting Work-flow details");
										}else{
											res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
											res.render('home',{userRole: req.session.role, username : req.session.username,userInfo : userInfo, domainDetails : enterPriseDetails, recentWF : recentWF});
										}										
									});		
							 }
							else if(req.session.role == 'IT'){
								var superUser = enterPriseDoc.organizationInfo.username;
								getAllUsersUnderAdmin(req.session.username, req.session.role, function(err, userslist){
									if(err){
										console.log("err"+err);
										console.log("Problem occurred while getting Users list under super user : "+ superUser);
									}else{
										console.log("UsersList : "+userslist);
										getAllRecentWFDetails(userslist, req.session.role, function(err, recentWF){
											if (err){
												console.log("Problem occurred while getting Work-flow details");
											}else{		
												res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
												res.render('home',{userRole: req.session.role, username : req.session.username,userInfo : userInfo, domainDetails : enterPriseDetails, recentWF : recentWF});
											}										
										});
									}
								});								
							}	
						}
					});
				}
			}		
		});		
	}
	else{
		res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
		res.render('index',{information : ""});
		// res.send("<a href='/login'> Login</a>" + "<br>" + "<a href='/signup'> Sign Up</a>");					
	}
});




// ConfigAdminApp.get("/:viewname", function(req, res) {
        // res.render(req.params.viewname, {
            // username: req.session.username
        // });        
    // });




ConfigAdminApp.get("/businessworkflow", requiredAuthentication, function (req, res) {
    
    
	if (req.session.role=='IT') {
		res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        res.render('business-it',{username: req.session.username});
    }
	else if (req.session.role=='NON-IT') {
		res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        res.render('business-nonit-latest',{username: req.session.username});
    }

	
});


ConfigAdminApp.get("/failure", function (req, res) {
		res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
 	   	res.render('index',{information: "Authentication Failed"});
	  });
	  
	  

ConfigAdminApp.get("/login", function (req, res) {
	res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
	res.render('index',{information : ""});
});

ConfigAdminApp.post("/login", function (req, res) {

	res.header("Access-Control-Allow-Origin", "*");
	res.contentType('application/json');
	var resData={};

	authenticateUser(req.body.username, req.body.password, function (result2) {

		if (result2)
		{

			if (!(result2 instanceof Error))
			{
				if(result2.message){
					console.log('Results: User authenticated');

					req.session.regenerate(function () 
							{
						console.log('check '+result2.username);
						req.session.username = result2.username;
						req.session.role = result2.userrole;
						updateUserLoginOnLogin(req, res, function(result){
							console.log('check for login **'+result.message);

							res.redirect("/");
						});


							});
				}else{
					console.log("Authentication failed");	
					req.session.error = 'Authentication failed, please check your ' + ' username and password.';
					//res.send('authentication failed');

					resData.error=req.session.error;
					res.redirect("/failure");
				}
				
				
						
						
			}

			else
			{
				console.log("Authentication failed");	
				req.session.error = 'Authentication failed, please check your ' + ' username and password.';
				//res.send('authentication failed');

				resData.error=req.session.error;
				res.redirect("/failure");
			}

		}
		else
		{
			console.log("Authentication failed");	
			req.session.error = 'Authentication failed, please check your ' + ' username and password.';
			//res.send('authentication failed');

			resData.error=req.session.error;
			res.redirect("/failure");
		}
	});
})





function createUser(doc, callback)
{
	try
	{
		var registrationCollection= db.collection('usermanagementcollection');
		var resData={};
		var passWord=doc.password;	
		
		crypto.randomBytes(saltLengthBytes, function(err1, buf) {  //create the salt for the hash function
			if (err1)
			{
				console.log(err1.message);
				if (callback)
					callback(err1);
			}
			else
			{
				doc.salt = new Binary(buf);  //put salt result in a mongodb Binary object
				
				//Invoke hash function with salt object
				crypto.pbkdf2(doc.password, doc.salt.read(0, doc.salt.length()), hashIterations, keyLengthBytes, function(err2, key){ 
					if (err2)
					{
						console.log(err2.message);
						if (callback)
							callback(err2);
					}
					else
					{
						doc.password = new Binary(key);
						
						if (registrationCollection)
						{
							registrationCollection.insert(doc, function(err3, result) {  //insert user into DB
								if (err3)
								{
									console.log(err3.message);
									if (callback)
										callback(err3);
								}
								else
								{
							    var firstname = doc.fname;
								var lastname = doc.lname;
								var userName = doc.username;
								
								var Email = doc.email;
								console.log("******************Send Email Management Information****************************");           
								mail({
									from: "<admin@cisco.com>", 
									to: Email, 
									subject: "Your Username and Password has Created", 
									html: "Dear"+"  "+"<i>"+firstname+" "+lastname+"</i>"+"<br><br>"+
											"<i> Your Username  :</i>"+" "+ userName +"<br>"+
											"<i> Your Password  :</i>"+" "+ passWord +"<br><br>"+
											"<i> "+"<a href='http://localhost/login'>" +"Please Login here"+"</a>"+"</i>"+"<br><br>"+
											"<i> Thanks and Regards, </i>"+"<br>"+
											"<i> Cisco Admin</i>",
								});
                                    
                                    
								
								
								resData.message='success';
								callback(resData);
								}
							});
						}
						else
						{
							var err4 = new Error('Database not initialized');
							console.log(err4.message);
							callback(err4);
						}
					}
				});
			}
		});
	}
	catch (exc)
	{
		console.log(exc.message);
		if (callback)
			callback(exc);
	}
};


	db.createCollection('templatecollection', function(err, collection) { 
			console.log("templatecollection created/connected successfully");
		});
		
		ConfigAdminApp.post('/saveModifiedWF',function(req,res){
			console.log("******************Save Data****************************");
			var kitDetails=req.body;
			kitDetails.username=req.session.username;
			kitDetails.wfType="MWF";
			console.log("KitDetails: "+kitDetails.kitName);
			saveTemplate(kitDetails,function(resData){
				res.header("Access-Control-Allow-Origin", "*");
				res.contentType('application/json');
				console.log("after save data"+resData);
				res.send(resData);
				
			});
		});
		
		
				
		////saveModifiedWF1
		ConfigAdminApp.put('/saveModifiedWF1/:kitNm',function(req,res){
			var kitDetails=req.body;
			kitDetails.username=req.session.username;
			var kitNm= req.params.kitNm;
			kitDetails.wfType="MWF";
			kitDetails.kitName = kitDetails.kitName+'&&&&&&'+kitNm;
			console.log("KitDetails: "+kitDetails.kitName);
			saveTemplate1(kitDetails,function(resData){
				res.header("Access-Control-Allow-Origin", "*");
				res.contentType('application/json');
				console.log("after save data"+resData);
				res.send(resData);
				
			});
		});
		
	
		
		
		////SendforConfiguration
		ConfigAdminApp.put('/sendForConfiguration',function(req,res){
			var kitDetails=req.body;
			kitDetails.username=req.session.username;
			console.log("KitDetails: "+kitDetails.kitName);
			sendForConfiguration(kitDetails,function(resData){
				res.header("Access-Control-Allow-Origin", "*");
				res.contentType('application/json');
				console.log("after save data"+resData);
				res.send(resData);
				
			});
		});
		
		//Send For Approval
		ConfigAdminApp.post('/sendForApproval',function(req,res){
			var kitDetails=req.body;
			kitDetails.username=req.session.username;
			console.log("KitDetails: "+kitDetails.kitName);
			sendForApproval(kitDetails,function(resData){
				res.header("Access-Control-Allow-Origin", "*");
				res.contentType('application/json');
				console.log("after save data"+resData);
				res.send(resData);
				
			});
		});
		
		
		
		
		
		ConfigAdminApp.get('/retrieveKitNames',function(req,res){
		    console.log("retrieveKitNames method");
			fetchkitnames(function(resData) {
			    res.header("Access-Control-Allow-Origin", "*");
				res.contentType('application/json');
				console.log("after fetch kitname "+resData);
				res.send(resData);
		});
			
			});	
			
		/*---------------------------------------------------------------*/
		//retrieve MWFkitdetails(kitname, description & WF)
		ConfigAdminApp.get('/retrieveMWFKitDetails/:title',function(req,res){
			 var kitTitle = req.params.title;
			 console.log("kitTitle: "+kitTitle);
			 retrieveMWFKitDetails(kitTitle,function(resData){
			    res.header("Access-Control-Allow-Origin", "*");
				res.contentType('application/json');
				console.log("after save data"+resData);
				res.send(resData);
			 });

		});
			
		ConfigAdminApp.get('/retrieveDWFKitDetails/:title',function(req,res){
			 var kitTitle = req.params.title;
			 console.log("kitTitle: "+kitTitle);
			 retrieveDWFKitDetails(kitTitle,function(resData){
			    res.header("Access-Control-Allow-Origin", "*");
				res.contentType('application/json');
				console.log("after save data"+resData);
				res.send(resData);
			 });

		});	
			
	
		
		/*---------------------------------------------------------------*/
		//retrieve kitdetails(kitname, description & WF)
		ConfigAdminApp.get('/retrieveKitDetails/:title',function(req,res){
			 var kitTitle = req.params.title;
			 console.log("kitTitle: "+kitTitle);
			 retrieveKitDetails(kitTitle,function(resData){
			    res.header("Access-Control-Allow-Origin", "*");
				res.contentType('application/json');
				console.log("after save data"+resData);
				res.send(resData);
			 });

		});
		
		
		
		//just retrieves the kit names from the default solution kit
		ConfigAdminApp.get('/retrieveDefaultWFKitNames',function(req,res){
		    console.log("Retrieve KitNames from the default solution kit");
		    fetchDefaultkitnames(function(resData) {
			    res.header("Access-Control-Allow-Origin", "*");
				res.contentType('application/json');
				console.log("After Retrieval: "+resData);
				res.send(resData);
		    });
		});	
		
		ConfigAdminApp.put('/saveDWFDetailsIntoMSK',function(req,res){
			var kitDetails=req.body;
			kitDetails.username = req.session.username;
			kitDetails.wfType = "DWF";
			console.log("KitName: 1111111111111111111"+kitDetails.kitName);
			saveDWFDetailsIntoMSK(kitDetails,function(resData){
				res.header("Access-Control-Allow-Origin", "*");
				res.contentType('application/json');
				console.log("after save data"+resData);
				res.send(resData);
				
			});
		});
		
		//retrieves the kit names from the modified solution kit
		ConfigAdminApp.get('/retrieveModifiedWFKitNames/:wfType',function(req,res){
		
		console.log('retrieveModifiedWFKitNames/MWF');
			//var username = req.params.username;
			var kitSearch = {};
			kitSearch.username = req.session.username;
			kitSearch.wfType = req.params.wfType;
		    console.log("Retrieve KitNames from the modified solution kit for a given user");
		    fetchModifiedkitnames(kitSearch, function(resData) {
			    res.header("Access-Control-Allow-Origin", "*");
				res.contentType('application/json');
				console.log("After Retrieval: "+resData);
				res.send(resData);
		    });
		});	
		
		
		//retrieves the kit names from the modified solution kit with Pending Status
		ConfigAdminApp.get('/retrieveModifiedWFKitNamesWithStatus/:status',function(req,res){
		console.log('status is fdsdfggs');
			//var username = req.params.username;
			var kitSearch = {};
			//kitSearch.username = req.session.username;
			//kitSearch.wfType = req.params.wfType;
			var status = req.params.status;
			getAllUsersUnderAdmin(req.session.username, req.session.role,function(err, userslist){
				if(err){
					console.log("err"+err);
					console.log("Problem occurred while getting Users list under super user : "+ superUser);
				}else{
					console.log("UsersList : "+userslist);
				    console.log("Retrieve KitNames from the modified solution kit for kitname status is pending");
				    fetchModifiedkitnamesWithStatus(status, userslist, function(resData) {
					    res.header("Access-Control-Allow-Origin", "*");
						res.contentType('application/json');
						console.log("After Retrieval: "+resData);
						res.send(resData);
				    });
				}
			});
		});
		
		
		
	
		
		ConfigAdminApp.get('/retrieveComponentList',function(req,res){
		
		    console.log("Retrieve Component List");
		    fetchComponentList(function(resData) {
			    res.header("Access-Control-Allow-Origin", "*");
				res.contentType('application/json');
				console.log("After Retrieval: "+resData);
				res.send(resData);
		    });

		});	
		
		ConfigAdminApp.post('/saveWFCopy',function(req,res){
			console.log("******************Save WF Data****************************");
			var kitDetails=req.body;
			kitDetails.username=req.session.username;
			saveWFCopy(kitDetails,function(resData){
				res.header("Access-Control-Allow-Origin", "*");
				res.contentType('application/json');
				console.log("after save data"+resData);
				res.send(resData);
				
			});
			});
			
			
			/*User Information */
			ConfigAdminApp.get('/retrieveuserInfo',function(req,res){
		    console.log("retrieveuserInfo method");
			fetchUserInfo(function(resData) {
			    res.header("Access-Control-Allow-Origin", "*");
				res.contentType('application/json');
				console.log("after fetch user "+resData);
				res.send(resData);
			});
		});
		
		
		
		 ConfigAdminApp.get('/sample', function (req, res){
		
			 fetchTestExample(function(resData){
				res.header("Access-Control-Allow-Origin", "*");
				 res.contentType('application/json');
				console.log("after save data"+resData);
				 res.send(resData);
				
			});
			 });
			
			 
			 
			 ConfigAdminApp.get('/business-it', function (req, res){
			 	res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
			 	res.render("business-it",{username: req.session.username});
			  });
			  
		
			ConfigAdminApp.get('/drawing', function (req, res){
				res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
				res.render("drawing");
				
			});
		
			
			
			
			/*Registered User Information */
			ConfigAdminApp.get('/registration',function(req,res){
				res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
				res.render('registration',{infor:""});
			});
			
			/*User Name exist or not */	
			ConfigAdminApp.post('/usernameexist',function(req,res){
				var resultJson={};
				console.log("******************Check Username Exist****************************");
				var RegisterDetails=req.body;
				console.log('test'+RegisterDetails);
			
				db.createCollection('usermanagementcollection', function(err, collection) { 
					collection.count({username:RegisterDetails.username}, function(error, count){
						if (count === 0) {
							console.log("NNNNNN"+count);
							res.header("Access-Control-Allow-Origin", "*");
							res.contentType('application/json');
						   resultJson.status='pass';
						   res.send(resultJson);
						   
						  }else{
						   resultJson.status='fail';
						   res.send(resultJson);
                        }
					});
				});
			});
			
						
				ConfigAdminApp.post('/registration',function(req,res){
					console.log("******************Save Registered Information****************************");
					var RegisterDetails=req.body;
					console.log('test'+RegisterDetails);
					RegisterDetails.userrole='ADMIN';
					console.log('reconsidered user role is'+RegisterDetails.userrole);
					
					db.createCollection('usermanagementcollection', function(err, collection) { 
						collection.count({username:RegisterDetails.username}, function(error, count){
							console.log("NNNNNN"+count);
							createUser(RegisterDetails,function(resData){
								console.log("RegisterD"+RegisterDetails);
								res.header("Access-Control-Allow-Origin", "*");
								res.contentType('application/json');
								console.log("after save data"+resData);
								//res.render('registration',{information: "The Username "});
							
								if(resData.message='success') {
									res.redirect("/login");
								}
								
							});
						});
					});
				});
				
				//Component Library Integration Part
				ConfigAdminApp.get("/componentconfiguration", function(req, res) {
					 ConfigAdminApp.use(express.static(path.join(__dirname, 'views/healthcare')));
				     ConfigAdminApp.use(express.static(path.join(__dirname, 'views')));
                     ConfigAdminApp.use(express.static(path.join(__dirname, 'public')));
                     res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
                     res.render('component_configuration', { username : req.session.username });
				});
				
				
				
			
				 //IT User Workflow configuration 
				  ConfigAdminApp.post('/autoCheckInNotification/:kitName',function(req,res){
				  var resultJson={};
				  console.log("******************AutoCheckInNotification****************************");
					
					var kitName= req.params.kitName;
								
				    var componentName='AutoCheckInNotification';	
					saveBusinessFlowConfiguration(kitName,componentName,req.body,function(resData){
					res.header("Access-Control-Allow-Origin", "*");
					res.contentType('application/json');
					if(resData.message='success'){
					console.log(resData.message);
					resultJson.status='success';
					}
					else
					resultJson.status='failure';
					
								
					res.send(resultJson);
					
					// if(resData.message=='success')
					     // res.redirect('/business-it');
					 });
				});
				
				
				
					
				
				
				
				
					//IT User Workflow configuration
				  ConfigAdminApp.post('/personalizedWelcome/:kitName',function(req,res){
				  var resultJson={};
				  console.log("******************PersonalizedWelcome****************************");
					
					var kitName= req.params.kitName;
								
				    var componentName='PersonalizedWelcome';		  
				    saveBusinessFlowConfiguration(kitName,componentName,req.body,function(resData){
					res.header("Access-Control-Allow-Origin", "*");
					res.contentType('application/json');
					console.log("after save data"+resData);
				    
					if(resData.message='success'){
					console.log(resData.message);
					resultJson.status='success';
					}
					else
					resultJson.status='failure';
					
								
					res.send(resultJson);
					});
				});
				
		
				
					//IT User Workflow configuration
				  ConfigAdminApp.post('/patientSchedularSystem/:kitName',function(req,res){
				  var resultJson={};
				  console.log("******************PatientSchedularSystem****************************");
					
					var kitName= req.params.kitName;
								
				    var componentName='PatientSchedularSystem';		  
				    saveBusinessFlowConfiguration(kitName,componentName,req.body,function(resData){
					res.header("Access-Control-Allow-Origin", "*");
					res.contentType('application/json');
					console.log("after save data"+resData);
					console.log(resData.message);
				    
				    if(resData.message='success'){
					console.log(resData.message);
					resultJson.status='success';
					}
					else
					resultJson.status='failure';
					
								
					res.send(resultJson);
					});
				});
				 
				
			
				
				
				
				  //IT User Workflow configuration
				  ConfigAdminApp.post('/patientArrivalNotificationToDoctor/:kitName',function(req,res){
				  console.log("******************patientArrivalNotificationToDoctor****************************");
					var resultJson={};
					var kitName= req.params.kitName;
								
				    var componentName='PatientArrivalNotificationToDoctor';		  
				    saveBusinessFlowConfiguration(kitName,componentName,req.body,function(resData){
					res.header("Access-Control-Allow-Origin", "*");
					res.contentType('application/json');
					console.log("after save data"+resData);
					if(resData.message='success'){
						console.log(resData.message);
						resultJson.status='success';
					}
					else
						resultJson.status='failure';
					
								
					res.send(resultJson);
					});
				});
				 
				
		
			
			
			
			
			
			
				
						  //IT User Workflow configuration
				  ConfigAdminApp.post('/appointmentAndWaitTimeNotification/:kitName',function(req,res){
				  var resultJson={};
				  console.log("******************AppointmentAndWaitTimeNotification****************************");
					
					var kitName= req.params.kitName;
								
				    var componentName='AppointmentAndWaitTimeNotification';		  
				    saveBusinessFlowConfiguration(kitName,componentName,req.body,function(resData){
					res.header("Access-Control-Allow-Origin", "*");
					res.contentType('application/json');
					console.log("after save data"+resData);
						console.log(resData.message);
				    if(resData.message='success'){
						console.log(resData.message);
						resultJson.status='success';
					}
					else
						resultJson.status='failure';
					
								
					res.send(resultJson);
					});
				});
				
				
						  //IT User Workflow configuration
				  ConfigAdminApp.post('/patientArrivalNotificationToDoctor/:kitName',function(req,res){
				  var resultJson={};
				  console.log("******************patientArrivalNotificationToDoctor****************************");
					
					var kitName= req.params.kitName;
								
				    var componentName='PatientArrivalNotificationToDoctor';		  
				    saveBusinessFlowConfiguration(kitName,componentName,req.body,function(resData){
					res.header("Access-Control-Allow-Origin", "*");
					res.contentType('application/json');
					console.log("after save data"+resData);
				    if(resData.message='success'){
						console.log(resData.message);
						resultJson.status='success';
					}
					else
						resultJson.status='failure';
					
								
					res.send(resultJson);
					});
				});
				
				
				
						  //IT User Workflow configuration
				  ConfigAdminApp.post('/pharmacySystem/:kitName',function(req,res){
				  var resultJson={};
				  console.log("******************PharmacySystem****************************");
					
					var kitName= req.params.kitName;
								
				    var componentName='PharmacySystem';		  
				    saveBusinessFlowConfiguration(kitName,componentName,req.body,function(resData){
					res.header("Access-Control-Allow-Origin", "*");
					res.contentType('application/json');
					console.log("after save data"+resData);
			       	    if(resData.message='success'){
						console.log(resData.message);
						resultJson.status='success';
					}
					else
						resultJson.status='failure';
					
								
					res.send(resultJson);
					});
				});
				
				
				//IT User Workflow configuration
				  ConfigAdminApp.post('/patientArrivalNotificationToPharmacist/:kitName',function(req,res){
				   var resultJson={};
				  console.log("******************PatientArrivalNotificationToPharmacist****************************");
					
					var kitName= req.params.kitName;
								
				    var componentName='PatientArrivalNotificationToPharmacist';		  
				    saveBusinessFlowConfiguration(kitName,componentName,req.body,function(resData){
					res.header("Access-Control-Allow-Origin", "*");
					res.contentType('application/json');
					console.log("after save data"+resData);
					if(resData.message='success'){
						console.log(resData.message);
						resultJson.status='success';
					}
					else
						resultJson.status='failure';
					
								
					res.send(resultJson);
					});
				});
				
				
						//IT User Workflow configuration
				  ConfigAdminApp.post('/prescriptionAndStatusNotification/:kitName',function(req,res){
				   var resultJson={};
				  console.log("******************PrescriptionAndStatusNotification****************************");
					
					var kitName= req.params.kitName;
								
				    var componentName='PrescriptionAndStatusNotification';		  
				    saveBusinessFlowConfiguration(kitName,componentName,req.body,function(resData){
					res.header("Access-Control-Allow-Origin", "*");
					res.contentType('application/json');
					if(resData.message='success'){
					console.log(resData.message);
					resultJson.status='success';
					}
					else
						resultJson.status='failure';
					
								
					res.send(resultJson);
					});
				
				});
				
				  ConfigAdminApp.post('/addReview', requiredAuthentication, function(req, res) { 
					  	var result={};					  	
						console.log("Req------"+req.body);						
						console.log("Req------"+JSON.stringify(req.body));
						var userType = req.body.userType;
						var message = "WorkFlow Name :"+req.body.workFlowName+"<br />"+
						"Status :"+req.body.status+"<br />"+
						"Comments :"+req.body.message;	
						updateKitStatus(req.body.workFlowName, req.body.status, function(updateResult){
							console.log("updateResult.status :"+updateResult.status);
							if(updateResult.status==="success"){
								getDetailsByKitName(req.body.workFlowName, function(kitDetails){
									if (!err){
										console.log("kitDetails"+kitDetails);
										if(kitDetails != []){
											var user = "";
											console.log("userType == "+userType);
											if(userType=="Business User"){
												console.log("kitDetails"+kitDetails._id);
												console.log("HEEEEEEEEEEEREEEEEEEE"+kitDetails.username);
												user = kitDetails.username;
												
											}else if(userType =="IT Admin"){
												console.log("HEEEEEEEEEEEREEEEEEEE"+kitDetails.configuredBy);
												user = kitDetails.configuredBy;
											}
											console.log('in send mail kiiiiiiiiii'+user);
											readUser(user, function(userDoc){
												if(userDoc){
													console.log("$$$$$$$$$$ Email ID"+userDoc.email);
													mailTo = userDoc.email;
													console.log('in send mail kiiiiiiiiii55555555'+user);
													sendMailTo(user, mailTo, message, function(err, mailResult){
														console.log("Callback from sendMailTo"+mailResult);
														if( mailResult == "Success"){	
															result.message="success";													
														}else if( mailResult == "Failure"){
															result.message="Failure";													
														}
														console.log("Sending the response back as :"+result.message);
														res.send(result);
													});
												}else{
													console.log("Problem occured while getting EmailID");
													result.message="Failure";
													res.send(result);
												}
											});
											
										}else{									
											console.log("Kit details Not Found");									
										}
									}							
								});
								
							}else{
								console.log("Problem occurred while updating kit staus"+JSON.stringify(err));
							}							
						});
							
						
				  });
				  
				  
				  
		//retrieve kitdetails(kitname, description & WF)
		ConfigAdminApp.get('/getDetailsByKitName/:title',function(req,res){
			 var kitTitle = req.params.title;
			 console.log("kitTitle: "+kitTitle);
			 getDetailsByKitName(kitTitle,function(resData){
			    res.header("Access-Control-Allow-Origin", "*");
				res.contentType('application/json');
				console.log("after save data"+resData);
				res.send(resData);
			 });

		});
				  
			
				  
				  
	
	           // Registration Form For Super Admin & User Creation
			db.createCollection('usermanagementcollection', function(err, collection) { 
				console.log("usermanagementcollection created/connected successfully");
			});
			
			// User Management
			ConfigAdminApp.get('/usermanagement',requiredAuthentication,function(req,res){
				res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
			    res.render('usermanagement',{username: req.session.username,inform:""});
			  });
			
			ConfigAdminApp.post('/usermanagement',requiredAuthentication, function(req,res){
				console.log("******************Save User Management Information****************************");
				console.log('created user is'+req.session.username);
				var UserDetails=req.body;
				UserDetails.createdBy=req.session.username;
				var emailID = UserDetails.email;
				console.log(emailID);
				/*userDetailsJson.noofemp = $('#noofemp').val();*/
				//var companyName = req.body.companyName;
				//console.log(companyName);
				saveuserManagementInfo(UserDetails,function(resData){
					res.header("Access-Control-Allow-Origin", "*");
					res.contentType('application/json');
					console.log("after save data"+resData);
					//res.send(resData);
					//res.render('registration',{information : "The Username already exist"});
					//res.render('usermanagement',{username: req.session.username,inform: "The Username sucessfully Created"});
                    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
					res.redirect("/usermanagement");
					
				});
			});
			
			
			
			
			/*Registered User Information */
			   ConfigAdminApp.get('/usermanagementInfo',function(req,res){
				console.log("usermanagementInfo method");
				var sessionUserName=req.session.username;
				console.log('session user'+req.session.username);
				fetchUserManagementInfo(sessionUserName,function(resData) {
				 res.header("Access-Control-Allow-Origin", "*");
				 res.contentType('application/json');
				 console.log("after fetch user "+resData);
				 res.send(resData);
				});
			});
			
			// Delete User Information
			ConfigAdminApp.get('/delete_usermanagement/:id',function(req,res){
				console.log("******************Delete User Management Information****************************");
				var objectId = req.params.id;
					deleteuserManagementInfo(objectId,function(resData){
						res.header("Access-Control-Allow-Origin", "*");
						res.contentType('application/json');
						console.log("after Delete data"+resData);
						if(resData.message='success')
							res.redirect("/usermanagement");
			
						});
			
			});
			
			
			// Update User Information
			ConfigAdminApp.post('/update_usermanagement/:id',function(req,res){
			    var sessionUser=req.session.username;
				var RegisterDetails=req.body;
				RegisterDetails.createdBy=sessionUser;
				console.log("UPDATE"+RegisterDetails.firstname);
				console.log("******************Update User Management Information****************************");
				var objectId = req.params.id;
				update_userinformation(objectId,RegisterDetails,function(resData){
						res.header("Access-Control-Allow-Origin", "*");
						res.contentType('application/json');
						console.log("after Edit data"+resData);
						console.log(resData.message);
						//res.send(resData);
						/*if(resData.message='success')
							res.redirect("/usermanagement");*/
						//});
					});
			});
			
			
			// Edit User Information
			ConfigAdminApp.get('/edit_usermanagement/:id',function(req,res){
				console.log("******************Edit User Management Information****************************");
				var objectId = req.params.id;
					edituserManagementInfo(objectId,function(resData){
						res.header("Access-Control-Allow-Origin", "*");
						res.contentType('application/json');
						console.log("after Edit data"+resData);
						res.send(resData);
						/*if(resData.message='success')
							res.redirect("/usermanagement");
						});*/
					});
			});
			
			
			
			ConfigAdminApp.get("/review", requiredAuthentication, function(req, res) {
				res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
				res.render("review",{username: req.session.username});
			});
			
	
	
			ConfigAdminApp.get("/status", requiredAuthentication, function(req, res) {
				if(req.session.role=='NON-IT'){
					getUserRecentWFDetails(req.session.username, function(err, recentWF){
						if (err){
							console.log("Problem occurred while getting Work-flow details");
						}else{
                            res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
							res.render("status",{username: req.session.username, userRole: req.session.role, recentWF : recentWF});
						}										
					});
				}
				else{
					getAllUsersUnderAdmin(req.session.username, req.session.role,function(err, userslist){
						if(err){
							console.log("err"+err);
							console.log("Problem occurred while getting Users list under super user : "+ superUser);
						}else{
							console.log("UsersList : "+userslist);
							getAllRecentWFDetails(userslist, req.session.role, function(err, recentWF){
								if (err){
									console.log("Problem occurred while getting Work-flow details");
								}else{
                                    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
									res.render("status",{username: req.session.username, userRole: req.session.role, recentWF : recentWF});						
								}										
							});
						}
					});
				}
				
			});
			

	
	
	//**************************************Emspx UI Development Changes End ****************************************
	

	
	/* Admin API for Registering a new Email Notification */
	ConfigAdminApp.post('/addComponentConfiguration', function(req,res){
		console.log("******************Add Component Config****************************");
		componentConfigId=req.body.componentConfigId;
		componetConfig=req.body.componetConfig;
		componentName=req.body.componentName;
		componentConfigAPI=req.body.componentConfigAPI;
		console.log(componentConfigId);
		console.log(componetConfig);
		console.log(componentConfigAPI);
		addComponentConfiguration(componentConfigId,componentName,componentConfigAPI,componetConfig,function(resMsg){
			console.log(resMsg);
			res.header("Access-Control-Allow-Origin", "*");
			res.contentType('application/json');
			res.send(resMsg);
		});
	});
	ConfigAdminApp.post('/updateComponentConfiguration',function(req,res){
		console.log("******************Update Component Configuration****************************");
		componentConfigId=req.body.componentConfigId;
		componetConfig=req.body.componetConfig; 		
		updateComponentConfiguration(componentConfigId,componetConfig,function(resMsg){
			console.log(resMsg);
			res.header("Access-Control-Allow-Origin", "*");
			res.contentType('application/json');
			res.send(resMsg);
		});
	});
	ConfigAdminApp.post('/deleteComponentConfiguration',function(req,res){
		console.log("******************Delete Component Configuration****************************");
		componentConfigId=req.body.componentConfigId; 		
		deleteComponentConfiguration(componentConfigId,function(resMsg){
			console.log(resMsg);
			res.header("Access-Control-Allow-Origin", "*");
			res.contentType('application/json');
			res.send(resMsg);
		});
	});
	ConfigAdminApp.get('/getComponentConfiguration',function(req,res){
		console.log("******************Get Component Config****************************");
		componentName=req.query.componentName;
		console.log("***************JSON STRING**********************");
		console.log(componentName);  		
		getComponentConfiguration(componentName,function(resMsg){
			console.log(resMsg);
			res.header("Access-Control-Allow-Origin", "*");
			res.contentType('application/json');
			res.send(resMsg);
		});
	});		

	
	ConfigAdminApp.post('/submitComponentConfiguration',function(req,res){
		console.log("******************Submit Component Config****************************");		
		submitComponentConfiguration(function(resMsg){
			console.log(resMsg);
			res.header("Access-Control-Allow-Origin", "*");
			res.contentType('application/json');
			res.send(resMsg);
		});
	});		
	
	
		
});

function addComponentConfiguration(componentConfigId,componentName,componentConfigAPI,componetConfig,callback){
	resMsg={};
	console.log("componentConfigJson_Inside If::"+componetConfig);
	db.collection('Kit_1001_clConfig',function(err,collection){
		collection.insert({componentConfigId:componentConfigId,componentName:componentName,componentConfigAPI:componentConfigAPI,componetConfig:componetConfig},function(err,col){
			if(!err){

				resMsg.statusCode=200;
				resMsg.message="Component configuration added Successfully";       
				console.log(resMsg);
				callback(resMsg);                                                                                                            
			}
			  else{
				//resData.statusCode=700;
				resMsg.message="Error in inserting Component Configuration";
				callback(resMsg); 
			}
        });
    });     
}


function updateComponentConfiguration(componentConfigId,componetConfig,callback){
	var resMsg={};

	var componentIdValid;
	checkComponentId(componentConfigId,function(checkComponetId){
		console.log("Component Config Id Exists:"+checkComponetId);
		componentIdValid=checkComponetId;
		if(componentIdValid==1){
			console.log("updateComponentConfiguration inside if");
			db.collection('Kit_1001_clConfig',function(err,collection){
				collection.update({componentConfigId:componentConfigId},{$set:{componetConfig:componetConfig}},function(err,doc){
					console.log("Component Configuration Updated successfully");
					console.log(doc);
					resMsg.APIStatusCode=200;
					resMsg.componentConfigId=componentConfigId;
					resMsg.Message="Component Configured Successfully";
					console.log(resMsg);
					callback(resMsg);					
				});
			});
		}
		else{
			console.log("updateComponentConfiguration inside else");
			resMsg.APIStatusCode=500;
			resMsg.componentConfigId=componentConfigId;
			resMsg.Message="No Such ComponentConfig ID Present";
			console.log(resMsg);
			callback(resMsg);			
		}		
	});	

}


function deleteComponentConfiguration(componentConfigId,callback){
	var resMsg={};
	var componentIdValid;
	checkComponentId(componentConfigId,function(checkComponetId){
		console.log("Component Config Id Exists:"+checkComponetId);
		componentIdValid=checkComponetId;
		if(componentIdValid==1){
			console.log("updateComponentConfiguration inside if");
			db.collection('Kit_1001_clConfig',function(err,collection){
				collection.remove({componentConfigId:componentConfigId},function(err,doc){
					console.log("Component Deleted successfully");
					console.log(doc);
					resMsg.APIStatusCode=200;
					resMsg.componentConfigId=componentConfigId;
					resMsg.Message="Component Configuration Deleted Successfully";
					console.log(resMsg);
					callback(resMsg);					
				});
			});
		}
		else{
			console.log("updateComponentConfiguration inside else");
			resMsg.APIStatusCode=500;
			resMsg.componentConfigId=componentConfigId;
			resMsg.Message="No Such ComponentConfig ID Present";
			console.log(resMsg);
			callback(resMsg);			
		}		
	});	

}



function getComponentConfiguration(componentName,callback){
	var resMsg={};
	var componentNameValid;
	var jsoncount=1;
	checkComponentName(componentName,function(checkComponentName){
		console.log("Component Config Id Exists:"+checkComponentName);
		componentNameValid=checkComponentName;
		if(componentNameValid==1){
			console.log("getComponentConfiguration Exist_Inside If");
			db.collection('Kit_1001_clConfig',function(err,collection){
				collection.find({'componentName':componentName}).toArray(function(error, results){
					if(!err){
						if(results.length>0){
							console.log("User Data From MongoDB");
							console.log("Number of Records");
							
							console.log(results.length);
							console.log(results);							
							resMsg.APIStatusCode=200;
							resMsg.componentName=componentName;
							resMsg.jsonContent=results;
							//results.forEach(function(element){
							//var jsonKey="componetConfig"+jsoncount;
							//resMsg[jsonKey]=element.componetConfig;
							//++jsoncount;
							//});
							//resMsg.componetConfig=results[0].componetConfig;						
							callback(resMsg);	
						}
						else{
							resMsg.APIStatusCode=500;
							resMsg.componentName=componentName;
							resMsg.message="No Such Record Present";
							callback(resMsg);
						}
					}
					else{
						resMsg.APIStatusCode=500;
						resMsg.componentName=componentName;
						resMsg.message="Error in DB Retrieval";
						callback(resMsg);
					}
				});
			});

		}
		else{
			resMsg.APIStatusCode=505;
			resMsg.componentName=componentName;
			resMsg.message="No Such Component Name present";
			callback(resMsg);
		}
	});		
}

function checkComponentId(componentConfigId,callback){
	var checkComponetId;
	console.log("Component ID:"+componentConfigId);
	db.collection('Kit_1001_clConfig',function(err,collection){
		collection.find({componentConfigId:componentConfigId}).count(function(err,doc){
			console.log("checkComponent_total document:"+doc);
			if(doc>=1){
				console.log("checkComponent_Inside If");
				checkComponetId=1;
				callback(checkComponetId);				
			}
			else{
				console.log("checkComponent_Inside Else");
				checkComponetId=0;
				callback(checkComponetId);				
			}
		});
	});
}

function checkComponentName(componentName,callback){
	var checkComponentName;
	console.log("Component Name:"+componentName);
	db.collection('Kit_1001_clConfig',function(err,collection){
		collection.find({componentName:componentName}).count(function(err,doc){
			console.log("checkComponent_total document:"+doc);
			if(doc>=1){
				console.log("checkComponent_Inside If");
				checkComponentName=1;
				callback(checkComponentName);				
			}
			else{
				console.log("checkComponent_Inside Else");
				checkComponentName=0;
				callback(checkComponentName);				
			}
		});
	});
}


function submitComponentConfiguration(callback){
	console.log("Inside Submit Component Configuration function");
	var resMessage=new Array();
	var count=0;
	db.collection('Kit_1001_clConfig',function(err,collection){
		collection.find({},{componentConfigAPI:1,componetConfig:1,_id:0}).toArray(function(error, results){
			if(!err){
				if(results.length>0){
					console.log("submitComponentConfiguration_Inside If");
					console.log("User Data From MongoDB");
					console.log("Number of Records");
					console.log(results.length);
					console.log(results);
					console.log("*****************************************************************************");					
					results.forEach(function(element){
					
						//var jsonKey="componetConfig"+jsoncount;
						console.log(element.componentConfigAPI);
						console.log(element.componetConfig);
						executeAdminAPI(element.componentConfigAPI,element.componetConfig,function(message){
						resMessage.push(message);
						console.log(resMessage);
						
						});
							
					});				
								
						callback(resMessage);		
				}
				else{
					console.log("submitComponentConfiguration Else");
					console.log("User Data From MongoDB");
					console.log("Number of Records");
					console.log(results.length);					
					callback("No Such Record Present!!!");				
				}
			}
			else{
				console.log("DB Error");
			}
			
		});
	});
}

//*******************************************Emspx Reusable Function Start****************************************





function readUser(name, callback)
{
	try
	{
		var userColl = db.collection('usermanagementcollection');
		if (userColl)
		{

			userColl.findOne({'username' : name}, function(err, result) {
				if (!err)
				{
					console.log("User Record"+JSON.stringify(result));
					callback(result);
				}
			});
		}
		else
		{
			var err = new Error('Database not initialized');
			console.log(err.message);
			callback(err);
		}
	}
	catch (exc)
	{
		console.log(exc.message);
		if (callback)
			callback(exc);
	}
};
	

  

	function saveuserManagementInfo(UserDetails,callback){
	
	var passWord=UserDetails.password;
	console.log('UserDetails.created by'+UserDetails.createdBy);
	var userColl= db.collection('usermanagementcollection');
	
		console.log(UserDetails);
			var resData={};

		    	try
				{
			
			
		crypto.randomBytes(saltLengthBytes, function(err1, buf) {  //create the salt for the hash function
			if (err1)
			{
				console.log(err1.message);
				if (callback)
					callback(err1);
			}
			else
			{
				UserDetails.salt = new Binary(buf);  //put salt result in a mongodb Binary object
				
				//Invoke hash function with salt object
				crypto.pbkdf2(UserDetails.password, UserDetails.salt.read(0, UserDetails.salt.length()), hashIterations, keyLengthBytes, function(err2, key){ 
					if (err2)
					{
						console.log(err2.message);
						if (callback)
							callback(err2);
					}
					else
					{
						UserDetails.password = new Binary(key);
						
						if (userColl)
						{
							userColl.insert(UserDetails, function(err3, result) {  //insert user into DB
								if (err3)
								{
									console.log(err3.message);
									if (callback)
										callback(err3);
								}
								else
								{
											var firstname = UserDetails.firstname;
                                            var lastname = UserDetails.lastname;
                                            var userName = UserDetails.username;
                                            
                                            var Email = UserDetails.email;
                                            console.log("******************Send Email Management Information****************************");           
                                            mail({
                                                from: "<admin@cisco.com>", 
                                                to: Email, 
                                                subject: "Your Username and Password has Created", 
                                                html: "Dear"+"  "+"<i>"+firstname+" "+lastname+"</i>"+"<br><br>"+
                                                        "<i> Your Username  :</i>"+" "+ userName +"<br>"+
                                                        "<i> Your Password  :</i>"+" "+ passWord +"<br><br>"+
                                                        "<i> "+"<a href='http://localhost/login'>" +"Please Login here"+"</a>"+"</i>"+"<br><br>"+
                                                        "<i> Thanks and Regards, </i>"+"<br>"+
                                                        "<i> Cisco Admin</i>",
                                            });
											
											resData.message='success';
											callback(resData);
							    }
							});
						}
						else
						{
							var err4 = new Error('Database not initialized');
							console.log(err4.message);
							callback(err4);
						}
					}
				});
			}
		});
	}
	catch (exc)
	{
		console.log(exc.message);
		if (callback)
			callback(exc);
	}
}
			
	function sendMailTo(user, sendTo, message, callback){
		console.log("******************Send Email Management Information****************************");   		
        try{
        	mail({
                from: "admin@cisco.com", 
                to: sendTo, 
                subject: "Admin Review", 
                html: "Dear "+user+",<br /><br /><b><i>"+message+"</i></b>"+"<br><br>"+
                        "<i> Thanks and Regards, </i>"+"<br>"+
                        "<i> Cisco Admin</i>",
            });
        	callback([], "Success");
        }catch (exc)
    	{
    		console.log(exc.message);
    		if (callback)
    			callback(exc.message, []);
    	}
        
		
        
	}
	
	
	// Delete User Information 
	function deleteuserManagementInfo(id,callback){
		//console.log("YYYYYYY"+id);
			var resData={};
			db.collection('usermanagementcollection',function(err,collection){
				collection.remove({_id : new mongo.ObjectID(id)},function(err,rows){
					//console.log("inside removeddd call back");
		           	resData.message="success";
						//resData.companyname=RegisterDetails.companyname;
						callback(resData);
				});
			});
	}
	
	// Edit User Information 
	function edituserManagementInfo(id,callback){
		console.log("YYYYYYY"+id);
			var resData={};
			db.collection('usermanagementcollection',function(err,collection){
				//collection.findOne({_id : new mongo.ObjectID(id)},function(err,rows){
				collection.findOne({_id : new mongo.ObjectID(id)},function(err,rows){
					console.log("test"+rows);
					console.log("inside removeddd call back");
		           	resData.message="success";
		           	resData.data=rows;
		         	//resData(rows.firstname);
						callback(resData);
						
				});
			});
	}
	
	// Update User Information 
	
	 function update_userinformation(id,data,callback){
        var beforeEncryptPwd=data.password;
	try
	{
	     db.collection('usermanagementcollection',function(err,collection){
		crypto.randomBytes(saltLengthBytes, function(err1, buf) {  //create the salt for the hash function
			if (err1)
			{
				console.log(err1.message);
				if (callback)
					callback(err1);
			}
			else
			{
				data.salt = new Binary(buf);  //put salt result in a mongodb Binary object
				
				//Invoke hash function with salt object
				crypto.pbkdf2(data.password, data.salt.read(0, data.salt.length()), hashIterations, keyLengthBytes, function(err2, key){ 
					if (err2)
					{
						console.log(err2.message);
						if (callback)
							callback(err2);
					}
					else
					{
						data.password = new Binary(key);
						
						  if (collection)
						   {
							collection.update({'_id' : new mongo.ObjectID(id)},data,function(err,col){
								if(!err)
								{
									var resData={};
									var firstname = data.firstname;
									var lastname = data.lastname;
									var userName = data.username;
									var passWord = beforeEncryptPwd;
									var Email = data.email;
									
									
									console.log("******************Send Email Management Information****************************");           
									mail({
										from: "<admin@cisco.com>", 
										to: Email, 
										subject: "Your Username and Password has Created", 
										html: "Dear"+"  "+"<i>"+firstname+" "+lastname+"</i>"+"<br><br>"+
												"<i> Your Username  :</i>"+" "+ userName +"<br>"+
												"<i> Your Password  :</i>"+" "+ passWord +"<br><br>"+
												"<i> "+"<a href='http://localhost/login'>" +"Please Login here"+"</a>"+"</i>"+"<br><br>"+
												"<i> Thanks and Regards, </i>"+"<br>"+
												"<i> Cisco Admin</i>",
									});
								}
							});
							}
							else
							{
								var err4 = new Error('Database not initialized');
								console.log(err4.message);
								callback(err4);
							}
					}
					});
			}
			
	  						
				
	
	});
	});
	}

	catch (exc)
	{
		console.log(exc.message);
		if (callback)
			callback(exc);
	}
	}
	
	
	
    
				 //Fetch User Management Information
			 function fetchUserManagementInfo(username,callback){
				 var resData={};
				 db.collection('usermanagementcollection',function(err,collection){
			  collection.find({'createdBy':username},{}).toArray(function(error, results){
			   console.log("User Management Information: "+results);
				if(!err){
				 if(results.length>0){ 
				  resData.userInformation=results;
				  callback(resData); 
				 }
				 else{
				  //resData.statusCode=600;
				  resData.message="No record found in Fetch ComponentList Operation";
				  callback(resData);
				 }
				}
				else{
				 //resData.statusCode=700;
				 resData.message="Error has occured while trying to establish connection with the collection";
				 callback(resData);
				}
				
			   });
				 });
			  }







           function fetchUserInfo(callback){
		
	       var resData={};
		   var userinfoArray=new Array();
		   var emailinfoArray=new Array();
		   var organizationArray=new Array();
		   var roleArray=new Array();
		   //var userinfoArray=new Array();
		   	db.collection('usermanagementcollection',function(err,collection){
			collection.find().toArray(function(error, results){
					if(!err){
						if(results.length>0){
						    console.log("User Data From MongoDB");
							console.log("Number of Records");
							console.log(results.length);
							console.log(results);
						
						   for(var i=0;i<results.length;i++){
						         userinfoArray.push(results[i].username);
								 emailinfoArray.push(results[i].emailInfo);
								 organizationArray.push(results[i].clientName);
								 roleArray.push(results[i].role);
								 //userinfoArray.push(results[i].userid);
							      console.log(results[i].username);
								  console.log(results[i].emailInfo);
						    }
							
							resData.username=userinfoArray;
							resData.emailInfo=emailinfoArray;
							resData.clientName=organizationArray;
							resData.roleName=roleArray;
							//resData.userid=userinfoArray;
							resData.message="Fetch User Name Operation successfully completed"
							callback(resData);	
						}
						else{
							//resData.statusCode=600;
							
							resData.message="No Record in Fetch Kit Name Operation";
							callback(resData);
						}
					}
					else{
						
						//resData.statusCode=700;
						resData.message="Error in collection";
						callback(resData);
					}
					
				});
			});
		   
		   
	}
	
	
	
	function saveTemplate(kitDetails,callback){
		var resData={};
		db.collection('Modified_WF_Details',function(err,collection){
			collection.insert(kitDetails,function(err,col){
				if(!err){
					resData.message="Data inserted successfully";
					resData.kitName=kitDetails.kitName;
					callback(resData);
				}
				else{
					resData.message="Error in data insertion";
					callback(resData);
				}
				
			});
		});
	}
	
	function saveTemplate1(kitDetails,callback){
		var resData={};
		var kitNmOld, kitNmNew;
		var kitNmArray = kitDetails.kitName.split("&&&&&&");
		 for(var i=0;i<kitNmArray.length;i++){
			 kitNmNew = kitNmArray[0];
			 kitNmOld = kitNmArray[1];
		 }
		kitDetails.kitName=kitNmNew;
		db.collection('Modified_WF_Details',function(err,collection){
			collection.update({'kitName':kitNmOld},kitDetails,function(err,col){
				if(!err){
					resData.message="Data updated successfully";
					resData.kitName=kitDetails.kitName;
					callback(resData);
				}
				else{
					resData.message="Error in data insertion";
					callback(resData);
				}
				
			});
		});
	}
	
	function sendForConfiguration(kitDetails,callback){
		var resData={};
		db.collection('Modified_WF_Details',function(err,collection){
			collection.update({'kitName':kitDetails.kitName},kitDetails,function(err,col){
				if(!err){
					resData.message="Data updated successfully";
					resData.kitName=kitDetails.kitName;
					resData.statusCode=201;
					callback(resData);
				}
				else{
					resData.message="Error in data insertion";
					resData.statusCode=500;
					callback(resData);
				}
				
			});
		});
	}
	
	
		function sendForApproval(kitDetails,callback){
		var resData={};
		db.collection('Modified_WF_Details',function(err,collection){
		
		    collection.update({'kitName':kitDetails.kitName}, {$set: {'configStatus': kitDetails.configStatus,'configuredBy':kitDetails.username}}, {w:1}, function(err) {
            if(err)
                throw err;
                 console.log('entry updated');
				 resData.status=201;
				 callback(resData);
			});
			});
			}
			
			

	
	
	
	
	function saveDWFDetailsIntoMSK(kitDetails,callback){
		var resData={};
		db.collection('Modified_WF_Details',function(err,collection){
			collection.update({'kitName':kitDetails.kitName},kitDetails,{upsert: true},function(err,col){
				if(!err){
					resData.message="Data updated successfully";
					resData.kitName=kitDetails.kitName;
					resData.statusCode=201;
					callback(resData);
				}
				else{
					resData.message="Error in data insertion";
					resData.statusCode=500;
					callback(resData);
				}
				
			});
		});
	}
	
function fetchDefaultkitnames(callback){
     var resData={};
	 var kitNameArray=new Array();
	 db.collection('Default_WF_Details',function(err,collection){
	 collection.find({},{}).toArray(function(error, results){
		console.log("KitNames Retrieved: "+results);
		if(!error){
			if(results.length>0){	
				resData.kitItems=results;
				resData.statusCode = 200;
				callback(resData);	
				}
				else{
					resData.message="No record found in Fetch KitName Operation";
					resData.statusCode = 404;
					callback(resData);
				}
			}
			else{
				//resData.statusCode=700;
				resData.message="Error has occured while trying to establish connection with the collection";
				callback(resData);
			}
				
	 	});
	 });
}

function fetchModifiedkitnames(kitSearch, callback){
     var resData={};
	 db.collection('Modified_WF_Details',function(err,collection){
	 collection.find({'username': kitSearch.username, 'wfType': kitSearch.wfType},{"kitName":1, "configStatus":1}).toArray(function(error, results){
	 console.log("KitNames Retrieved: "+results);
	 if(!err){
				if(results.length>0){	
					resData.kitItems=results;
					resData.statusCode = 200;
					callback(resData);	
				}
				else{
					resData.message="No record found in Fetch KitName Operation";
					resData.statusCode=404;
					callback(resData);
				}
			}
			else{
				//resData.statusCode=700;
				resData.message="Error has occured while trying to establish connection with the collection";
				callback(resData);
			}
				
		});
	});
}


function retrieveMWFKitDetails(kitTitle, callback){
	 var resData={};
	 /*var kitnmAndWFTypArray = kitnmAndWFTyp.split("&&&");
	 var kitName, typeWF;
	 for(var i=0;i<kitnmAndWFTypArray.length;i++){
		 kitName = kitnmAndWFTypArray[0];
		 typeWF = kitnmAndWFTypArray[1];
	 }
	 console.log("KitName: "+kitName);
	 console.log("WF Type: "+typeWF);
	 if (typeWF == "DWF"){*/
		db.collection('Modified_WF_Details',function(err,collection){
			collection.find({'kitName':kitTitle}).toArray(function(error, results){
					if(!err){
						if(results.length>0){
							resData.kitName=results[0].kitName;
							resData.description=results[0].description;
							resData.images=results[0].images;
							resData.deletedImages=results[0].deletedImages;
							resData.clearedImgs=results[0].clearedImgs;
							resData.AutoCheckInNotification = results[0].AutoCheckInNotification;
							resData.statusCode = 200;
							callback(resData);	
						}
						else{
							resData.message="No Record found in Retrieve Operation";
							resData.statusCode = 404;
							callback(resData);
						}
					}
					else{
						resData.message="Error in Retrieval";
						callback(resData);
					}
					
				});
			});
	}
	
	
	
	function retrieveDWFKitDetails(kitTitle, callback){
	 var resData={};
		db.collection('Default_WF_Details',function(err,collection){
			collection.find({'kitName':kitTitle}).toArray(function(error, results){
					if(!err){
						if(results.length>0){
							resData.kitName=results[0].kitName;
							resData.description=results[0].description;
							resData.images=results[0].images;
							resData.statusCode = 200;
							callback(resData);	
						}
						else{
							resData.message="No Record found in Retrieve Operation";
							resData.statusCode = 404;
							callback(resData);
						}
					}
					else{
						resData.message="Error in Retrieval";
						callback(resData);
					}
					
				});
			});
	}




//
function fetchModifiedkitnamesWithStatus(status, users, callback){

     var resData={};
     console.log("users : "+users)
	 db.collection('Modified_WF_Details',function(err,collection){
	 collection.find({$and: [{"username" : {$in: users}}, {'configStatus':status}]},{"kitName":1}).toArray(function(error, results){
	 console.log("KitNames Retrieved: "+results);
	 if(!err){
				if(results.length>0){	
					resData.kitItems=results;
					resData.statusCode = 200;
					callback(resData);	
				}
				else{
					resData.message="No record found in Fetch KitName Operation";
					resData.statusCode=404;
					callback(resData);
				}
			}
			else{
				//resData.statusCode=700;
				resData.message="Error has occured while trying to establish connection with the collection";
				callback(resData);
			}
				
		});
	});
}


function getDetailsByKitName(kitName, callback){
	db.collection("Modified_WF_Details", function(err, collection){
		collection.findOne({'kitName':kitName},function(error, workFlowDoc){
			if(!error){
				if(workFlowDoc)
					callback(workFlowDoc);
				else
					callback([]);
			}
		});
	});
}

function retrieveKitDetails(kitTitle, callback){
	 var resData={};
	 /*var kitnmAndWFTypArray = kitnmAndWFTyp.split("&&&");
	 var kitName, typeWF;
	 for(var i=0;i<kitnmAndWFTypArray.length;i++){
		 kitName = kitnmAndWFTypArray[0];
		 typeWF = kitnmAndWFTypArray[1];
	 }
	 console.log("KitName: "+kitName);
	 console.log("WF Type: "+typeWF);
	 if (typeWF == "DWF"){*/
		db.collection('Modified_WF_Details',function(err,collection){
			collection.find({'kitName':kitTitle}).toArray(function(error, results){
					if(!err){
						if(results.length>0){
							resData.kitName=results[0].kitName;
							resData.description=results[0].description;
							resData.images=results[0].images;
							callback(resData);	
						}
						else{
							resData.kitName=kitName;
							resData.message="No Record in Retrieve Operation";
							callback(resData);
						}
					}
					else{
						resData.message="Error in Retrieval";
						callback(resData);
					}
					
				});
			});
	}
	/* } else if (typeWF =="MWF"){
		 db.collection('Modified_WF_Details',function(err,collection){
				collection.find({'kitName':kitName}).toArray(function(error, results){
						if(!err){
							if(results.length>0){
								console.log(results);
								resData.kitName=results[0].kitName;
								resData.description=results[0].description;
								resData.images=results[0].images;
								callback(resData);	
							}
							else{
								resData.kitName=kitName;
								resData.message="No Record in Retrieve Operation";
								callback(resData);
							}
						}
						else{
							resData.message="Error in Retrieval";
							callback(resData);
						}
						
					});
				});
	 	}*/
//saveWFCopy
function saveWFCopy(kitDetails,callback){
	console.log(kitDetails.kitName);
		var resData={};
		kitDetails.kitName = "Copy of "+kitDetails.kitName;
		db.collection('Modified_WF_Details',function(err,collection){
			collection.insert(kitDetails,function(err,col){
				if(!err){
					resData.message="KitDetails inserted successfully";
					resData.kitName=kitDetails.kitName;
					callback(resData);
				}
				else{
					resData.message="Error in data insertion";
					callback(resData);
				}
				
			});
		});
		}

//fetchComponentImages
function fetchComponentList(callback){
    var resData={};
   	db.collection('HealthCare_Components',function(err,collection){
	collection.find({},{}).toArray(function(error, results){
		console.log("Component list Retrieved: "+results);
			if(!err){
				if(results.length>0){	
					resData.component=results;
					callback(resData);	
				}
				else{
					//resData.statusCode=600;
					resData.message="No record found in Fetch ComponentList Operation";
					callback(resData);
				}
			}
			else{
				//resData.statusCode=700;
				resData.message="Error has occured while trying to establish connection with the collection";
				callback(resData);
			}
			
		});
   	});
	}
	

ConfigAdminApp.get('/logout', function(req, res) { 
	 updateUserLoginOnLogout(req, res, function(err, result){
		  console.log("After Login update"+err)
		
		
		  if(req.session){
		   req.session.destroy(function() {
            res.clearCookie('connect.sid', { path: '/' });
           res.redirect('/');
        });
		}

		  
		   
		 

 });
 });
 
 

	
  // ConfigAdminApp.get('/logout', function (req, res, next){
  // req.session.destroy();
  // res.clearCookie('connect.sid', { path: '/' }); 
  // res.clearCookie('mycookie', { path: '/' }); 
  // res.redirect('/');
 // });
	 
	
	 
  ConfigAdminApp.get('/test', function (req, res){
	  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
	  res.render('business');
 });

 
 function fetchTestExample(callback){
        var resData={};
     	db.collection('statictemplate',function(err,collection){
			collection.find({'kitName':'Patient Visitation Experience'}).toArray(function(error, results){
					if(!err){
						if(results.length>0){
							resData=results;
							console.log(results);
							callback(resData);	
						}
						else{
							//resData.kitName=kitName;
							resData.message="No Record in Retrieve Operation";
							callback(resData);
						}
					}
					else{
						resData.message="Error in Retrieval";
						callback(resData);
					}
					
				});
			});
}

 
 /*
  * getAllUsersUnderAdmin : Returns list of users under super User
  * input : user Name
  * output : error object and userslist
  */
 function getAllUsersUnderAdmin(username, userRole, callback){	
    
	var users = [];
	console.log('use role'+userRole);
	console.log("Going to get all userslist of the domain to which user "+username+" belongs to");
	// get superuser name
	if (userRole == "ADMIN"){
		db.collection("usermanagementcollection", function(err, collection){
			collection.find({"createdBy":username},{"username":1}).toArray(function(error, results){
				if(!err){ 
					console.log(' finding each result length'+results.length);
					if(results.length>0){					
						results.forEach(function(user){						
							users.push(user.username);
						});
										
					}
					callback(err, users);
				}
			});
		});
	}else if(userRole == "IT"){
		db.collection("usermanagementcollection", function(err, collection){
			collection.findOne({"username": username},{"createdBy":1}, function (err, user){
				console.log("err :"+err+"\nuser : "+user);
				if (user){
					if (err) return err, [];
					console.log("Super User Is"+user.createdBy);
					var superUser = user.createdBy;
					db.collection("usermanagementcollection", function(err, collection){
						collection.find({"createdBy":superUser},{"username":1}).toArray(function(error, results){
							if(!err){ 
								if(results.length>0){					
									results.forEach(function(user){						
										users.push(user.username);
									});
								console.log("heeeeeeee"+users);				
								callback(err, users);
								}
							}
						});
					});	
				}
			});
		});
	}	
 }
 
 
 
 
/* 
 * getSuperAdminDetails : Return super admin details
 * input : username
 * output : error object and user object
 */
 
function getSuperAdminDetails(username, callback){
	console.log("Going to get Super Admin user details");
	db.collection("usermanagementcollection", function(err, collection){
		collection.findOne({"username": username}, function (err, user){
			console.log("err :"+err+"\nuser : "+user);
			if (user){
				if (err) return err, [];	
				callback(err, user);
				
			}else{
				callback(err, []);
			}
		});
		
	});
}

/*
 * getUserDetails : Returns user details
 * input : username
 * output : error object and user object
 */

function getUserDetails(username, callback){
	console.log("Going to get user info for user :"+username)
	db.collection('usermanagementcollection', function (err, collection) {
		collection.findOne({"username" : username}, function (err, user) {
			console.log("err :"+err+"\nuser : "+user)
			if (user){
				if (err) return err, [];	
				callback(err, user);
				
			}else{
				callback(err, []);
			}
		});
	});	
}

/*
 * getUserEnterpriseDetails : Returns Enterprise details
 * input : Client Name
 * output : error object and user object
 */

function getUserEnterpriseDetails(username, callback){
	console.log("Going to get EnterPrise Details for client"+username);
	var resData={};
	db.collection('usermanagementcollection',function(err,collection) {
	collection.findOne({"username" : username}, function(err, userdetails) {
			console.log("err"+err);
			console.log("org_details userrole is after reconsidered"+userdetails.usernrole);
			console.log("org_details created by is after reconsidered"+userdetails.createdBy);
			if (err) return err,[];
			if (userdetails) {
			 collection.findOne({'username': userdetails.createdBy},{"username":1,"companyname":1,"address":1,"city":1,"country":1,"state":1,"telephone":1},function(err, organizationDetails) {
					 if (err) return err,[];
					 else{
						 resData.organizationInfo=organizationDetails;
						 console.log('enterPriseDetails company name from calling'+resData.organizationInfo.companyname);
						 console.log(JSON.stringify(resData.organizationInfo));						 
						 callback(err,resData);	
					 }					
				});
			}
		});
	});
}
			



function getUserRecentWFDetails(username, callback){
	console.log("Going to Get Recent WorkFlow Details for user"+username);
	db.collection('Modified_WF_Details', function(err, collection) {
		collection.find({$and: [{"username" : username},												       
								{ $or: [
										{ "configStatus" : "WAITINGTOCONFIGURE" }, 
										{ "configStatus" : "CONFIGUREDONE" }, 
										{ "configStatus" : "APPROVED" }, 
										{ "configStatus" : "REJECTED" },
										{ "configStatus" : "PUBLISHED" }
							           ] 
								}]
				}).toArray(function(err, wfDocs){
					console.log("err :"+ err);
					console.log("wfDocs :"+ wfDocs);
					if (err) return err, [];
					if (wfDocs) {
						callback(err, wfDocs);						
					}else{
						callback(err, []);						
					}
				});
	});
}

/*
 * getAllRecentWFDetails : Returns recent Work flows whose config status is "PENDING" or "APPROVED" or "REJECTED"
 * input : User Name
 * output : error object and user object
 */
function getAllRecentWFDetails(users, userRole, callback){		
	console.log("Going to Get All Recent WorkFlow Details");
	var query = {};
	var query1 = {};
	
	query1["$or"] = [];
	if( userRole == "IT"){
		query1["$or"].push({"configStatus" : "WAITINGTOCONFIGURE"});
	}	
	query1["$or"].push({"configStatus" : "CONFIGUREDONE"});
	query1["$or"].push({"configStatus" : "APPROVED"});
	query1["$or"].push({"configStatus" : "REJECTED"});
	query1["$or"].push({"configStatus" : "PUBLISHED"});
	query["$and"] = [];
	query["$and"].push({"username" : {$in: users}});
	query["$and"].push(query1);
	console.log(util.inspect(query, false, null));
	db.collection('Modified_WF_Details', function(err, collection) {
		collection.find(query).toArray(function(err, wfDocs){
					console.log("err :"+ err);
					console.log("wfDocs :"+ wfDocs);
					if (err) return err, [];
					if (wfDocs) {
						callback(err, wfDocs);						
					}else{
						callback(err, []);						
					}
				});
	});
}

/*
 * On Logout update field in DB "lastLogin" time with current login time
 */
function updateUserLoginOnLogout(req, res, callback){
	var resData={};
	console.log("Going to Update user Login date time"+req.session.username);
	db.collection("usermanagementcollection", function(err, collection){
		collection.findOne({username : req.session.username}, function(err, user){
			if (err) throw  err;
			if (user){
				collection.update(
						{username : req.session.username},
						{$set : {"lastLogin" : user.currentLogin}}, function(err, result){
							if(!err)
							{
								resData.message='updated';
								callback(resData);
							}
						});
			}
		});		
	});
}

/*
 * On Login update current login field in DB
 */
function updateUserLoginOnLogin(req, res, callback){
	console.log('session user is'+req.session.username);
	console.log("Going to Update user Login date time");
	var resData={};
	db.collection("usermanagementcollection", function(err, collection){
		collection.update(
				{ username:  req.session.username },
				{$set: {"currentLogin":Date()}}, function(err, result){
					if(!err)
					{
						resData.message='updated';
						callback(resData);
					}

				});
	});
}
	
	
function saveRegistrationInfo(RegisterDetails,callback){
		
		console.log(RegisterDetails.companyname);
			var resData={};
			
			db.collection('usermanagementcollection',function(err,collection){
				collection.insert(RegisterDetails,function(err,col){
					if(!err){
						resData.message="Registeration Information inserted successfully";
						resData.companyname=RegisterDetails.companyname;
						callback(resData);
					}
					else{
						resData.message="Error in data insertion";
						callback(resData);
					}
					
				});
			});
		}
		
		
		



		

          function  saveBusinessFlowConfiguration(kitName,componentName,data,callback){
		  
		  var query = {};
		  var resData={};
		  console.log("saveBusinessFlowConfiguration");
		  // var componentName='PatientArrivalNotificationToDoctor';
		  var resData={};
		   // var kitName='Patient Visitation Experience';
			
			query[componentName.toString()] = data;
		
			db.collection("Modified_WF_Details", function(err, collection){
							collection.update(
								{'kitName' : kitName},
								{$set: query},{upsert: true});
							resData.message="success";
							callback(resData);
					
					});
					}

		
//*******************************************Emspx Reusable Function End****************************************
/*
Helper Functions
*/


function requiredAuthentication(req, res, next) {   
    if (req.session.username!==undefined) {
        next();
		console.log('resuest session');
    } else {
        req.session.error = 'Access denied!';
			console.log('resuest session login');
		
        res.redirect('/login');
		res.send('Invalid Authentication');
    }
}


// function userExist(req, res, next) {
    // var resData={};
    // User.count({
        // username: req.body.username
    // }, function (err, count) {
        // if (count === 0) {
            // next();
        // } else {
             // req.session.error = "User Exist";
			 // res.header("Access-Control-Allow-Origin", "*");
			 // res.contentType('application/json');
			 // res.header("Access-Control-Allow-Origin", "*");
		    // res.contentType('application/json');
			// resData.error="error";
			// res.send(resData);
			// console.log('User Exist');
            // res.redirect("/signup");
        // }
    // });
// }


function executeAdminAPI(componentAPI,componetConfig,callback){
	console.log("Inside executeAdminAPI method ");
	console.log(componentAPI);
	console.log(componetConfig);
	var componentAPIArray=componentAPI.split("_");
	var componentName=componentAPIArray[0];
	var componentAPIName=componentAPIArray[1];
	var APIUrl=adminAPI.configAdminAPI[componentName][componentAPIName];
	console.log("---------------------------------------------------------------------------------");
	console.log(APIUrl);
	
	var args = {
	  data: componetConfig,
	  headers:{"Content-Type": "application/json"} 
	};

	client.post(APIUrl,args, function(data,response) {
		console.log("Inside Client");
		//console.log(data);
		callback(data);
	});	
}

function updateKitStatus(kitName, status, callback){
	var resData = [];
	db.collection('Modified_WF_Details',function(err,collection){
		collection.update({'kitName':kitName},{$set:{"configStatus":status}},function(err,col){
			if(!err){
				resData.message="Data updated successfully";	
				resData.status="success";
				callback(resData);
			}
			else{
				resData.message="Error in data insertion";
				resData.status="failure"
			}
		});
	});
	
}
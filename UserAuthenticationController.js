
//#region Modules

var Response = require('../common/Response.js');
var ResponseCodes = require('../common/ResponseCodes.js');
var Error = require('../common/Errors.js');
var jwt    = require('jsonwebtoken');
var dateTime = require('node-datetime');
var ip = require("ip");
var UserProfile = require('../models/UserProfile');
var SessionLog = require('../models/SessionLog');
var config = require('../config/config');
const bcrypt = require('bcryptjs');

//#endregion

module.exports = function(app){

//#region Variables

var reqDateTime;

//#endregion

//#region API's

 // Login

 app.post('/UserLogin',function (req, res) {
    reqDateTime=dateTime.create().format('Y-m-d H:M:S');

    if(req.body.username && req.body.password)
    {
        var username = req.body.username;
        var Password = req.body.password;
        //var Role = req.body.Role;

        checkUserName(username, UserProfile, function (err, ResultUser) {
            if (err){
                var response = new Response.LoginResponse(false,"","",reqDateTime,dateTime.create().format('Y-m-d H:M:S'),Error.ErrorDetails.ERR011,err,ResponseCodes.ResponseDetails.RES104);
                res.json({
                    LoginResponse:response
                });
            }
            else if (typeof ResultUser[0] !== 'undefined'){
                var IsValidPassword = bcrypt.compareSync(Password,ResultUser[0].LoginDetails.password)
                    if(IsValidPassword){
                        //if(ResultUser[0].Role === Role){
                            const payload = {
                                username : req.body.username,
                                MobileNo : ResultUser[0].MobileNo,
                                Role : ResultUser[0].Role
                            };
                            var secretkey= config.Secret;

                            var token = jwt.sign(payload, secretkey);

                            sessionLogs(SessionLog,ResultUser[0],token,req,function(err,sessionResult){
                                if (err){
                                    var response = new Response.LoginResponse(false,"","",reqDateTime,dateTime.create().format('Y-m-d H:M:S'),Error.ErrorDetails.ERR009,err.message,ResponseCodes.ResponseDetails.RES104);
                                    res.json({
                                        CreateResponse:response
                                    });
                                }
                                else if(sessionResult==true){
                                    var response = new Response.LoginResponse(true,token,ResultUser[0],reqDateTime,dateTime.create().format('Y-m-d H:M:S'),"","",ResponseCodes.ResponseDetails.RES100);
                                    res.json({
                                        LoginResponse:response
                                    });
                                }
                                else{
                                    var response = new Response.LoginResponse(false,"","",reqDateTime,dateTime.create().format('Y-m-d H:M:S'),Error.ErrorDetails.ERR009,"",ResponseCodes.ResponseDetails.RES103);
                                    res.json({
                                        LoginResponse:response
                                    });
                                }
                            });
                        //}  Role Not checked and signed token with role => used in validating view rights for user.
                        // else {
                        //     var response = new Response.LoginResponse(false,"","",reqDateTime,dateTime.create().format('Y-m-d H:M:S'),Error.ErrorDetails.ERR018,"",ResponseCodes.ResponseDetails.RES103);
                        //     res.json({
                        //         LoginResponse:response
                        //     });
                        //}
                    }
                    
                    else {
                        var response = new Response.LoginResponse(false,"","",reqDateTime,dateTime.create().format('Y-m-d H:M:S'),Error.ErrorDetails.ERR001,"",ResponseCodes.ResponseDetails.RES103);
                        res.json({
                            LoginResponse:response
                        });
                    }
            }
        
            else {
                var response = new Response.LoginResponse(false,"","",reqDateTime,dateTime.create().format('Y-m-d H:M:S'),Error.ErrorDetails.ERR004,"",ResponseCodes.ResponseDetails.RES103);
                res.json({
                    LoginResponse:response
                });
            }
        });
    }

});

//#endregion
}

  // Function to store the logs, when user login.
  function sessionLogs(SessionLog,userData,token,req,sessionCallback) {
    
    
    //
    var SessionData = { AccessedLog : "User Logged In",LogUpdatedDateTime : new Date() };

    



    var queryUser = { "username": userData.LoginDetails.username }
    SessionLog.find(queryUser,function(err, SessionResult) {
        if (SessionResult.length==0)
            {
                var Session = new SessionLog({
                Token : token,
                LogOffDateTime: "",
                username: userData.LoginDetails.username,
                Role: userData.Role ,
                IPAddress: ip.address(),
                });
                Session.SessionDatas.push(SessionData);
                Session.save(function(err,SavedLogs){
                    if (err)
                        sessionCallback(err);
                    
                    if(SavedLogs != 'undefined')
                        sessionCallback(err,true);
                })
            }
        else {
            SessionResult[0].SessionDatas.push(SessionData);
            SessionResult[0].save(function(err,SavedLogs){
                if (err)
                    sessionCallback(err);
                
                if(SavedLogs != 'undefined')
                    sessionCallback(err,true);
            })
        } 
    });

    

  
}

// Function to check, whether the username already exists or not.
 function checkUserName(user, UserProfile, UserCallback) {
            var queryUser = { "LoginDetails.username": user }
        
            UserProfile.find(queryUser,function(err, UserResult) {
                if (err)
                    UserCallback(err);
                else {
                    UserCallback(err, UserResult);
                }
            });

}
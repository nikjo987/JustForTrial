var Response = require('../common/Response.js');
var ResponseCodes = require('../common/ResponseCodes.js');
var Error = require('../common/Errors.js');
var DonationObject = require('../models/DonationObject');
var CompressImage = require('compress-images');
var Token = require('../security/Authentication');
var dateTime = require('node-datetime');
var multer  = require('multer')
var UserProfile = require('../models/UserProfile');
var upload = multer()


module.exports = function (app) {

    app.post('/donate/create',upload.single('File'), function (req, res) {
        reqDateTime = dateTime.create().format('Y-m-d H:M:S');

        // if(req.body.File == null || req.body.FileName == null){
        //     var response = new Response.CreateResponse(false, 0, "", reqDateTime, dateTime.create().format('Y-m-d H:M:S'),Error.ErrorDetails.ERR020,"",ResponseCodes.ResponseDetails.RES103);
        //             res.json({
        //                 CreateResponse: response
        //             });
        // } else
         if(req.body.File != null || req.body.FileName != null){
            Token.ValidateToken(req,res,function(err,tokenDecoded){
                if(err){
                    var response = new Response.QueryResponse(false,"",reqDateTime,dateTime.create().format('Y-m-d H:M:S'),Error.ErrorDetails.ERR015,"",ResponseCodes.ResponseDetails.RES104);
                    res.json({
                    QueryResponse:response
                    });
                }
                else{ 
                    //tokenDecoded.UserName
                    UserProfile.find({"LoginDetails.username":tokenDecoded.username},function (err, result) {
                        if (err){
                            var response = new Response.QueryResponse(false,"",reqDateTime,dateTime.create().format('Y-m-d H:M:S'),Error.ErrorDetails.ERR005,"",ResponseCodes.ResponseDetails.RES104);
                            res.json({
                                QueryResponse:response
                            });
                        }
                        else {
                            var DObject = new DonationObject({
                                Name : req.body.FileName,
                                Photo : new Buffer(req.file.buffer, 'binary').toString('base64'),                                
                                UserID : result[0].id,
                                UserName : result[0].LoginDetails.username
                            });
                            DObject.save(function (err,savedObject) {
                                    if (err) {
                                        var response = new Response.CreateResponse(false, "","", reqDateTime, dateTime.create().format('Y-m-d H:M:S'),Error.ErrorDetails.ERR006,err.message,ResponseCodes.ResponseDetails.RES103);
                                        res.json({
                                            CreateResponse: response
                                        });
                                    }
                                    if(typeof savedObject !== 'undefined' && typeof savedObject._id !== 'undefined') {
                                                                               
                                        var response = new Response.CreateResponse(true, 1, savedObject, reqDateTime, dateTime.create().format('Y-m-d H:M:S'), "", "",ResponseCodes.ResponseDetails.RES105);
                                        res.json({
                                            CreateResponse: response
                                        });
                                    }
                                UpdateUserProfile(result,savedObject)                     
                            });
                        }
                    });
                }
            });
            
        }
    });
}



function UpdateUserProfile(result, savedObject ,UserCallback){
    var queryUser = { "LoginDetails.username": result[0].LoginDetails.username }
    UserProfile.find(queryUser,function(err, UserResult) {
        if (err)
            UserCallback(err);
        else {
            UserResult[0].DonationObject = savedObject.id
            UserResult[0].save(function(err,SavedLogs){
                if (err)
                    console.log(err);
                
                if(SavedLogs != 'undefined')
                    console.log(err,true);
            })
        }
    });
}
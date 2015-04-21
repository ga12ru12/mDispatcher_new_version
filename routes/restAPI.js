/**
 * Created by quang.hoang on 08/10/2014.
 */
var http            = require('http');
var webServiceBase  = require('../config/webServiceBase');
var async           = require('async');
var utils           = require('../config/utils');
var queryString     = require('querystring');

//Authen with Command Center
var authenticateInfo = {};

function getAuthInfo() {
    var getAuthOption =  {
        port: webServiceBase.port, host: webServiceBase.host, headers: {
            'Host': webServiceBase.host
        },
        path: webServiceBase.BaseWebservice.getUserAuthenticate+'?domain='+webServiceBase.serverName
    };
    try {
        http.get(getAuthOption, function (response) {
            if (response.statusCode == 200) {
                var data = "";
                response.on("data", function (chunk) {
                    data += chunk;
                    console.log(data);
                });
                response.on("end", function () {
                    try{
                        var dataResponse = JSON.parse(data);
                        authenticateInfo.email = utils.decrypt(dataResponse.email);
                        authenticateInfo.password = utils.decrypt(dataResponse.password);
                        authenticateInfo.companyId = dataResponse.companyId;
                    }catch(ex){
                        console.log(' ===== BUG BUG BUG ===== getUserAuthenticate');
                        console.log(ex);
                    }
                });
            } else {
                var mailContent = {
                    subject: 'getAuthOption ERROR',
                    text: 'getAuthOption ERROR',
                    html: response
                };
                console.log(mailContent);
            }
        }).on('error', function(e){
            console.log('BUG BUG BUG BUG===============getAuthOption===');
            var mailContent = {
                subject: 'REQUEST HTTP HAS FAILS 2',
                text: e,
                html: ''
            };
            console.log(mailContent);
        });
    } catch (e) {
        console.log(' ===== BUG BUG BUG ===== getUserAuthenticate');
        console.log(e);
    }
}
async.whilst(
    function () { return !authenticateInfo.email; },
    function (callback) {
        getAuthInfo();
        setTimeout(callback, 1000);
    },
    function (err) {
        console.log('getUserAuthenticate LIFERAY OK');
    }
);

var initPostOption = function(info){
    var _auth = new Buffer(info.user+':'+info.password).toString('base64');
    var post_options = {
        host: webServiceBase.host,
        port: webServiceBase.port,
        path: info.path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': info.dataLength,
            'Authorization': 'Basic ' + _auth
        }
    };
    return post_options;
};

callPost = function(postData, postOptions, cb){
    try {
        var post_req = http.request(postOptions, function(res) {
            if (res.statusCode == 200) {
                var data = "";
                res.on("data", function (chunk) {
                    data += chunk;
                });
                res.on("end", function () {
                    try {
                        var temp = JSON.parse(data);
                        console.log('RESPONSE WS:');
                        console.log(temp);
                        console.log('========================================================================');

                        if(temp.exception){
                            var mailContent = {
                                subject: 'REQUEST HTTP HAS FAILS 1'+' TO '+postOptions.host+':'+postOptions.port+postOptions.path,
                                text: temp.exception,
                                html: postData
                            };
                            console.log(mailContent);
                            return cb(false);
                        }else{
                            var mailContent = {
                                subject: 'REQUEST METHOD:'+postOptions.method+' TO '+postOptions.host+':'+postOptions.port+postOptions.path,
                                html: postData,
                                result: temp
                            };
                            console.log(mailContent);
                            return cb(temp);
                        }
                    } catch (ex) {
                        var mailContent = {
                            subject: 'REQUEST HTTP HAS FAILS 1'+' TO '+postOptions.host+':'+postOptions.port+postOptions.path,
                            text: ex,
                            html: postData
                        };
                        console.log(mailContent);
                        return cb(false);
                    }
                });
            } else {

                var mailContent = {
                    subject: 'REQUEST HTTP HAS FAILS 2'+' TO '+postOptions.host+':'+postOptions.port+postOptions.path,
                    text: res,
                    html: postData
                };
                console.log(mailContent);
                return cb(false);
            }
        });
        post_req.on('error', function(e) {
            console.log(' BUG BUG BUG BUG BUG BUG BUG callPost 2');
            console.log(e);
            var mailContent = {
                subject: 'REQUEST HTTP HAS FAILS 3'+' TO '+postOptions.host+':'+postOptions.port+postOptions.path,
                text: e,
                html: postData
            };
            console.log(mailContent);
            return cb(false);
        });
        post_req.write(postData);
        post_req.end();
    } catch (e) {
        console.log(' BUG BUG BUG BUG BUG BUG BUG callPost 1');
        var mailContent = {
            subject: 'REQUEST HTTP HAS FAILS 4'+' TO '+postOptions.host+':'+postOptions.port+postOptions.path,
            text: e,
            html: postData
        };
        console.log(mailContent);
        return cb(false);
    }
};

//Call ws Command Center to edit profile
var editProfile = function(info, callback){
    var postData = queryString.stringify(info);
    var paramOption = {
        path: webServiceBase.BaseWebservice.editInfoMobileDispatcher,
        user: authenticateInfo.email,
        password: authenticateInfo.password,
        dataLength: postData.length
    };
    var postOptions = initPostOption(paramOption);
    callPost(postData, postOptions, function(status){
        callback(status);
    });
}

//Call ws Command Center to reset password
var forgotPassword = function(email, cb){
    var auth = 'Basic ' + new Buffer(authenticateInfo.email+":"+authenticateInfo.password).toString('base64');
    var forgotPasswordOption =  {
        port: webServiceBase.port,
        host: webServiceBase.host,
        headers: {
            'Host': webServiceBase.host,
            "Authorization": auth
        },
        path: webServiceBase.BaseWebservice.resetPassword+'?companyId='+ authenticateInfo.companyId
            + "&emailAddress=" + email + "&fromName=&fromAddress=&subject=&body="
    };
    try {
        http.get(forgotPasswordOption, function (response) {
            if (response.statusCode == 200) {
                var data = "";
                response.on("data", function (chunk) {
                    data += chunk;
                    console.log(data);
                });
                response.on("end", function () {
                    var dataResponse = JSON.parse(data);
                    cb(dataResponse);
                });
            } else {
                console.log('forgotPassword ERROR');
                var mailContent = {
                    subject: 'forgotPassword ERROR',
                    text: 'forgotPassword ERROR',
                    html: response
                };
                console.log(mailContent);
                cb(false);
            }
        }).on('error', function(e){
            console.log('BUG BUG BUG BUG===============forgotPassword===');
            var mailContent = {
                subject: 'REQUEST HTTP HAS FAILS 2',
                text: e,
                html: ''
            };
            console.log(mailContent);
            cb(false);
        });
    } catch (e) {
        console.log(' ===== BUG BUG BUG ===== forgotPassword');
        var mailContent = {
            subject: 'forgotPassword ERROR',
            text: e,
            html: ''
        };
        console.log(mailContent);
        cb(false);
    }
}

//Call CC ws to change password account
var changePassword = function(userId, oldPassword, newPassword, callback){
    var postData = queryString.stringify({
        userAccountId   : userId,
        oldPassword     : oldPassword+'',
        newPassword     : newPassword+'',
        passwordReset   : true
    });
    var paramOption = {
        path: webServiceBase.BaseWebservice.changePasswordUser,
        user: authenticateInfo.email,
        password: authenticateInfo.password,
        dataLength: postData.length
    };
    var postOptions = initPostOption(paramOption);
    callPost(postData, postOptions, function(status){
        callback(status);
    });
}

//Call ws Command Center to sign up
var signup = function(info, callback){
    var postData = queryString.stringify(info);
    var paramOption = {
        path: webServiceBase.BaseWebservice.signup,
        user: authenticateInfo.email,
        password: authenticateInfo.password,
        dataLength: postData.length
    };
    var postOptions = initPostOption(paramOption);
    callPost(postData, postOptions, function(status){
        callback(status)
    });
}


//Call ws Command Center to sign up
var calFare = function(info, callback){
    var postData = queryString.stringify(info);
    var paramOption = {
        path: webServiceBase.BaseWebservice.calculationFare,
        user: authenticateInfo.email,
        password: authenticateInfo.password,
        dataLength: postData.length
    };
    var postOptions = initPostOption(paramOption);
    callPost(postData, postOptions, function(status){
        callback(status)
    });
}

module.exports = {
    editProfile     : editProfile,
    forgotPassword  : forgotPassword,
    changePassword  : changePassword,
    signup          : signup,
    calFare         : calFare,
    authenticateInfo: authenticateInfo
}
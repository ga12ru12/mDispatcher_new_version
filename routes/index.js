var express = require('express');
var router = express.Router();
var restAPI = require('./restAPI');
var request = require('request');
var webServiceBase  = require('../config/webServiceBase');

/* GET home page. */
router.get('/', function (req, res) {
    res.render('front_end/views/index.html')
});

router.post('/forgotPassword', function (req, res) {
    restAPI.forgotPassword(req.param('email'), function (status) {
        res.send(status);
    });
});

router.post('/signup', function (req, res) {
    if (!req.body.phone) {
        req.body.phone = '';
    }
    restAPI.signup(req.body, function (status) {
        res.send(status);
    })
});

router.post('/login', function(req, res){
    req.session.user = req.body.user;
    if(!req.session.user.lastName){
        req.session.user.lastName = req.session.user.lasName;
    }
    req.session.user.pass = req.param('pass');
    res.send('OK');
});


router.post('/setting/changePassword', function(req, res){
    var info = req.param('info');
    console.log(info);
    restAPI.changePassword(req.session.user.userId, info.oldPassword, info.newPassword, function(status){
        status = status == 1 ? true:false;
        if(status){
            req.session.user.pass = info.newPassword;
        }
        res.send(status);
    });
});


router.post('/newBooking/calFare', function(req, res){
    if(req.body && req.body.distance && req.body.merchantId && req.body.vehicleTypeId && req.body.timeDate){
        try{
            req.body.distance = parseFloat(req.body.distance);
            req.body.merchantId = parseInt(req.body.merchantId);
            req.body.timeDate = req.body.timeDate === 'Now' ? 'ASAP':req.body.timeDate;
            if(!req.body.zipCodeFrom){
                req.body.zipCodeFrom = '';
            }
            if(!req.body.zipCodeTo){
                req.body.zipCodeTo = '';
            }
            console.log('calFare', req.body);
            request({
                uri: 'http://'+webServiceBase.host + webServiceBase.BaseWebservice.calculationFare,
                method: 'POST',
                form: req.body,
                auth: {
                    "username": restAPI.authenticateInfo.email,
                    "password": restAPI.authenticateInfo.password
                },
                timeout: 15000,
                followRedirect: true,
                maxRedirects: 10
            }, function(error, response, body) {
                if(error){
                    console.log(error);
                    res.send('N/A');
                }else{
                    if(response) {
                        console.log('=======response==== ');
                        console.log(body);
                        if (body) {
                            console.log('== CALL WS END id: ');
                            try{
                                var info = JSON.parse(body);
                                if(info.exception){
                                    res.send('N/A');
                                }else{
                                    console.log(info);
                                    res.send(info);
                                }
                            }catch(ex){
                                res.send('N/A');
                            }
                        } else {
                            res.send('N/A');
                        }
                    } else {
                        res.send('N/A');
                    }
                }
            });
        }catch(ex){
            console.log(ex);
            res.send('N/A');
        }
    }else{
        res.send('N/A');
    }
});


router.post('/profile/editProfile', function(req, res){
    var info = req.param('info');
    info.userId = req.session.user.userId;
    if(info.base64encode){
        info.base64encode = info.base64encode.replace('data:image/png;base64,','');
        console.log(info);
        restAPI.editProfile(info, function(status){
            if(status){
                req.session.user = _.extend(req.session.user, req.param('info'));
                req.session.user.imageUrlEdit = info.base64encode;
                req.session.user.imageUrl = '';
            }
            res.send(status);
        });
    }else{
        info.base64encode = '';
        console.log(info);
        restAPI.editProfile(info, function(status){
            if(status){
                req.session.user = _.extend(req.session.user, req.param('info'));
            }
            res.send(status);
        });
    }
});
router.post('/profile/editProfileWithoutAvatar', function(req, res){
    var info = req.param('info');
    info.userId = req.session.user.userId;
    info.base64encode = '';
    console.log(info);
    restAPI.editProfile(info, function(status){
        if(status){
            req.session.user = _.extend(req.session.user, req.param('info'));
        }
        res.send(status);
    });
});

module.exports = router;

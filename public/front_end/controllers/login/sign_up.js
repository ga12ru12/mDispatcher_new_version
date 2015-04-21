angular.module('SignUpCtrl', [])
    .controller('SignUpCtrl', ['$scope', '$http', '$state',
        function($scope, $http, $state){
            //Sign up account mDispatcher
            $scope.signUp = function(){
                async.parallel([
                    function(cb){
                        cb(null, $scope.checkFistNameSignUpAction());
                    },function(cb){
                        cb(null, $scope.checkLastNameSignUpAction());
                    },function(cb){
                        cb(null, $scope.checkEmailSignUpAction());
                    },function(cb){
                        cb(null, $scope.checkConfirmEmailSignUpAction());
                    },function(cb){
                        cb(null, $scope.checkPasswordSignUpAction());
                    },function(cb){
                        cb(null, $scope.checkConfirmPasswordSignUpAction());
                    }
                ], function(err, result){
                    if(result.indexOf(false) == -1){
                        openLoadingPopup();
                        var request = $http({
                            method  : 'post',
                            url     : '/signup',
                            data    : {
                                firstName     : $scope.signup_firstName,
                                lastName : $scope.signup_lastName,
                                password     : $scope.signup_password,
                                email : $scope.signup_email,
                                phone     : $scope.signup_phoneNumber
                            }
                        });
                        request.success(function(status){
                            closeLoadingPopup();
                            console.log(status);
                            switch (status.returnCode){
                                case '200':
                                    $scope.notiSignup = 'Sign up successfully.';
                                    $jq('#notiSignupModal').modal('show');
                                    $scope.signup_firstName = '';
                                    $scope.signup_lastName = '';
                                    $scope.signup_email = '';
                                    $scope.signup_confirmEmail = '';
                                    $scope.signup_phoneNumber = '';
                                    $scope.signup_password = '';
                                    $scope.signup_confirmPassword = '';
                                    $jq('#notiSignupModal').on('hidden.bs.modal', function () {
                                        $state.go('login');
                                    })
                                    break;
                                case '413':
                                    $scope.notiSignup = 'Email existed.';
                                    $scope.checkEmailSignUp = {
                                        'color': 'red',
                                        'border-bottom': 'thin solid red'
                                    };
                                    $jq('#notiSignupModal').modal('show');
                                    break;
                                case '304':
                                    $scope.notiSignup = 'No role parner in CC';
                                    $jq('#notiSignupModal').modal('show');
                                    break;
                                default :
                                    $scope.notiSignup = 'Server Error. Please try later.';
                                    $jq('#notiSignupModal').modal('show');
                                    break;
                            }
                        });
                        request.error(function(status){
                            closeLoadingPopup();
                            alert(status);
                        });
                    }
                });
            }

            //Validate form sign up
            $scope.checkFistNameSignUpAction = function(){
                if($scope.signup_firstName){
                    $scope.checkFirstNameSignUp = {
                        'color': 'green',
                        'border-bottom': 'thin solid green'
                    }
                    return true;
                }else{
                    $scope.checkFirstNameSignUp = {
                        'color': 'red',
                        'border-bottom': 'thin solid red'
                    };
                    return false
                }
            }
            $scope.checkLastNameSignUpAction = function(){
                if($scope.signup_lastName){
                    $scope.checkLastNameSignUp = {
                        'color': 'green',
                        'border-bottom': 'thin solid green'
                    }
                    return true;
                }else{
                    $scope.checkLastNameSignUp = {
                        'color': 'red',
                        'border-bottom': 'thin solid red'
                    };
                    return false;
                }
            }
            $scope.checkEmailSignUpAction = function(){
                if($scope.signup_email && validateEmail($scope.signup_email)){
                    $scope.checkEmailSignUp = {
                        'color': 'green',
                        'border-bottom': 'thin solid green'
                    }
                    return true;
                }else{
                    $scope.checkEmailSignUp = {
                        'color': 'red',
                        'border-bottom': 'thin solid red'
                    };
                    return false
                }
            }
            $scope.checkConfirmEmailSignUpAction = function(){
                if($scope.signup_confirmEmail && validateEmail($scope.signup_confirmEmail) && $scope.signup_confirmEmail === $scope.signup_email){
                    $scope.checkConfirmEmailSignUp = {
                        'color': 'green',
                        'border-bottom': 'thin solid green'
                    }
                    return true;
                }else{
                    $scope.checkConfirmEmailSignUp = {
                        'color': 'red',
                        'border-bottom': 'thin solid red'
                    };
                    return false;
                }
            }
            $scope.checkPasswordSignUpAction = function(){
                if($scope.signup_password){
                    $scope.checkPasswordSignUp = {
                        'color': 'green',
                        'border-bottom': 'thin solid green'
                    }
                    return true;
                }else{
                    $scope.checkPasswordSignUp = {
                        'color': 'red',
                        'border-bottom': 'thin solid red'
                    };
                    return false;
                }
            }
            $scope.checkConfirmPasswordSignUpAction = function(){
                if($scope.signup_confirmPassword && $scope.signup_confirmPassword === $scope.signup_password){
                    $scope.checkConfirmPasswordSignUp = {
                        'color': 'green',
                        'border-bottom': 'thin solid green'
                    }
                    return true;
                }else{
                    $scope.checkConfirmPasswordSignUp = {
                        'color': 'red',
                        'border-bottom': 'thin solid red'
                    };
                    return false;
                }
            }
        }
    ]);
var loadingPopup;
//Open popup loading when do anything
function openLoadingPopup(){
    loadingPopup = $jq('#loadingPopup').bPopup({
        modalClose: false
    });
}

//Close popup loading when do anything DONE
function closeLoadingPopup(){
    try{
        loadingPopup.close();
    }catch(e){
        console.log(e);
    }
}
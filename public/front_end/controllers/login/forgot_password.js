/**
 * Created by qgs on 12/24/14.
 */
angular.module('ForgotPasswordCtrl', [])
    .controller('ForgotPasswordCtrl', ['$scope', '$http', '$state',
        function($scope, $http, $state){
            $scope.forgotPassword = function(email){
                window.openLoadingPopup();
                if(!email){
                    window.closeLoadingPopup();
                    $scope.notiForgotPassword = "Please enter email.";
                    $jq('#notiForgotPasswordModal').modal('show');
                }else if(!validateEmail(email)){
                    closeLoadingPopup();
                    $scope.notiForgotPassword = "Please enter a valid email.";
                    $jq('#notiForgotPasswordModal').modal('show');
                }else{
                    var request = $http({
                        method  : 'post',
                        url     : '/forgotPassword',
                        data    : {
                            email: email
                        }
                    });
                    request.success(function(status){
                        window.closeLoadingPopup();
                        $scope.notiForgotPassword = "The reset link has been sent successfully to "+email;
                        $jq('#notiForgotPasswordModal').modal('show');
                        $jq('#notiForgotPasswordModal').on('hidden.bs.modal', function () {
                            $state.go('login');
                        })
                    });
                    request.error(function(status){
                        window.closeLoadingPopup();
                        $scope.notiForgotPassword = 'Server have error. Please try later!';
                        $jq('#notiForgotPasswordModal').modal('show');
                    });
                }
            }
        }
    ]);

function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}
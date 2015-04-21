angular.module('ChangePassCtrl', ['ngCookies'])
    .controller('ChangePassCtrl', ['$scope', 'AuthService', '$http', 'serverConfig', '$state', '$sce', '$cookies',
        function($scope, AuthService, $http, serverConfig, $state, $sce, $cookies) {

            //Change password
            $scope.changePasswordAction = function(){
                if(!$scope.oldPassword){
                    $scope.notiChangePassword = 'Please enter your current password.';
                    $jq('#notiChangePasswordModal').modal('show');
                }else if(!$scope.newPassword){
                    $scope.notiChangePassword = 'Please enter your new password.';
                    $jq('#notiChangePasswordModal').modal('show');
                }else if(!$scope.confirmPassword){
                    $scope.notiChangePassword = 'Please confirm your new password.';
                    $jq('#notiChangePasswordModal').modal('show');
                }else{
                    if($scope.oldPassword === $cookies.p){
                        if($scope.newPassword === $scope.confirmPassword){
                            var request = $http({
                                method: "post",
                                url: "/setting/changePassword",
                                data: {
                                    info: {
                                        oldPassword: $scope.oldPassword,
                                        newPassword: $scope.newPassword
                                    }
                                }
                            });
                            request.success(function (status) {
                                closeLoadingPopup();
                                if(status){
                                    $cookies.p = new String($scope.newPassword)+'';
                                    delete $scope.oldPassword;
                                    delete $scope.newPassword;
                                    delete $scope.confirmPassword;
                                    $scope.notiChangePassword = 'Change password successfull.';
                                    $jq('#notiChangePasswordModal').modal('show');
                                    $jq('#notiChangePasswordModal').on('hidden.bs.modal', function (e) {
                                        $state.go('setting');
                                    })
                                }else{
                                    $scope.notiChangePassword = 'Server have error. Please try later.';
                                    $jq('#notiChangePasswordModal').modal('show');
                                }
                            });
                            request.error(function (dataS, status, headers, config) {
                                closeLoadingPopup();
                                $scope.notiChangePassword = 'Server have error. Please try later.';
                                $jq('#notiChangePasswordModal').modal('show');
                            });
                        }else{
                            $scope.notiChangePassword = 'The confirm new password is wrong. Please try again!';
                            $jq('#notiChangePasswordModal').modal('show');
                        }
                    }else{
                        $scope.notiChangePassword = 'The Current password is wrong. Please try again!';
                        $jq('#notiChangePasswordModal').modal('show');
                    }
                }
            }
        }
    ]);
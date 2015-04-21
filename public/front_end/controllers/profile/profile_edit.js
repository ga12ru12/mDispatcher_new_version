angular.module('ProfileEditCtrl', ['ngCookies', 'ngImgCrop'])
    .controller('ProfileEditCtrl', ['$scope', 'AuthService', '$http', 'serverConfig', '$state', '$sce', '$cookies',
        function($scope, AuthService, $http, serverConfig, $state, $sce, $cookies) {
            $scope.userImage = AuthService.editAvatar ? AuthService.user.imageUrl : serverConfig.getServerConfig().CCUrl + AuthService.user.imageUrl;
            $scope.firstNameInfo = $scope.firstNameInfoEdit = AuthService.user.firstName;
            $scope.lastNameInfo = $scope.lastNameInfoEdit = AuthService.user.lasName;
            $scope.phoneInfoEdit = AuthService.user.phone;
            $scope.emailInfo = AuthService.user.email;
            $scope.addressInfoEdit = AuthService.user.address;

            $scope.myImage='';
            $scope.myCroppedImage='';
            var checkUpdateAvatar = false;


            var handleFileSelect=function(evt) {
                openLoadingPopup();
                var file=evt.currentTarget.files[0];
                var reader = new FileReader();
                reader.onload = function (evt) {
                    $scope.$apply(function($scope){
                        $scope.myImage=evt.target.result;
                    });
                };
                reader.readAsDataURL(file);
            };
            angular.element(document.querySelector('#fileInput')).on('change',handleFileSelect);
            $scope.endLoading = function(){
                closeLoadingPopup();
            }
            $scope.editAvatarAction = function(){
                $scope.userImage = $scope.myCroppedImage;
                $jq('#editAvatarModal').modal('hide');
                checkUpdateAvatar = true;
            }

            //Connect socket to server dispatch to edit info
            $scope.editInfo = function(){
                openLoadingPopup();
                if(!$scope.firstNameInfoEdit || ($scope.firstNameInfoEdit && !isValidString($scope.firstNameInfoEdit))){
                    closeLoadingPopup();
                    $scope.mDispatcherError = 'Please enter your first name!';
                    $jq('#errorJobModal').foundation('reveal', 'open');
                }else{
                    if(!$scope.lastNameInfoEdit || ($scope.lastNameInfoEdit && !isValidString($scope.lastNameInfoEdit))){
                        closeLoadingPopup();
                        $scope.mDispatcherError = 'Please enter your last name!';
                        $jq('#errorJobModal').foundation('reveal', 'open');
                    }else{
                        editInfoAction();
                    }
                }
                function editInfoAction (){
                    if(!checkUpdateAvatar){
                        var request = $http({
                            method: "post",
                            url: "/profile/editProfileWithoutAvatar",
                            data: {
                                info: {
                                    firstName: $scope.firstNameInfoEdit,
                                    lastName: $scope.lastNameInfoEdit,
                                    phone: $scope.phoneInfoEdit,
                                    address: $scope.addressInfoEdit
                                }
                            }
                        });
                        request.success(function (status) {
                            closeLoadingPopup();
                            if(status){
                                AuthService.user.phoneInfo = $scope.phoneInfoEdit;
                                AuthService.user.firstName = $scope.firstNameInfoEdit;
                                AuthService.user.lastName = $scope.lastNameInfoEdit;
                                AuthService.user.addressInfo = $scope.addressInfoEdit;
                                //$scope.$digest();
                                $state.go('profile');
                            }else{
                                alert('Error Edit Profile2');
                            }
                        });
                        request.error(function (dataS, status, headers, config) {
                            closeLoadingPopup();
                            alert('Error Edit Profile1');
                        });
                    }else{
                        var request = $http({
                            method: "post",
                            url: "/profile/editProfile",
                            data: {
                                info: {
                                    firstName: $scope.firstNameInfoEdit,
                                    lastName: $scope.lastNameInfoEdit,
                                    phone: $scope.phoneInfoEdit,
                                    base64encode: $scope.myCroppedImage,
                                    address: $scope.addressInfoEdit
                                }
                            }
                        });
                        request.success(function (status) {
                            closeLoadingPopup();
                            if(status){
                                AuthService.user.phone = $scope.phoneInfoEdit;
                                AuthService.user.firstName = $scope.firstNameInfoEdit;
                                AuthService.user.lasName = $scope.lastNameInfoEdit;
                                AuthService.user.address = $scope.addressInfoEdit;
                                AuthService.user.imageUrl = $scope.myCroppedImage;
                                AuthService.editAvatar = true;
                                //$scope.$digest();
                                $state.go('profile');
                            }else{
                                alert('Error Edit Profile2');
                            }
                        });
                        request.error(function (dataS, status, headers, config) {
                            closeLoadingPopup();
                            alert('Error Edit Profile1');
                        });
                    }
                }
            }
        }
    ]);

function isValidString(str){
    return !/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(str);
}
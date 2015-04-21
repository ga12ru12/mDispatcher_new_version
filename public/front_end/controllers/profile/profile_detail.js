angular.module('ProfileDetailCtrl', ['ngCookies'])
    .controller('ProfileDetailCtrl', ['$scope', 'AuthService', '$http', 'serverConfig', '$state', '$sce', '$cookies',
        function($scope, AuthService, $http, serverConfig, $state, $sce, $cookies) {
            console.log(AuthService);
            $scope.userImage = AuthService.editAvatar ? AuthService.user.imageUrl : serverConfig.getServerConfig().CCUrl + AuthService.user.imageUrl;
            $scope.firstNameInfo = AuthService.user.firstName;
            $scope.lastNameInfo = AuthService.user.lasName;
            $scope.phoneInfo = AuthService.user.phone;
            $scope.emailInfo = AuthService.user.email;
            $scope.addressInfo = AuthService.user.address;
        }
    ]);
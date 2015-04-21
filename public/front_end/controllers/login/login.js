angular.module('LoginController', ['ngCookies', 'anim-in-out'])
    .controller('LoginCtrl', ['$scope', 'socket', 'AuthService', '$http', 'serverConfig', '$state', '$sce', '$cookies',
        function($scope, socket, AuthService, $http, serverConfig, $state, $sce, $cookies) {
            if($cookies.u && $cookies.p){
                $scope.email = $cookies.u;
                $scope.password = $cookies.p;
                $scope.$apply();
            }
            //Connect to server to authen and login
            $scope.loginAction = function(){

                if(!$scope.email){
                    $scope.email = $jq(".loginDiv .emailLogin").val();
                }
                if(!$scope.password){
                    $scope.password = $jq(".loginDiv .paswordLogin").val();
                }

                if(!$scope.email){
                    $scope.notiLogin = $sce.trustAsHtml("Please enter your email address.");
                    $jq('#notiLoginModal').modal('show');
                }else if(!$scope.password){
                    $scope.notiLogin = $sce.trustAsHtml("Please enter password.");
                    $jq('#notiLoginModal').modal('show');
                }else{
                    openLoadingPopup();
                    $scope.email = $scope.email.toLowerCase();
                    console.log('loginAction');
                    var userXml = "<auth resource='mobileDispatcher' fleetId='"+$scope.fleetId + "' mechanism='PLAIN' xmlns='urn:ietf:params:xml:ns:xmpp-sasl'>"+($scope.email+':'+$scope.password)+"</auth>";
                    socket.emit('authenticate', userXml);
                }
            }
            //socket login
            socket.on('authenticate', function(data){
                if(data.status){
                    if(window.location.pathname === '/') {
                        var request = $http({
                            method: "post",
                            url: "/login",
                            data: {
                                user: data.info,
                                pass: $scope.password ? $scope.password : $scope.pass
                            }
                        });
                        request.success(function (dataS, status, headers, config) {
                            $cookies.u = $scope.email;
                            $cookies.p = $scope.password;
                            AuthService.login(data.info);
                            window.closeLoadingPopup();

                            if($state.current.name === "login"){
                                $state.go('new_booking');
                            }else{
                                $state.go($state.current.name);
                            }
                        });
                        request.error(function (dataS, status, headers, config) {
                            window.closeLoadingPopup();
                            alert('Error login');
                        });
                    }else{
                        window.closeLoadingPopup();
                    }
                }else{
                    window.closeLoadingPopup();
                    if(data.info && data.info == '417'){
                        $scope.notiLogin = $sce.trustAsHtml(" Your account has been inactive.<br> Please contact our adminitrators.");
                    }else{
                        $scope.notiLogin = $sce.trustAsHtml("The username or password is incorrect.");
                    }
                    if($jq('#notiLoginModal')){
                        $jq('#notiLoginModal').modal('show');
                    }else{
                        AuthService.logout();
                        $state.go('login');
                    }
                }
            });
        }
    ]);
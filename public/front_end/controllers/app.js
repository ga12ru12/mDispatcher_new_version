var MDispatcher = angular.module('mDispatcher', ['ui.router', "ngAnimate", 'ngCookies', 'ngImgCrop', 'anim-in-out',
    'serverConfig', 'services.socket', 'services.user', 'AuthService', 'NewBookingLocation', 'BookingService', 'MyBookingService',
    'LoginController', 'ForgotPasswordCtrl', 'SignUpCtrl', 'NewBookingCtrl', 'ChangePickupLocation',
    'ChangeDestinationLocation', 'ProfileDetailCtrl', 'ProfileEditCtrl', 'BookingCtrl', 'ReservationCtrl',
    'BookingDetailCtrl', 'ReportCtrl', 'ChangePassCtrl'
]);

var $jq = jQuery.noConflict();
MDispatcher.config(function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/');

    $stateProvider
        .state('login', {
            url: '/',
            templateUrl: '/front_end/views/login/login.html',
            controller: 'LoginCtrl',
            authenticate: false
        })
        .state('forgotPassword', {
            url: '/forgot_password',
            templateUrl: '/front_end/views/login/forgot_password.html',
            controller: 'ForgotPasswordCtrl',
            authenticate: false
        })
        .state('signup', {
            url: '/sign_up',
            templateUrl: '/front_end/views/login/sign_up.html',
            controller: 'SignUpCtrl',
            authenticate: false
        })
        .state('new_booking', {
            url: '/new_booking',
            templateUrl: '/front_end/views/new_booking/new_booking.html',
            controller: 'NewBookingCtrl',
            authenticate: true
        })
        .state('pickupLocation', {
            url: '/new_booking/change_pickup_location',
            templateUrl: '/front_end/views/new_booking/change_pickup_location.html',
            controller: 'ChangePickupLocation',
            authenticate: true
        })
        .state('destinationLocation', {
            url: '/new_booking/change_destination_location',
            templateUrl: '/front_end/views/new_booking/change_destination_location.html',
            controller: 'ChangeDestinationLocation',
            authenticate: true
        })
        .state('profile', {
            url: '/profile_detail',
            templateUrl: '/front_end/views/info/detail.html',
            controller: 'ProfileDetailCtrl',
            authenticate: true
        }).state('editProfile', {
            url: '/profile_edit',
            templateUrl: '/front_end/views/info/edit.html',
            controller: 'ProfileEditCtrl',
            authenticate: true
        })
        .state('my_booking', {
            url: '/my_booking',
            templateUrl: '/front_end/views/my_booking/index.html',
            authenticate: true
        })
        .state('my_booking.booking', {
            url: '/booking',
            templateUrl: '/front_end/views/my_booking/booking.html',
            controller: 'BookingCtrl',
            authenticate: true
        })
        .state('my_booking.reservation', {
            url: '/reservation',
            templateUrl: '/front_end/views/my_booking/reservation.html',
            controller: 'ReservationCtrl',
            authenticate: true
        })
        .state('booking_detail', {
            url: '/my_booking/booking_detail',
            templateUrl: '/front_end/views/my_booking/detail.html',
            controller: 'BookingDetailCtrl',
            authenticate: true
        })
        .state('report', {
            url: '/report',
            templateUrl: '/front_end/views/report/index.html',
            authenticate: true,
            controller: 'ReportCtrl'
        })
        .state('setting', {
            url: '/setting',
            templateUrl: '/front_end/views/setting/index.html',
            authenticate: true,
            controller: function($scope, $state) {
                $scope.transactionChangePass = function(){
                    $state.go('change_password');
                };
            }
        })
        .state('change_password', {
            url: '/setting/change_password',
            templateUrl: '/front_end/views/setting/change_password.html',
            authenticate: true,
            controller: 'ChangePassCtrl'
        })
        .state('logout', {
            url: '/logout',
            templateUrl: '/front_end/views/login/logout.html',
            authenticate: true,
            controller: function($scope, AuthService, $state, $cookies){
                AuthService.logout();
                delete $cookies.u;
                delete $cookies.p;
                $state.go('login');
            }
        });
});
MDispatcher.run(function($rootScope, $state, AuthService, serverConfig, socket, $http, $cookies, BookingService, MyBookingService) {
    $rootScope.$on("$stateChangeStart",
        function(event, toState, toParams, fromState, fromParams) {
            $jq('body').css('left', 'initial');
            if(!AuthService.isLoggedIn){
                if($cookies.u && $cookies.p){
                    var userXml = "<auth resource='mobileDispatcher' fleetId='"+serverConfig.getServerConfig().fleetId + "' mechanism='PLAIN' xmlns='urn:ietf:params:xml:ns:xmpp-sasl'>"+($cookies.u+':'+$cookies.p)+"</auth>";
                    socket.emit('authenticate', userXml);
                    window.openLoadingPopup();
                    console.log(userXml);
                    event.preventDefault();
                }else{
                    if(toState.authenticate){
                        $state.go("login");
                        event.preventDefault();
                    }
                }
            }else{
                if($state.current.name === 'login' || toState.name === 'login'){
                    $state.go('new_booking');
                    event.preventDefault();
                }
            }
            //socket login
            socket.on('authenticate', function(data){
                if($state.current.name !== 'login'){
                    if(data.status){
                        if(window.location.pathname === '/') {
                            var request = $http({
                                method: "post",
                                url: "/login",
                                data: {
                                    user: data.info,
                                    pass: $cookies.u
                                }
                            });
                            request.success(function (dataS, status, headers, config) {
                                window.closeLoadingPopup();
                                AuthService.login(data.info);
                                if($state.current.name === "login"){
                                    $state.go('new_booking');
                                    event.preventDefault();
                                }else{
                                    if($state.current.name === 'booking_detail'){
                                        $state.transitionTo('my_booking');
                                        event.preventDefault();
                                    }else{
                                        $state.go(toState.name);
                                        event.preventDefault();
                                    }
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
                        AuthService.logout();
                        $state.go('login');
                    }
                }
            });
            //Redirect when go my_booking
            if($state.current.name === 'my_booking' || toState.name === 'my_booking'){
                $state.go('my_booking.booking');
                event.preventDefault();
            }
        }
    );
    //socket accept job
    socket.on('acceptedJob', function(data) {
        console.log(data);
        $rootScope.notiBooning = 'The assigned driver has been accepted your request.';
        $jq('#bookingNotificationModal').modal('show');
    });
    //socket no driver accept
    socket.on('noDriver', function(data) {
        $rootScope.notiBooning = 'All the cars are busy now. We are sorry for any inconvenience caused. Please try again.';
        $jq('#bookingNotificationModal').modal('show');
    });

    //socket try Dispatch
    socket.on('tryDispatch', function(data) {
        $rootScope.notiBooning = 'All cars are busy now. We are trying to find the nearest car to you within several minutes';
        $jq('#bookingNotificationModal').modal('show');
    });

    //socket pickedUp
    socket.on('pickedUp', function(data){
        $scope.mDispatcherError = 'Your car is at the pick up location.';
        $jq('#bookingNotificationModal').modal('show');
    });

    //socket cancel
    socket.on('cancel', function(data){
        $scope.mDispatcherError = 'Your booking has been cancelled due to urgent reason. Please request a new booking.';
        $jq('#bookingNotificationModal').modal('show');
    });

    //socket pickedUp
    socket.on('noShow', function(data){
        $scope.mDispatcherError = 'The driver cannot locate you after numerous tries. Your request has been canceled.';
        $jq('#bookingNotificationModal').modal('show');
    });
});

MDispatcher.filter('orderObjectBy', function(){
    return function(input, attribute) {
        if (!angular.isObject(input)) return input;

        var array = [];
        for(var objectKey in input) {
            array.push(input[objectKey]);
        }

        array.sort(function(a, b){
            a = parseInt(a[attribute]);
            b = parseInt(b[attribute]);
            return b - a;
        });
        return array;
    }
});
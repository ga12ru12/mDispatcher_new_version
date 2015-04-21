angular.module('BookingDetailCtrl', [])
    .controller('BookingDetailCtrl', ['$scope', 'AuthService', '$http', 'serverConfig', '$state', '$sce',
        'socket', 'BookingService',
        function($scope, AuthService, $http, serverConfig, $state, $sce, socket, bookingService) {
            console.log(bookingService.detail);

            var passengerMarker = {
                geo: {
                    latitude: 16.0466947,
                    longitude: 108.20957999999996
                },
                id: 1,
                icon: '/images/cabzilla_icon/pinIcon.png',
                show: false
            };

            var tracking;
            var check = true;
            if(!bookingService.detail || (bookingService.detail && Object.keys(bookingService.detail).length === 0)){
                $state.go('my_booking');
            }
            $scope.bookingDetail = bookingService.detail;

            // instantiate google map objects for directions
            var directionsDisplay = new google.maps.DirectionsRenderer();
            var directionsService = new google.maps.DirectionsService();
            var geocoder = new google.maps.Geocoder();
            $scope.showDetail = function(){
                $jq('.myBookingDetailDiv .mainContent .infoBooking .detailConfirmed .showMore').slideToggle('slow');
            }
            // map object
            $scope.map = {
                control: {},
                center: {
                    latitude: $scope.bookingDetail.lat,
                    longitude: $scope.bookingDetail.lon
                },
                zoom: 17
            };

            $scope.map.events = {
                'tilesloaded': function (map) {
                    $scope.$apply(function () {
                        google.maps.event.trigger(map, "resize");
                        if(check){
                            $scope.getTrackingDriver();
                        }
                    });
                }
            };


            $scope.drawDirection = function(request){
                directionsService.route(request, function (response, status) {
                    console.log(response);
                    if (status === google.maps.DirectionsStatus.OK) {
                        directionsDisplay.setDirections(response);
                        directionsDisplay.setMap($scope.map.control.getGMap());
                    } else {
                        console.log('Google route unsuccesfull!');
                    }
                });
            }

            //get tracking of driver
            $scope.getTrackingDriver = function(){
                socket.emit('getTrackingByEmail', {fleetId: serverConfig.getServerConfig().fleetId, userId: AuthService.user.userId, driverEmail: $scope.bookingDetail.driverEmail});

            }

            $scope.driverMarker = {
                geo: {},
                id: 2,
                icon: '/images/cabzilla_icon/pinCarIcon.png'
            };
            //socket get tracking driver by email
            socket.on('getTrackingByEmail', function(data){
                if(data){
                    if(check){
                        var request = {
                            destination: new google.maps.LatLng($scope.bookingDetail.lat, $scope.bookingDetail.lon),
                            origin: new google.maps.LatLng(data.lat, data.lng),
                            travelMode: google.maps.DirectionsTravelMode.DRIVING
                        };
                        $scope.drawDirection(request);
                    }
                    $scope.driverMarker.geo = {
                        latitude: data.lat,
                        longitude: data.lng
                    }
                    setTimeout(function(){
                        socket.emit('getTrackingByEmail', {fleetId: serverConfig.getServerConfig().fleetId, userId: AuthService.user.userId, driverEmail: $scope.bookingDetail.driverEmail});
                    }, 10000);
                }
                check = false;
            });
        }
    ]);
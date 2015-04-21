angular.module('ChangePickupLocation', [])
    .controller('ChangePickupLocation', ['$scope', '$state', 'NewBookingLocation', 'serverConfig', 'AuthService', 'socket',
        function($scope, $state, location, serverConfig, AuthService, socket){
            $scope.changePickUpG = function(){
                location.pickupLocation.address = $scope.pickupLocation;
                location.pickupLocation.lat = $scope.pickupLat;
                location.pickupLocation.lng = $scope.pickupLng;
                location.pickupLocation.zipCode = $scope.pickupZipcode;
                location.pickupLocation.type = 'G';
                //console.log(location.pickupLocation);
                if(location.pickupLocation.lat && location.pickupLocation.lng && location.destinationLocation.lat && location.destinationLocation.lng){
                    socket.emit('getUnitTypebyFleetId', {fleetId: serverConfig.getServerConfig().fleetId, userId: AuthService.user.userId});
                }
                $state.go('new_booking');
            }
            $scope.changePickUpF = function(){
                location.pickupLocation.address = $scope.pickupLocation;
                location.pickupLocation.lat = $scope.pickupLat;
                location.pickupLocation.lng = $scope.pickupLng;
                location.pickupLocation.zipCode = $scope.pickupZipcode;
                location.pickupLocation.type = 'F';
                //console.log(location.pickupLocation);
                if(location.pickupLocation.lat && location.pickupLocation.lng && location.destinationLocation.lat && location.destinationLocation.lng){
                    socket.emit('getUnitTypebyFleetId', {fleetId: serverConfig.getServerConfig().fleetId, userId: AuthService.user.userId});
                }
                $state.go('new_booking');
            }
            $scope.seachPickupFours = function(){
                if(location.pickupLocation.lat && location.pickupLocation.lng){
                    autocompletePickupFoursByAddress($scope.pickupLocation, location.pickupLocation.lat, location.pickupLocation.lng, serverConfig.getServerConfig().client_id, serverConfig.getServerConfig().client_secret);
                }else{
                    autocompletePickupFoursByAddress($scope.pickupLocation, serverConfig.getServerConfig().defaultLocation[0], serverConfig.getServerConfig().defaultLocation[1], serverConfig.getServerConfig().client_id, serverConfig.getServerConfig().client_secret);
                }
            }
        }
    ]);


function autocompletePickupFoursByAddress(address, lat, lng, client_id, client_secret){
    console.log(address);
    if(lat && lng){
        $jq.ajax({
            type: 'GET',
            url: "https://api.foursquare.com/v2/venues/search?ll="+lat+","+lng+"&client_id="+client_id+"&client_secret="+client_secret+"&v=20140918&query="+address+'/',
            success: function (data) {
                var suggesstLocation = "";
                if(data.response.venues){
                    async.forEach(data.response.venues, function(venue, cb){
                        suggesstLocation += "<div>"
                        +venue.name+
                        "<input type='hidden' value='"+venue.location.lat+"' class='lat'>"+
                        "<input type='hidden' value='"+venue.location.lng+"' class='lng'>"+
                        "<input type='hidden' value='"+venue.name+"' class='name'>"+
                        "</div>";
                        cb();
                    }, function(){
                        $jq('.seachPickupBooking .content .autoCompleteDiv').html(suggesstLocation);
                    });
                }
            },
            error: function (request, status, error) {
                console.log(request.responseText);
            }
        });
    }else{
        alert("Geolocation is not supported by this browser. Please use google!");
    }
}
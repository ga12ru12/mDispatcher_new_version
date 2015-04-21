angular.module('ChangeDestinationLocation', [])
    .controller('ChangeDestinationLocation', ['$scope', '$state', 'NewBookingLocation', 'serverConfig', 'AuthService', 'socket',
        function($scope, $state, location, serverConfig, AuthService, socket){
            $scope.changeDestinationG = function(){
                location.destinationLocation.address = $scope.destinationLocation;
                location.destinationLocation.lat = $scope.destinationLat;
                location.destinationLocation.lng = $scope.destinationLng;
                location.destinationLocation.zipCode = $scope.destinationZipcode;
                location.destinationLocation.type = 'G';
                //console.log(location.destinationLocation);
                if(location.pickupLocation.lat && location.pickupLocation.lng && location.destinationLocation.lat && location.destinationLocation.lng){
                    socket.emit('getUnitTypebyFleetId', {fleetId: serverConfig.getServerConfig().fleetId, userId: AuthService.user.userId});
                }
                $state.go('new_booking');
            }
            $scope.changeDestinationF = function(){
                location.destinationLocation.address = $scope.destinationLocation;
                location.destinationLocation.lat = $scope.destinationLat;
                location.destinationLocation.lng = $scope.destinationLng;
                location.destinationLocation.zipCode = $scope.destinationZipcode;
                location.destinationLocation.type = 'F';
                //console.log(location.destinationLocation);
                if(location.pickupLocation.lat && location.pickupLocation.lng && location.destinationLocation.lat && location.destinationLocation.lng){
                    socket.emit('getUnitTypebyFleetId', {fleetId: serverConfig.getServerConfig().fleetId, userId: AuthService.user.userId});
                }
                $state.go('new_booking');
            }
            $scope.seachDestinationFours = function(){
                if(location.destinationLocation.lat && location.destinationLocation.lng){
                    autocompleteDestinationFoursByAddress($scope.destinationLocation, location.destinationLocation.lat, location.destinationLocation.lng, serverConfig.getServerConfig().client_id, serverConfig.getServerConfig().client_secret);
                }else{
                    autocompleteDestinationFoursByAddress($scope.destinationLocation, serverConfig.getServerConfig().defaultLocation[0], serverConfig.getServerConfig().defaultLocation[1], serverConfig.getServerConfig().client_id, serverConfig.getServerConfig().client_secret);
                }
            }
        }
    ]);


function autocompleteDestinationFoursByAddress(address, lat, lng, client_id, client_secret){
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
                        $jq('.seachDestinationBooking .content .autoCompleteDiv').html(suggesstLocation);
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
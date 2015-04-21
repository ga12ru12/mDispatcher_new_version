angular.module('NewBookingLocation', [])
    .factory('NewBookingLocation', [function(){
        var location = {
            pickupLocation: {

            },
            destinationLocation: {

            },
            date: ''
        }
        return location;
    }]
);
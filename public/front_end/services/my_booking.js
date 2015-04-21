angular.module('MyBookingService', [])
    .factory('MyBookingService', [function(){
        var booking = {
            listBooking: [],
            listReservation: []
        };
        return booking;
    }]
);
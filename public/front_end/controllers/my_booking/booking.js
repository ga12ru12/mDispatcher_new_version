angular.module('BookingCtrl', ['ngCookies'])
    .controller('BookingCtrl', ['$scope', 'AuthService', '$http', 'serverConfig', '$state', '$sce', '$cookies',
        'socket', 'BookingService', 'NewBookingLocation', 'MyBookingService',
        function($scope, AuthService, $http, serverConfig, $state, $sce, $cookies, socket, bookingService,
                 newBookingLocation, myBookingService) {
            $jq('.myBookingDiv .myBookingType .bookingBtn').removeClass('noSelected');
            $jq('.myBookingDiv .myBookingType .reservationBtn').addClass('noSelected');
            $scope.datesOfMyBooking = [];
            //Get all booking by Date
            $scope.getBookingByDate = function(date){
                checkStatusDatesOfBooking($scope, date, function(status){
                    //$jq('.collapse').collapse('hide');
                    if(!status){
                        socket.emit('getBookingByDate', {fleetId: serverConfig.getServerConfig().fleetId, userId: AuthService.user.userId, date: date.replace('a', '')});
                        //openLoadingPopup();
                    }
                });
            }
            //Get all date booking from server dispatch
            $scope.getDateOfBooking = function(){
                async.whilst(
                    function () { return (!AuthService.user); },
                    function (callback) {
                        setTimeout(callback, 1000);
                    },
                    function (err) {
                        socket.emit('getDateOfBooking', {fleetId: serverConfig.getServerConfig().fleetId, userId: AuthService.user.userId});
                        openLoadingPopup();
                    }
                );
            }
            $scope.getDateOfBooking();

            $scope.showDetail = function(date, bookId){
                if($scope.bookings[date] && $scope.bookings[date][bookId]){
                    $scope.bookingDetail = $scope.bookings[date][bookId];
                    bookingService.detail = $scope.bookingDetail;
                }
                $state.go('booking_detail');
            }

            //Socket get date Booking
            socket.on('getDateOfBooking', function(data){
                if(data.dates.length > 0){
                    $jq('.noBooking').hide();
                }else{
                    $jq('.noBooking').show();
                }
                closeLoadingPopup();
                async.forEach(data.dates, function(date, cb){
                    var temp = date.slice(4,6)+'/'+date.slice(2,4)+'/'+20+date.slice(0,2);
                    $scope.datesOfMyBooking.push({display: temp, id: 'a'+date, index: date, show: false});
                    cb();
                }, function(){
                    setTimeout(function(){
                        if(newBookingLocation.date && data.dates.indexOf(newBookingLocation.date) !== -1){
                            $jq('#a'+newBookingLocation.date).parent().find('a').trigger( "click" );
                        }else{
                            var latest = 0;
                            async.forEach(data.dates, function(date, cb){
                                var num = parseInt(date);
                                if(num > latest){
                                    latest = num;
                                }
                                cb();
                            }, function(){
                                $jq('#a'+latest).parent().find('a').trigger( "click" );
                            });
                        }
                    }, 1000);
                });
            });

            socket.on('getBookingByDate', function(data){
                closeLoadingPopup();
                $scope.bookings = {};
                if(data.listBooking && data.listBooking.length > 0){
                    var date = 'a'+data.listBooking[0].pickupFullMoment.slice(0,6);
                    var newListBooking = {};
                    async.forEach(data.listBooking, function(booking, cb){
                        switch (booking.status){
                            case 'offered':
                                booking.statusMobileDispatcher = 'Pending';
                                booking.showDetail = true;
                                break;
                            case 'queue':
                                booking.statusMobileDispatcher = 'Pending';
                                booking.showDetail = true;
                                break;
                            case 'action':
                                booking.statusMobileDispatcher = 'Pending';
                                booking.showDetail = true;
                                break;
                            case 'booked':
                                booking.statusMobileDispatcher = 'Confirmed';
                                booking.showDetail = true;
                                break;
                            case 'droppedOff':
                                booking.statusMobileDispatcher = 'Pass on board';
                                booking.showDetail = false;
                                break;
                            case 'engaged':
                                booking.statusMobileDispatcher = 'Pass on board';
                                booking.showDetail = false;
                                break;
                            case 'noShow':
                                booking.statusMobileDispatcher = 'No Show';
                                booking.showDetail = false;
                                break;
                            case 'canceled':
                                booking.statusMobileDispatcher = "Canceled by "+booking.canceller;
                                booking.showDetail = false;
                                break;
                            case 'completed':
                                booking.statusMobileDispatcher = "Completed";
                                booking.showDetail = false;
                                break;
                        }
                        booking.pickupTimeMoment = new moment(booking.pickupTimeMoment, 'HHmmss').format('HH:mm A');
                        newListBooking[booking.bookId] = booking;
                        cb();
                    }, function(){
                        $scope.bookings[date] = newListBooking;
                        myBookingService.listBooking = $scope.bookings;
                        //setTimeout(function(){
                        //    $jq('#'+date).collapse('show');
                        //}, 500);
                    });
                }
            });

            socket.on('acceptedJob', function(data) {
                if(data.pickupTimeNumber){
                    var date = data.pickupTimeNumber.slice(0,6);
                    if($scope.bookings && $scope.bookings['a'+date] && $scope.bookings['a'+date][data.bookId]
                        && data.reservation === '0'){
                            $scope.bookings['a'+date][data.bookId] = _.extend($scope.bookings['a'+date][data.bookId], data);
                            $scope.bookings['a'+date][data.bookId].status = 'booked';
                            updateStatusMDispatcher($scope.bookings['a'+date][data.bookId]);
                    }
                }
            });
            //socket no driver accept
            socket.on('noDriver', function(data) {
                if(data.pickupTimeNumber){
                    var date = data.pickupTimeNumber.slice(0,6);
                    if($scope.bookings && $scope.bookings['a'+date] && $scope.bookings['a'+date][data.bookId]){
                        if(data.reservation === '0'){
                            if(data.canceller){
                                $scope.bookings['a'+date][data.bookId].statusMobileDispatcher = "Canceled by "+data.canceller;
                            }else{
                                $scope.bookings['a'+date][data.bookId].statusMobileDispatcher = "Canceled";
                            }
                            $scope.bookings['a'+date][data.bookId].showDetail = false;
                            $scope.bookings['a'+date][data.bookId].status = 'canceled';
                        }
                    }
                }
            });
            socket.on('completed', function(data){
                if(data.pickupTimeNumber){
                    var date = data.pickupTimeNumber.slice(0,6);
                    if($scope.bookings && $scope.bookings['a'+date] && $scope.bookings['a'+date][data.bookId]){
                        if(data.reservation === '0'){
                            $scope.bookings['a'+date][data.bookId].status = 'completed';
                            updateStatusMDispatcher($scope.bookings['a'+date][data.bookId]);
                        }
                    }
                }
            });

            socket.on('editBooking', function(data){
                if(data.pickupTimeNumber){
                    var date = data.pickupTimeNumber.slice(0,6);
                    if($scope.bookings && $scope.bookings['a'+date] && $scope.bookings['a'+date][data.bookId]){
                        if(data.reservation === '0'){
                            $scope.bookings['a'+date][data.bookId] = _.extend($scope.bookings['a'+date][data.bookId], data);
                            updateStatusMDispatcher($scope.bookings['a'+date][data.bookId]);
                        }
                    }
                }
            });

            //socket pickedUp
            socket.on('pickedUp', function(data){
                if(data.pickupTimeNumber){
                    var date = data.pickupTimeNumber.slice(0,6);
                    if($scope.bookings && $scope.bookings['a'+date] && $scope.bookings['a'+date][data.bookId]){
                        if(data.reservation === '0'){
                            $scope.bookings['a'+date][data.bookId].status = 'engaged';
                            updateStatusMDispatcher($scope.bookings['a'+date][data.bookId]);
                        }
                    }
                }
            });

            //socket cancel
            socket.on('cancel', function(data){
                if(data.pickupTimeNumber){
                    var date = data.pickupTimeNumber.slice(0,6);
                    if($scope.bookings && $scope.bookings['a'+date] && $scope.bookings['a'+date][data.bookId]){
                        if(data.reservation === '0'){
                            if(data.canceller){
                                $scope.bookings['a'+date][data.bookId].statusMobileDispatcher = "Canceled by "+data.canceller;
                            }else{
                                $scope.bookings['a'+date][data.bookId].statusMobileDispatcher = "Canceled";
                            }
                            $scope.bookings['a'+date][data.bookId].showDetail = false;
                            $scope.bookings['a'+date][data.bookId].status = 'canceled';
                        }
                    }
                }
            });

            //socket pickedUp
            socket.on('noShow', function(data){
                if(data.pickupTimeNumber){
                    var date = data.pickupTimeNumber.slice(0,6);
                    if($scope.bookings && $scope.bookings['a'+date] && $scope.bookings['a'+date][data.bookId]){
                        if(data.reservation === '0'){
                            $scope.bookings['a'+date][data.bookId].status = 'noShow';
                            updateStatusMDispatcher($scope.bookings['a'+date][data.bookId]);
                        }
                    }
                }
            });

        }
    ]);

//Check status of date booking
function checkStatusDatesOfBooking($scope, date, callback){
    var status;
    async.forEach($scope.datesOfMyBooking, function(booking, cb){
        if(booking.id === date){
            status = Boolean(booking.show);
            booking.show = !booking.show;
        }else{
            booking.show = false;
        }
        cb();
    }, function(){
        return callback(status);
    });
}

//Update status for mDispatcher
function updateStatusMDispatcher(booking){
    switch (booking.status){
        case 'offered':
            booking.statusMobileDispatcher = 'Pending';
            booking.showDetail = true;
            break;
        case 'queue':
            booking.statusMobileDispatcher = 'Pending';
            booking.showDetail = true;
            break;
        case 'action':
            booking.statusMobileDispatcher = 'Pending';
            booking.showDetail = true;
            break;
        case 'booked':
            booking.statusMobileDispatcher = 'Confirmed';
            booking.showDetail = true;
            break;
        case 'droppedOff':
            booking.statusMobileDispatcher = 'Pass on board';
            booking.showDetail = false;
            break;
        case 'engaged':
            booking.statusMobileDispatcher = 'Pass on board';
            booking.showDetail = false;
            break;
        case 'noShow':
            booking.statusMobileDispatcher = 'No Show';
            booking.showDetail = false;
            break;
        case 'canceled':
            booking.statusMobileDispatcher = "Canceled by "+booking.canceller;
            booking.showDetail = false;
            break;
        case 'completed':
            booking.statusMobileDispatcher = "Completed";
            booking.showDetail = false;
            break;
    }
}
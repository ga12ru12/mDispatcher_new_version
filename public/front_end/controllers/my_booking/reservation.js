angular.module('ReservationCtrl', ['ngCookies'])
    .controller('ReservationCtrl', ['$scope', 'AuthService', '$http', 'serverConfig', '$state', '$sce', '$cookies',
        'socket', 'NewBookingLocation', 'MyBookingService',
        function($scope, AuthService, $http, serverConfig, $state, $sce, $cookies, socket, newBookingLocation, myBookingService) {
            $jq('.myBookingDiv .myBookingType .reservationBtn').removeClass('noSelected');
            $jq('.myBookingDiv .myBookingType .bookingBtn').addClass('noSelected');
            //Get all date reservations from server dispatch
            $scope.getDateOfReservation = function(){
                socket.emit('getDateOfReservation', {fleetId: serverConfig.getServerConfig().fleetId, userId: AuthService.user.userId});
                openLoadingPopup();
            }
            $scope.getDateOfReservation();

            //Get all Reservation by Date
            $scope.getReservationByDate = function(date){
                checkStatusDatesOfReservation($scope, date, function(status){
                    if(!status){
                        socket.emit('getReservationByDate', {fleetId: serverConfig.getServerConfig().fleetId, userId: AuthService.user.userId, date: date.replace('a', '')});
                        openLoadingPopup();
                    }else{
                        $jq('#'+date).collapse('hide');
                    }
                });
            }

            //Socket get date Reservation
            socket.on('getDateOfReservation', function(data){
                if(data.dates.length > 0){
                    $jq('.noReservation').hide();
                }else{
                    $jq('.noReservation').show();
                }
                closeLoadingPopup();
                $scope.datesOfMyReservation = [];
                async.forEach(data.dates, function(date, cb){
                    var temp = date.slice(4,6)+'/'+date.slice(2,4)+'/'+20+date.slice(0,2);
                    $scope.datesOfMyReservation.push({display: temp, id: 'a'+date, index: date, show: false});
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

            //Socket get booking by date
            socket.on('getReservationByDate', function(data){
                closeLoadingPopup();
                $scope.reservations = {};
                if(data.listBooking && data.listBooking.length > 0){
                    var date = 'a'+data.listBooking[0].pickupFullMoment.slice(0,6);
                    var newListBooking = {};
                    async.forEach(data.listBooking, function(booking, cb){
                        switch (booking.status){
                            case 'pre':
                                booking.statusMobileDispatcher = 'Pending';
                                booking.showDetail = true;
                                break;
                            case 'offer':
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
                        $scope.reservations[date] = newListBooking;
                        myBookingService.listReservation = $scope.reservations;
                        //$jq('#'+date).collapse('show');
                    });
                }
            });

            //socket accept job
            socket.on('acceptedJob', function(data) {
                console.log(data);
                if(data.pickupTimeNumber){
                    var date = data.pickupTimeNumber.slice(0,6);
                    if($scope.reservations && $scope.reservations['a'+date] && $scope.reservations['a'+date][data.bookId]){
                        if(data.reservation === '1'){
                            $scope.reservations['a'+date][data.bookId] = _.extend($scope.reservations['a'+date][data.bookId], data);
                            $scope.reservations['a'+date][data.bookId].status = 'booked';
                            console.log($scope.reservations['a'+date][data.bookId]);
                            updateStatusMDispatcher($scope.reservations['a'+date][data.bookId]);
                        }
                    }
                }
            });
            //socket no driver accept
            socket.on('noDriver', function(data) {
                if(data.pickupTimeNumber){
                    var date = data.pickupTimeNumber.slice(0,6);
                    if($scope.reservations && $scope.reservations['a'+date] && $scope.reservations['a'+date][data.bookId]){
                        if(data.reservation === '1'){
                            if(data.canceller){
                                $scope.reservations['a'+date][data.bookId].statusMobileDispatcher = "Canceled by "+data.canceller;
                            }else{
                                $scope.reservations['a'+date][data.bookId].statusMobileDispatcher = "Canceled";
                            }
                            $scope.reservations['a'+date][data.bookId].showDetail = false;
                            $scope.reservations['a'+date][data.bookId].status = 'canceled';
                        }
                    }
                }
            });
            socket.on('completed', function(data){
                if(data.pickupTimeNumber){
                    var date = data.pickupTimeNumber.slice(0,6);
                    if($scope.reservations && $scope.reservations['a'+date] && $scope.reservations['a'+date][data.bookId]){
                        if(data.reservation === '1'){
                            $scope.reservations['a'+date][data.bookId].status = 'completed';
                            updateStatusMDispatcher($scope.reservations['a'+date][data.bookId]);
                        }
                    }
                }
            });

            socket.on('editBooking', function(data){
                if(data.pickupTimeNumber){
                    var date = data.pickupTimeNumber.slice(0,6);
                    if($scope.reservations && $scope.reservations['a'+date] && $scope.reservations['a'+date][data.bookId]){
                        if(data.reservation === '1'){
                            $scope.reservations['a'+date][data.bookId] = _.extend($scope.reservations['a'+date][data.bookId], data);
                            updateStatusMDispatcher($scope.reservations['a'+date][data.bookId]);
                        }
                    }
                }
            });

            //socket pickedUp
            socket.on('pickedUp', function(data){
                if(data.pickupTimeNumber){
                    var date = data.pickupTimeNumber.slice(0,6);
                    if($scope.reservations && $scope.reservations['a'+date] && $scope.reservations['a'+date][data.bookId]){
                        if(data.reservation === '1'){
                            $scope.reservations['a'+date][data.bookId].status = 'engaged';
                            updateStatusMDispatcher($scope.reservations['a'+date][data.bookId]);
                        }
                    }
                }
            });

            //socket cancel
            socket.on('cancel', function(data){
                if(data.pickupTimeNumber){
                    var date = data.pickupTimeNumber.slice(0,6);
                    if($scope.reservations && $scope.reservations['a'+date] && $scope.reservations['a'+date][data.bookId]){
                        if(data.reservation === '1'){
                            if(data.canceller){
                                $scope.reservations['a'+date][data.bookId].statusMobileDispatcher = "Canceled by "+data.canceller;
                            }else{
                                $scope.reservations['a'+date][data.bookId].statusMobileDispatcher = "Canceled";
                            }
                            $scope.reservations['a'+date][data.bookId].showDetail = false;
                        }
                    }
                }
            });

            //socket pickedUp
            socket.on('noShow', function(data){
                if(data.pickupTimeNumber){
                    var date = data.pickupTimeNumber.slice(0,6);
                    if($scope.reservations && $scope.reservations['a'+date] && $scope.reservations['a'+date][data.bookId]){
                        if(data.reservation === '1'){
                            $scope.reservations['a'+date][data.bookId].status = 'noShow';
                            updateStatusMDispatcher($scope.reservations['a'+date][data.bookId]);
                        }
                    }
                }
            });
        }
    ]);

//Check status of date reservations
function checkStatusDatesOfReservation($scope, date, callback){
    var status;
    async.forEach($scope.datesOfMyReservation, function(booking, cb){
        if(booking.id === date){
            status = Boolean(booking.show);
            booking.show = !booking.show;
        }
        cb();
    }, function(){
        return callback(status);
    });
}
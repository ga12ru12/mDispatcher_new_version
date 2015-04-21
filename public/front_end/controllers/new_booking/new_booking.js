var messageRequestBooking = {
    '-1' : 'New booking successfully',
    '0' : 'There are no booking services available in this area.',
    '1' : 'The time you have selected  must be later than the current time.',
    '2' : 'Server error when add new booking',
    '3' : "Manual: Your driver don't accept",
    '4' : 'All the cars are busy now. We are sorry for any inconvenience caused. Please try again.',
    '5' : 'This customer has been deactivate!',
    '6' : 'Your data input is incorrect. please check it and try again!',
    'BUSY' : 'All the cars are busy now. We are sorry for any inconvenience caused. Please try again.'
};
angular.module('NewBookingCtrl', ['uiGmapgoogle-maps', 'anim-in-out'])
    .controller('NewBookingCtrl', ['$scope', '$http', '$state', '$timeout', 'serverConfig',
        'socket', 'NewBookingLocation', 'AuthService', '$sce',
        function($scope, $http, $state, $timeout, serverConfig, socket, newBookingLocation, AuthService, $sce){
            $scope.hourOptions = serverConfig.getServerConfig().reportHours;
            $scope.hour = _.find($scope.hourOptions, function(num){ return num.value === new moment().format('hh A'); });
            $scope.minuteOptions = serverConfig.getServerConfig().reportMinutes;
            $scope.minute = _.find($scope.minuteOptions, function(num){ return num.value == new moment().format('mm'); });
            $scope.timeNewBooking = 'Now';
            $scope.timePicker = new moment().format('MM/DD/YYYY');

            var getDriverNearByInterval;
            $scope.blackCarMarkers = [];
            $scope.taxiMarkers = [];
            //Setting map
            $scope.backCarIcon = "/images/cabzilla_icon/pinBlackCar.png";
            $scope.taxiIcon = "/images/cabzilla_icon/pinCarIcon.png";
            $scope.map = {};
            $scope.map.zoom = 15;
            //console.log(newBookingLocation.pickupLocation);
            if(newBookingLocation.pickupLocation.lat && newBookingLocation.pickupLocation.lng){
                $scope.map.center = { latitude: newBookingLocation.pickupLocation.lat, longitude: newBookingLocation.pickupLocation.lng };
                if(newBookingLocation.pickupLocation.type !== 'F'){
                    displayPickup(newBookingLocation.pickupLocation.address, $scope);
                }else{
                    $scope.addressFromNumber = '';
                    $scope.addressFromRoad = newBookingLocation.pickupLocation.address;
                }
            }else{
                navigator.geolocation.getCurrentPosition(function(loc) {
                    var coord = [loc.coords.longitude, loc.coords.latitude];
                    $scope.map.center = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
                    newBookingLocation.pickupLocation.lat = loc.coords.latitude;
                    newBookingLocation.pickupLocation.lng = loc.coords.longitude;
                    $scope.$apply();
                    $scope.setVehicleType('any');
                    if(newBookingLocation.pickupLocation.lat && newBookingLocation.pickupLocation.lng && newBookingLocation.destinationLocation.lat && newBookingLocation.destinationLocation.lng){
                        socket.emit('getUnitTypebyFleetId', {fleetId: serverConfig.getServerConfig().fleetId, userId: AuthService.user.userId});
                    }
                });
            }
            if(newBookingLocation.destinationLocation && newBookingLocation.destinationLocation.lat && newBookingLocation.destinationLocation.lng){
                //console.log(newBookingLocation);
                displayDestination(newBookingLocation.destinationLocation.address, $scope);
                $jq('.moreInfo').show();
            }
            $scope.map.events = {
                'tilesloaded': function (map) {
                        $scope.$apply(function () {
                            //google.maps.event.trigger(map, "resize");
                            if($jq(map.getDiv()).find('.centerMarker').length === 0){
                                $jq('<div/>').addClass('centerMarker').appendTo(map.getDiv());
                            }
                            if(!newBookingLocation.pickupLocation.type){
                                getAddressByLatLng(new google.maps.LatLng($scope.map.center.latitude, $scope.map.center.longitude), function(address){
                                    displayPickup(address, $scope);
                                });
                            }
                            $scope.setVehicleType('any');
                            //map.setCenter(new google.maps.LatLng($scope.map.center.latitude, $scope.map.center.longitude));
                            setTimeout(function(){
                                google.maps.event.trigger(map, "resize");
                                map.setCenter(new google.maps.LatLng($scope.map.center.latitude, $scope.map.center.longitude));
                            },500);
                        });
                },
                'dragend': function(map){
                    $scope.map.center.latitude = map.getCenter().lat();
                    $scope.map.center.longitude = map.getCenter().lng();
                    newBookingLocation.pickupLocation.lat = map.getCenter().lat();
                    newBookingLocation.pickupLocation.lng = map.getCenter().lng();

                    if(newBookingLocation.pickupLocation.lat && newBookingLocation.pickupLocation.lng && newBookingLocation.destinationLocation.lat && newBookingLocation.destinationLocation.lng){
                        socket.emit('getUnitTypebyFleetId', {fleetId: serverConfig.getServerConfig().fleetId, userId: AuthService.user.userId});
                    }
                    $scope.getDriverNearBy();
                    getAddressByLatLng(new google.maps.LatLng(map.getCenter().lat(), map.getCenter().lng()), function(address){
                        displayPickup(address, $scope);
                        $scope.$apply();
                    });
                }
            };

            //Event when change time booking
            $scope.changeTimeNewBooking = function(){
                var timeBooking = new moment($scope.timePicker +' '+$scope.hour.value +':'+$scope.minute.value , 'MM/DD/YYYY hh A:mm');
                var subtract = timeBooking.diff(new moment());
                if(subtract < 1*60*1000){
                    $scope.timeNewBooking = 'Now';
                    $jq('#time').val('Now');
                }else{
                    $scope.timeNewBooking = new moment($scope.timePicker +' '+$scope.hour.value +':'+$scope.minute.value , 'MM/DD/YYYY hh A:mm').format('MM/DD/YYYY hh:mm A');
                }
                $jq('#dateTimePickerModal').modal('hide');
            }

            //Request new booking
            $scope.requestBooking = function(){
                if($scope.lat && $scope.lng && $scope.addressFromRoad){
                    request();
                }else{
                    if($scope.addressFromRoad){
                        var address = $scope.addressFromNumber ? $scope.addressFromNumber+' '+$scope.addressFromRoad : $scope.addressFromRoad;
                        getLatLngByAddress(address, function(latLng){
                            newBookingLocation.pickupLocation.lat = latLng.lat;
                            newBookingLocation.pickupLocation.lng = latLng.lng;
                            request();
                        });
                    }else{
                        request();
                    }
                }
                function request(){
                    validateRequestBooking($scope, function(status){
                        if(status){
                            openLoadingPopup();
                            if($scope.timeNewBooking === 'Now' || !$scope.timeNewBooking){
                                $scope.timeBooking = 'ASAP';
                                newBookingLocation.date = new moment().format('YYMMDD');
                            }else{
                                $scope.timeBooking = new moment($scope.timeNewBooking, 'MM/DD/YYYY hh:mm A').format('MMM DD, YYYY h:mm A');
                                newBookingLocation.date = new moment($scope.timeNewBooking, 'MM/DD/YYYY hh:mm A').format('YYMMDD');
                            }
                            var customerEmail =  $scope.emailRequestInfo;
                            if(!customerEmail){
                                customerEmail = AuthService.user.userId+'@gmail.com';
                            }
                            var bookingFrom = convertEmail(customerEmail)+"@"+serverConfig.getServerConfig().hostUrl;
                            var passengerId = AuthService.user.userId;
                            if(passengerId==="") passengerId = AuthService.user.userId;
                            var businessAddressTo = newBookingLocation.pickupLocation.type === 'F' ? "<![CDATA["+newBookingLocation.pickupLocation.address+"]]>": "";
                            var businessAddressFrom = newBookingLocation.destinationLocation.type === 'F' ? "<![CDATA["+newBookingLocation.destinationLocation.address+"]]>": "";
                            var latTo = newBookingLocation.destinationLocation.lat ? "<![CDATA["+newBookingLocation.destinationLocation.lat +"]]>" : '';
                            var lngTo = newBookingLocation.destinationLocation.lng ? "<![CDATA["+newBookingLocation.destinationLocation.lng +"]]>" : '';
                            var note = $scope.note ? "<![CDATA["+$scope.note+"]]>" : '';
                            var vht = $scope.vehicleTypeRequest === '*' ? 'Any':$scope.vehicleTypeRequest;
                            if(!$scope.addressFromNumber){
                                $scope.addressFromNumber = '';
                            }
                            if(!$scope.addressToNumber){
                                $scope.addressToNumber = '';
                            }
                            var zipcodeFrom = newBookingLocation.pickupLocation.zipCode ? newBookingLocation.pickupLocation.zipCode:'';
                            var zipcodeTo = newBookingLocation.destinationLocation.zipCode ? newBookingLocation.destinationLocation.zipCode:'';
                            var addressTo = $scope.addressToRoad ? "<![CDATA["+$scope.addressToNumber +" "+ $scope.addressToRoad+"]]>":"";
                            var dispatchString  ="<iq type='get' from='"+bookingFrom+"' action='requestBooking'><x xmlns='jabber:x:data' type='form'>" +
                                "<field var='bookIdInPassenger'><value>"+new Date().getMilliseconds()+"</value></field>" +
                                "<field var='passengerEmailXmpp'><value><![CDATA["+bookingFrom+"]]></value></field>" +
                                "<field var='passengerEmail'><value><![CDATA["+customerEmail+"]]></value></field>" +
                                "<field var='passengerName'><value><![CDATA["+$scope.nameRequestInfo+"]]></value></field>" +
                                "<field var='passengerPhone'><value><![CDATA["+$scope.phoneRequestInfo+"]]></value></field>" +
                                "<field var='passengerId'><value><![CDATA["+passengerId+"]]></value></field>" +
                                "<field var='timeDateByFleet'><value><![CDATA["+$scope.timeBooking+"]]></value></field>" +
                                "<field var='address'><value><![CDATA["+$scope.addressFromNumber +" "+ $scope.addressFromRoad+"]]></value></field>" +
                                "<field var='lat'><value><![CDATA["+ newBookingLocation.pickupLocation.lat +"]]></value></field>" +
                                "<field var='lon'><value><![CDATA["+ newBookingLocation.pickupLocation.lng +"]]></value></field>" +
                                "<field var='addressTo'><value>"+addressTo+"</value></field>" +
                                "<field var='latTo'><value>"+latTo+"</value></field>" +
                                "<field var='lonTo'><value>"+lngTo+"</value></field>" +
                                "<field var='vehicle'><value>"+vht+"</value></field>" +
                                "<field var='dispatch'><value>1</value></field>" +
                                "<field var='vehicleId'><value></value></field>" +
                                "<field var='driverEmail'><value></value></field>" +
                                "<field var='note'><value>"+note+"</value></field>" +
                                "<field var='fleetId'><value>"+serverConfig.getServerConfig().fleetId+"</value></field>" +
                                "<field var='avatar'><value></value></field>" +
                                "<field var='fromZipCode'><value><![CDATA["+ zipcodeFrom +"]]></value></field>" +
                                "<field var='toZipCode'><value><![CDATA["+ zipcodeTo +"]]></value></field>" +
                                "<field var='businessAddressTo'><value>"+businessAddressTo+ "</value></field>" +
                                "<field var='businessAddressFrom'><value>"+businessAddressFrom+ "</value></field>" +
                                "<field var='dispatcherId'><value><![CDATA["+passengerId+"]]></value></field>" +
                                "<field var='platform'><value><![CDATA[Mobile Web]]></value></field>" +
                                "<field var='bookFrom'><value><![CDATA[Partner]]></value></field>" +
                                "</x></iq>";
                            //console.log(dispatchString);
                            //alert(newBookingLocation.date);
                            socket.emit('stanza', dispatchString);
                        }
                    });
                }
            }

            //Get vehicleType Request
            $scope.setVehicleType = function(vehicleType){
                switch (vehicleType){
                    case 'any':
                        $scope.vehicleTypeRequest = '*';
                        break;
                    case 'blackcar':
                        $scope.vehicleTypeRequest = '["Black Car","SUV"]';
                        break;
                    case 'suv':
                        $scope.vehicleTypeRequest = "SUV";
                        break;
                    case 'taxi':
                        $scope.vehicleTypeRequest = '["Taxi","Taxi Van"]';
                        break;
                    case 'taxivan':
                        $scope.vehicleTypeRequest = "Taxi Van";
                        break;
                    default :
                        $scope.vehicleTypeRequest = '*';
                        break;
                }
                $scope.getDriverNearBy();
                //$scope.changeVehicleCalFareAgaint();
            }

            $scope.getDriverNearBy = function(){
                if(getDriverNearByInterval){
                    clearInterval(getDriverNearByInterval);
                }
                async.whilst(
                    function () { return (!$scope.map.center.latitude && !$scope.map.center.longitude); },
                    function (callback) {
                        setTimeout(callback, 2000);
                    },
                    function (err) {
                        socket.emit('getDriverNear', {fleetId: serverConfig.getServerConfig().fleetId, lat: $scope.map.center.latitude, lon: $scope.map.center.longitude, vehicleType: $scope.vehicleTypeRequest});
                    }
                );
            }

            //Calculation fare of new bookinf
            $scope.calFaeBooking = function(distance){
                var vehicleId;
                switch ($scope.vehicleTypeRequest){
                    case '*':
                        vehicleId = 'Any';
                        break;
                    case '["Black Car","SUV"]':
                        vehicleId = "Black Car";
                        break;
                    case 'SUV':
                        vehicleId = "SUV";
                        break;
                    case '["Taxi","Taxi Van"]':
                        vehicleId = 'Taxi';
                        break;
                    case 'Taxi Van':
                        vehicleId = "Taxi Van";
                        break;
                }
                if($scope.timeNewBooking === 'Now' || !$scope.timeNewBooking){
                    $scope.timeBooking = 'ASAP';
                }else{
                    $scope.timeBooking = new moment($scope.timeNewBooking, 'MM/DD/YYYY hh:mm A').format('MMM DD, YYYY h:mm A');
                }
                var request = $http({
                    method  : 'post',
                    url     : '/newBooking/calFare',
                    data    : {
                        merchantId   : serverConfig.getServerConfig().fleetId,
                        distance    : distance,
                        vehicleTypeId: vehicleId,
                        zipCodeFrom: newBookingLocation.pickupLocation.zipCode ? newBookingLocation.pickupLocation.zipCode:'',
                        zipCodeTo: newBookingLocation.destinationLocation.zipCode ? newBookingLocation.destinationLocation.zipCode:'',
                        timeDate    : $scope.timeBooking
                    }
                });
                request.success(function(data,status){
                    if(data && data !== false && status == 200){
                        $scope.fareNewbooking = data;
                    }
                });
                request.error(function(status){
                    console.log('Server have error. Please try later!');
                });
            }

            $scope.requestBookResultAction = function(){
                if(newBookingLocation.type === '0'){
                    $state.go('my_booking.booking');
                }else{
                    $state.go('my_booking.reservation');
                }
            }

            //socket get all driver
            socket.on('getDriverNear', function(data){
                //console.log(data);
                if(getDriverNearByInterval){
                    clearInterval(getDriverNearByInterval);
                }
                if(data.result['Taxi Van'] || data.result['Taxi'] || data.result['SUV'] || data.result['Black Car'] ){
                    if (data.result['SUV']){
                        if(data.result['Black Car']){
                            $scope.blackCarMarkers = data.result['SUV'].concat(data.result['Black Car']);
                        }else{
                            $scope.blackCarMarkers = data.result['SUV'];
                        }
                    }else{
                        if(data.result['Black Car']){
                            $scope.blackCarMarkers = data.result['Black Car'];
                        }else{
                            $scope.blackCarMarkers = [];
                        }
                    }
                    if (data.result['Taxi Van']){
                        if(data.result['Taxi']){
                            $scope.taxiMarkers = data.result['Taxi Van'].concat(data.result['Taxi']);
                        }else{
                            $scope.taxiMarkers = data.result['Taxi Van'];
                        }
                    }else{
                        if(data.result['Taxi']){
                            $scope.taxiMarkers = data.result['Taxi'];
                        }else{
                            $scope.taxiMarkers = [];
                        }
                    }
                    calDurationDriverNear({lat: $scope.map.center.latitude, lng: $scope.map.center.longitude}, $scope.blackCarMarkers, $scope.taxiMarkers, function(duration){
                        if(duration){
                            $scope.messageNewBooking = 'Closest driver is ' + duration + ' away';
                            $scope.$apply();
                        }
                    });
                }else{
                    $scope.blackCarMarkers = [];
                    $scope.taxiMarkers = [];
                    $scope.messageNewBooking = 'No drivers currently available';
                }
                getDriverNearByInterval = setInterval(function(){
                    socket.emit('getDriverNear', {fleetId: serverConfig.getServerConfig().fleetId, lat: $scope.map.center.latitude, lon: $scope.map.center.longitude, vehicleType: $scope.vehicleTypeRequest});
                }, 10000);
            });

            //Socket get unit distance type
            socket.on('getUnitTypebyFleetId', function(data){
                calDistance($scope, newBookingLocation.pickupLocation.lat, newBookingLocation.pickupLocation.lng,
                    newBookingLocation.destinationLocation.lat, newBookingLocation.destinationLocation.lng, data);
            });

            //Socket request booking
            socket.on('stanza', function(data){
                closeLoadingPopup();
                console.log(data);
                data.error = data.error+ '';
                if(data.status){
                    if(data.error === '-1'){
                        if(data.level && data.level === 2){
                            $scope.requestBookingResult = $sce.trustAsHtml('Your reservation has been booked successfully. A reminder will be sent to you prior to ride pick-up.');
                            newBookingLocation.type = '1';
                        }else{
                            $scope.requestBookingResult = $sce.trustAsHtml('Your booking has been created. Please wait for driver to confirm.');
                            newBookingLocation.type = '0';
                        }
                    }else{
                        delete newBookingLocation.type;
                        $scope.requestBookingResult = $sce.trustAsHtml(messageRequestBooking[data.error]);
                    }
                }else{
                    delete newBookingLocation.type;
                    $scope.requestBookingResult = $sce.trustAsHtml(messageRequestBooking[data.error]);
                }
                $jq('#notiNewBookingModal').modal('show');
            });
            /*--------------------Validate--------------------*/
            $scope.validatePhone = function(number){
                if($scope.phoneRequestInfo.length > number){
                    $scope.phoneRequestInfo = $scope.phoneRequestInfo.slice(0, number);
                }
            }
            $scope.validateName = function(number){
                if($scope.nameRequestInfo){
                    $scope.validateNameStyle = {
                        'color': 'green',
                        'border-bottom': 'thin solid green'
                    }
                    if($scope.nameRequestInfo.length > number){
                        $scope.nameRequestInfo = $scope.nameRequestInfo.slice(0, number);
                    }
                }else{
                    $scope.validateNameStyle = {
                        'color': 'red',
                        'border-bottom': 'thin solid red'
                    };
                }
            }
            $scope.validateEmail = function(){
                if(($scope.emailRequestInfo && validateEmail($scope.emailRequestInfo)) || !$scope.emailRequestInfo){
                    if($scope.emailRequestInfo && validateEmail($scope.emailRequestInfo)){
                        $scope.validateEmailStyle = {
                            'color': 'green',
                            'border-bottom': 'thin solid green'
                        }
                    }else{
                        $scope.validateEmailStyle = {
                            'color': 'black',
                            'border-bottom': 'thin solid #c0c0c0'
                        }
                    }
                }else{
                    $scope.validateEmailStyle = {
                        'color': 'red',
                        'border-bottom': 'thin solid red'
                    };
                }
            }
            $scope.validateNumberPickup = function(number){
                if(($scope.addressFromNumber && isNumeric($scope.addressFromNumber)) || !$scope.addressFromNumber){
                    if($scope.addressFromNumber && isNumeric($scope.addressFromNumber)){
                        $scope.validatePickupNumberStyle = {
                            'color': 'green',
                            'border-bottom': 'thin solid green'
                        }
                        if($scope.addressFromNumber.length > number){
                            $scope.addressFromNumber = $scope.addressFromNumber.slice(0, number);
                        }
                    }else{
                        $scope.validatePickupNumberStyle = {
                            'color': 'black',
                            'border-bottom': 'thin solid #c0c0c0'
                        }
                    }
                }else{
                    $scope.validatePickupNumberStyle = {
                        'color': 'red',
                        'border-bottom': 'thin solid red'
                    };
                }
            }
            $scope.validateNumberDes = function(number){
                if(($scope.addressToNumber && isNumeric($scope.addressToNumber)) || !$scope.addressToNumber){
                    if($scope.addressToNumber && isNumeric($scope.addressToNumber)){
                        $scope.validateDesNumberStyle = {
                            'color': 'green',
                            'border-bottom': 'thin solid green'
                        }
                        if($scope.addressToNumber.length > number){
                            $scope.addressToNumber = $scope.addressToNumber.slice(0, number);
                        }
                    }else{
                        $scope.validateDesNumberStyle = {
                            'color': 'black',
                            'border-bottom': 'thin solid #c0c0c0'
                        }
                    }
                }else{
                    $scope.validateDesNumberStyle = {
                        'color': 'red',
                        'border-bottom': 'thin solid red'
                    };
                }
            }
            $scope.validateNote = function(number){
                if($scope.note || !$scope.note){
                    if($scope.note){
                        $scope.validateNoteStyle = {
                            'color': 'green',
                            'border-bottom': 'thin solid green'
                        }
                        if($scope.note.length > number){
                            $scope.note = $scope.note.slice(0, number);
                        }
                    }else{
                        $scope.validateNoteStyle = {
                            'color': 'black',
                            'border-bottom': 'thin solid #c0c0c0'
                        }
                    }
                }else{
                    $scope.validateNoteStyle = {
                        'color': 'red',
                        'border-bottom': 'thin solid red'
                    };
                }
            }
            $scope.validateNumberPickup = function(number){
                if(($scope.addressFromNumber && isNumeric($scope.addressFromNumber)) || !$scope.addressFromNumber){
                    if($scope.addressFromNumber && isNumeric($scope.addressFromNumber)){
                        $scope.validatePickupNumberStyle = {
                            'color': 'green',
                            'border-bottom': 'thin solid green'
                        }
                        if($scope.addressFromNumber.length > number){
                            $scope.addressFromNumber = $scope.addressFromNumber.slice(0, number);
                        }
                    }else{
                        $scope.validatePickupNumberStyle = {
                            'color': 'black',
                            'border-bottom': 'thin solid #c0c0c0'
                        }
                    }
                }else{
                    $scope.validatePickupNumberStyle = {
                        'color': 'red',
                        'border-bottom': 'thin solid red'
                    };
                }
            }
            $scope.validateNumberDes = function(number){
                if(($scope.addressToNumber && isNumeric($scope.addressToNumber)) || !$scope.addressToNumber){
                    if($scope.addressToNumber && isNumeric($scope.addressToNumber)){
                        $scope.validateDesNumberStyle = {
                            'color': 'green',
                            'border-bottom': 'thin solid green'
                        }
                        if($scope.addressToNumber.length > number){
                            $scope.addressToNumber = $scope.addressToNumber.slice(0, number);
                        }
                    }else{
                        $scope.validateDesNumberStyle = {
                            'color': 'black',
                            'border-bottom': 'thin solid #c0c0c0'
                        }
                    }
                }else{
                    $scope.validateDesNumberStyle = {
                        'color': 'red',
                        'border-bottom': 'thin solid red'
                    };
                }
            }
        }
    ]);

function calDurationDriverNear(from, to1, to2, cb){
    var listTo = to1.concat(to2);
    var listDest = [];
    if(from.lat && from.lng && listTo.length > 0){
        async.forEach(listTo, function(dest, cb){
            listDest.push(new google.maps.LatLng(dest.geo.latitude, dest.geo.longitude));
            cb();
        }, function(){
            var service = new google.maps.DistanceMatrixService();
            service.getDistanceMatrix({
                origins: [new google.maps.LatLng(from.lat, from.lng)],
                destinations: listDest,
                travelMode: google.maps.TravelMode.DRIVING,
                unitSystem: google.maps.UnitSystem.IMPERIAL,
                avoidHighways: false,
                avoidTolls: false
            }, callback);
            function callback(response, status) {
                if (status == google.maps.DistanceMatrixStatus.OK) {
                    var origins = response.originAddresses;
                    var destinations = response.destinationAddresses;

                    var minDuration = {
                        value: -1,
                        text: ''
                    };
                    for (var i = 0; i < origins.length; i++) {
                        var results = response.rows[i].elements;
//                        console.log(results);
                        for (var j = 0; j < results.length; j++) {
                            var element = results[j];

                            if(minDuration.value === -1){
                                minDuration.value = element.duration.value;
                                minDuration.text = element.duration.text;
                            }else{
                                if(element.duration.value < minDuration.value){
                                    minDuration.value = element.duration.value;
                                    minDuration.text = element.duration.text;
                                }
                            }
                        }
                    }
                    return cb(minDuration.text);
                }else{
                    return cb('');
                }
            }
        });
    }else{
        return cb('');
    }
}

var validateEmail = function(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

var isNumeric = function(value) {
    return /^\d+$/.test(value);
}
var geocoder = new google.maps.Geocoder();
var getAddressByLatLng = function(latlng, callback){
    geocoder.geocode( { 'latLng': latlng}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK && results) {
            return callback(results[0].formatted_address);
        }else{
            return callback();
        }
    });
}
var displayPickup = function(address, $scope){
    var number = parseInt(address);
    if(number && address.indexOf(number+' ') !== -1){
        $scope.addressFromNumber = number;
        $scope.addressFromRoad = address.replace(number+' ', '');
        if($scope.addressFromRoad.indexOf('0') === 0){
            $scope.addressFromRoad = $scope.addressFromRoad.replace('0', '');
        }
    }else{
        //if(number && address.indexOf(number+'-') !== -1){
        //    $scope.addressFromNumber = number;
        //    $scope.addressFromRoad = address.replace(number+' ', '');
        //}else{
            $scope.addressFromNumber = '';
            $scope.addressFromRoad = address;
        //}
    }
}
var displayDestination = function(address, $scope){
    var number = parseInt(address);
    if(number && address.indexOf(number+' ') !== -1){
        $scope.addressToNumber = number;
        $scope.addressToRoad = address.replace(number+' ', '');
        if($scope.addressToRoad.indexOf('0') === 0){
            $scope.addressToRoad = $scope.addressFromRoad.replace('0', '');
        }
    }else{
        //if(number && address.indexOf(number+'-') !== -1){
        //    $scope.addressToNumber = number;
        //    $scope.addressToRoad = address.replace(number+' ', '');
        //}else{
        $scope.addressToNumber = '';
        $scope.addressToRoad = address;
        //}
    }
}

//Calculation distance and duration when create new booking
function calDistance($scope, lat, lng, latTo, lngTo, unitDistanceType){
    var directionsService = new google.maps.DirectionsService();
    if(lat && lng && latTo && lngTo){
        var start = new google.maps.LatLng(lat, lng);
        var end = new google.maps.LatLng(latTo, lngTo);
        var request = {
            origin:start,
            destination:end,
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: unitDistanceType === 'metric' ? google.maps.UnitSystem.METRIC : google.maps.UnitSystem.IMPERIAL
        };
        directionsService.route(request, function(response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                $scope.distanceNewBooking = response.routes[0].legs[0].distance.text;
                $scope.durationNewBooking = response.routes[0].legs[0].duration.text;
                $scope.$digest();
                $jq('.newBookingDiv .moreInfo .infoBooking .row').show();
                if(response.routes[0].legs[0].distance.value){
                    $scope.calFaeBooking(response.routes[0].legs[0].distance.value);
                }
            }
        });
    }
}

//validate requestBooking
function validateRequestBooking($scope, callback){
    async.waterfall([
        function(cb){
            if(($scope.emailRequestInfo && validateEmail($scope.emailRequestInfo)) || !$scope.emailRequestInfo){
                cb(null, true);
            }else{
                $scope.mDispatcherError = "Please enter a valid passenger's email.";
                $scope.validateEmailStyle = {
                    'color': 'red',
                    'border-bottom': 'thin solid red'
                };
                cb(true, false);
            }
        }, function(status,cb){
            if($scope.nameRequestInfo){
                cb(null, true);
            }else{
                $scope.mDispatcherError = "Please enter passenger's name.";
                $scope.validateNameStyle = {
                    'color': 'red',
                    'border-bottom': 'thin solid red'
                };
                cb(true, false);
            }
        }, function(status,cb){
            if($scope.phoneRequestInfo){
                cb(null, true);
            }else{
                $scope.mDispatcherError = "Please enter passenger's phone.";
                $scope.validatePhoneStyle = {
                    'color': 'red',
                    'border-bottom': 'thin solid red'
                };
                cb(true, false);
            }
        }, function(status,cb){
            if(($scope.addressFromNumber && isNumeric($scope.addressFromNumber)) || !$scope.addressFromNumber){
                cb(null, true);
            }else{
                $scope.mDispatcherError = "Please enter a valid number of pickup location.";
                $scope.validatePickupNumberStyle = {
                    'color': 'black',
                    'border-bottom': 'thin solid #c0c0c0'
                }
                cb(true, false);
            }
        }, function(status,cb){
            if(($scope.addressToNumber && isNumeric($scope.addressToNumber)) || !$scope.addressToNumber){
                cb(null, true);
            }else{
                $scope.mDispatcherError = "Please enter a valid number of destination location.";
                $scope.validateDesNumberStyle = {
                    'color': 'red',
                    'border-bottom': 'thin solid red'
                };
                cb(true, false);
            }
        }
    ], function(err, result){
        if(err){
            $scope.$digest();
            callback(false);
        }else{
            callback(true);
        }
    });
}

function getLatLngByAddress(address, callback){
    geocoder.geocode({'address' : address}, function(results, status){
        return callback({
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng()
        });
    });
}

//Convert email address to emailXMPP
function convertEmail(email){
    var index = email.indexOf("@");
    return email.replace("@","").concat("."+index.toString());
}
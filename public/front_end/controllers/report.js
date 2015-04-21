angular.module('ReportCtrl', ['ngCookies'])
    .controller('ReportCtrl', ['$scope', 'socket', 'AuthService', '$http', 'serverConfig', '$sce',
        function($scope, socket, AuthService, $http, serverConfig, $sce) {
            $scope.hourOptions = serverConfig.getServerConfig().reportHours;
            $scope.hourTo = $scope.hourOptions[$scope.hourOptions.length -1];
            $scope.hourFrom = $scope.hourOptions[0];
            $scope.minuteOptions = serverConfig.getServerConfig().reportMinutes;
            $scope.minuteFrom = $scope.minuteOptions[0];
            $scope.minuteTo = $scope.minuteOptions[$scope.minuteOptions.length -1];

            $scope.requestReport = function(){
                var dateFrom = $scope.dateFrom ? new moment($scope.dateFrom).format('DD/MM/YYYY') : new moment().format('DD/MM/YYYY');
                var dateTo = $scope.dateTo ? new moment($scope.dateTo).format('DD/MM/YYYY') : new moment().format('DD/MM/YYYY');
                //var fromDateMoment, toDateMoment;
                var fromDateFullText = dateFrom+', '+ $scope.hourFrom.value+', '+ $scope.minuteFrom.value;
                var toDateFullText = dateTo+', '+ $scope.hourTo.value+', '+ $scope.minuteTo.value;
                console.log(fromDateFullText);
                console.log(toDateFullText);
                var fromDateMoment = new moment(fromDateFullText, 'DD/MM/YYYY, hh A, mm');
                var toDateMoment = new moment(toDateFullText, 'DD/MM/YYYY, hh A, mm');
                if(toDateMoment.isAfter(fromDateMoment)){
                    openLoadingPopup();
                    socket.emit('queryReport', {
                        fleetId     : serverConfig.getServerConfig().fleetId,
                        userId      : AuthService.user.userId,
                        fromQuery   : fromDateMoment,
                        toQuery     : toDateMoment
                    });
                }else{
                    $scope.notiMDispatch = $sce.trustAsHtml('From Date must be earlier than To Date.');
                    $jq('#notiMDispatchModal').modal('show');
                }
            }

            //Socket get Report
            socket.on('queryReport', function(data){
                closeLoadingPopup();
                if($scope.check){
                    $jq('#example').dataTable().fnDestroy();
                }
                $jq('#example').dataTable( {
                    "data": data,
                    "columns": [
                        { "title": "Date" },
                        { "title": "# Trip" }
                    ],
                    columnDefs: [
                        { type: 'date-uk', targets: 0 }
                    ],
                    "oLanguage": {
                        "sInfo": "Show _START_ to _END_ of _TOTAL_ results",
                        "oPaginate": {
                            "sNext": "<img src='/images/report/icon2.png'>",
                            "sPrevious": "<img src='/images/report/icon1.png'>"
                        },
                        "sEmptyTable":     "No booking"
                    },
                    "pagingType": 'simple'
                });
                $jq('.reportDiv .mainContent .resultDiv').show();
                $scope.check = true;
            });
        }
    ]);
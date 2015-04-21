angular.module('services.socket', [])
    .factory('socket', function ($rootScope) {
        var socket = io.connect('192.168.2.209:4002');
        socket.on('error', function () {
//        alert('Connect to server dispatch fail');
        });
        return {
            on: function (eventName, callback) {
                socket.on(eventName, function() {
                    var args = arguments;
                    $rootScope.$apply(function() {
                        callback.apply(socket, args);
                    });
                });
            },
            emit: function (eventName, data, callback) {
                socket.emit(eventName, data, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        if (callback) {
                            callback.apply(socket, args);
                        }
                    });
                })
            }
        };
    });
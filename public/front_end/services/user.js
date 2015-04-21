angular.module('services.user', [])
    .factory('UserService', [function(){
        var user = {};
        return {
            getUser: function(){
                return user;
            },
            setUser: function(info){
                user = _.extend(user, info);
                return user;
            }
        };
    }]
);
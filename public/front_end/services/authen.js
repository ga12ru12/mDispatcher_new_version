angular.module('AuthService', [])
    .factory('AuthService', [function(){
        var authen = {
            isLoggedIn: false,
            login: function(user){
                this.user = user;
                this.isLoggedIn = true;
            },
            logout: function(){
                this.isLoggedIn = false;
                delete this.user;
            }
        };
        return authen;
    }]
);
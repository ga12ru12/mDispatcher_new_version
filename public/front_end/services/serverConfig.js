angular.module('serverConfig', [])
    .factory('serverConfig', [function(){
            var serverConfig = {
                //client_id Foursquare
                client_id       : "Y303QSI21MM4M5YHGKJJ4T4IO1ASRPM5WCASKSB5UZD142UH",
                //client_secret Foursquare
                client_secret   : "UMPNMN2Y0B31LUWE4FBIFVEDMHSVVKJEEIWKDLMKCIEYAQRK",
                CCUrl           : 'http://taxilocal2.qgs.vn',
                fleetId         : 2080,
                hostUrl         : '192.168.2.209',
                defaultLocation : [16.07546009893299, 108.22271883487701], //2 Quang Trung, Da Nang, Viet Nam
                //defaultLocation : [47.606264314555894, -122.33001708984374], //Seattle
                reportMinutes   : [{"name":"00","value":"00"},{"name":"01","value":"01"},{"name":"02","value":"02"},{"name":"03","value":"03"},{"name":"04","value":"04"},{"name":"05","value":"05"},{"name":"06","value":"06"},{"name":"07","value":"07"},{"name":"08","value":"08"},{"name":"09","value":"09"},{"name":10,"value":10},{"name":11,"value":11},{"name":12,"value":12},{"name":13,"value":13},{"name":14,"value":14},{"name":15,"value":15},{"name":16,"value":16},{"name":17,"value":17},{"name":18,"value":18},{"name":19,"value":19},{"name":20,"value":20},{"name":21,"value":21},{"name":22,"value":22},{"name":23,"value":23},{"name":24,"value":24},{"name":25,"value":25},{"name":26,"value":26},{"name":27,"value":27},{"name":28,"value":28},{"name":29,"value":29},{"name":30,"value":30},{"name":31,"value":31},{"name":32,"value":32},{"name":33,"value":33},{"name":34,"value":34},{"name":35,"value":35},{"name":36,"value":36},{"name":37,"value":37},{"name":38,"value":38},{"name":39,"value":39},{"name":40,"value":40},{"name":41,"value":41},{"name":42,"value":42},{"name":43,"value":43},{"name":44,"value":44},{"name":45,"value":45},{"name":46,"value":46},{"name":47,"value":47},{"name":48,"value":48},{"name":49,"value":49},{"name":50,"value":50},{"name":51,"value":51},{"name":52,"value":52},{"name":53,"value":53},{"name":54,"value":54},{"name":55,"value":55},{"name":56,"value":56},{"name":57,"value":57},{"name":58,"value":58},{"name":59,"value":59}],
                reportHours     : [{"name":"12 AM","value":"12 AM"},{"name":"01 AM","value":"01 AM"},{"name":"02 AM","value":"02 AM"},{"name":"03 AM","value":"03 AM"},{"name":"04 AM","value":"04 AM"},{"name":"05 AM","value":"05 AM"},{"name":"06 AM","value":"06 AM"},{"name":"07 AM","value":"07 AM"},{"name":"08 AM","value":"08 AM"},{"name":"09 AM","value":"09 AM"},{"name":"10 AM","value":"10 AM"},{"name":"11 AM","value":"11 AM"},{"name":"12 PM","value":"12 PM"},{"name":"01 PM","value":"01 PM"},{"name":"02 PM","value":"02 PM"},{"name":"03 PM","value":"03 PM"},{"name":"04 PM","value":"04 PM"},{"name":"05 PM","value":"05 PM"},{"name":"06 PM","value":"06 PM"},{"name":"07 PM","value":"07 PM"},{"name":"08 PM","value":"08 PM"},{"name":"09 PM","value":"09 PM"},{"name":"10 PM","value":"10 PM"},{"name":"11 PM","value":"11 PM"}]
            }
            return {
                getServerConfig: function(){
                    return serverConfig;
                },
                setServerConfig: function(data){
                    serverConfig = _.extend(serverConfig, data);
                    return serverConfig;
                }
            }
        }
    ]);

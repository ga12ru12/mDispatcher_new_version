angular.module("ExampleApp").run(["$templateCache", function($templateCache) {$templateCache.put("example/page1.html","<div class=\"wrapper {{page1Style}}\" ng-style=\"{\'-webkit-transition-duration\': speed + \'ms\',\'-moz-transition-duration\': speed + \'ms\',\'-ms-transition-duration\': speed + \'ms\',\'-o-transition-duration\': speed + \'ms\',\'transition-duration\': speed + \'ms\'}\">\n\n	<h1>Page 1</h1>\n\n</div>");
$templateCache.put("example/page2.html","<div class=\"wrapper {{page2Style}}\" ng-style=\"{\'-webkit-transition-duration\': speed + \'ms\',\'-moz-transition-duration\': speed + \'ms\',\'-ms-transition-duration\': speed + \'ms\',\'-o-transition-duration\': speed + \'ms\',\'transition-duration\': speed + \'ms\'}\">\n\n	<h1>Page 2</h1>\n\n</div>");}]);
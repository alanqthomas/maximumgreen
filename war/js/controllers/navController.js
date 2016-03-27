"use strict";

(function() {
angular.module('c4').controller('navCtrl', ['$scope', '$http', 'GAuth',	'GApi',
                                  function(	 $scope,   $http,	GAuth,	 GApi){
	$scope.ifLogin = function() {
		$scope.logMsg = "Out";
	}
	$scope.ifLogout = function() {
		$scope.logMsg = "In";
	}
	$scope.checkLog = function(){
		GAuth.checkAuth().then(ifLogin(),ifLogout());
	}
	GAuth.checkAuth().then($scope.ifLogin(),$scope.ifLogout());
	$scope.signMsg = "Sign "+$scope.logMsg;
	
	$scope.logFunc = function() {
		GAuth.checkAuth().then(
			function(){
				GAuth.logout().then($scope.ifLogout());
				},
			function(){
				GAuth.login().then($scope.ifLogin());
			}
		);
	};
}]);

})();

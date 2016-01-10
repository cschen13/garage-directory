var homeController = angular.module('homeController', []);

homeController.controller('HomeCtrl', ['$scope', 
	function($scope) {
		$scope.test = 'This is a test.';
	}]);
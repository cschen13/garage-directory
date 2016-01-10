var teamController = angular.module('teamController', []);

teamController.controller('TeamCtrl', ['$scope', 
	function($scope) {
		$scope.test = 'This is another test.';
	}]);
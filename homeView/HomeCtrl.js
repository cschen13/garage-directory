var homeController = angular.module('homeController', ['garageApp']);

homeController.controller('HomeCtrl', ['$scope', 'groupService',
	function($scope, groupService) {
		$scope.currentGroup = groupService.getGroup;
		$scope.$on('GROUP_CHANGED', function(event, newGroup) {
			$scope.currentGroup = newGroup;
		})

		// $scope.test = 'This is a test.';
	}]);
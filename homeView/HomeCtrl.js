var homeController = angular.module('homeController', ['garageApp']);

homeController.controller('HomeCtrl', ['$scope', 'groupService', 'directoryService',
	function($scope, groupService, directoryService) {
		$scope.currentGroup = groupService.get();
		$scope.$on('GROUP_CHANGED', function(event, newGroup) {
			$scope.currentGroup = newGroup;
			$scope.query = newGroup.name;
		})
		$scope.allGroups = directoryService.get();

		// $scope.test = 'This is a test.';
	}]);
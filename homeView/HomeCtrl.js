var homeController = angular.module('homeController', ['garageApp', 'memberFilter', 'groupFilter']);

homeController.controller('HomeCtrl', ['$scope', 'groupService',
	'memberFilter', 'groupFilter',
	function($scope, groupService, memberFilter, groupFilter) {
		$scope.allMembers = {};
		$scope.selectedGroup = groupService.get();
		$scope.query = '';
		$scope.$on('GROUP_CHANGED', function(event, newGroup) {
			$scope.selectedGroup = newGroup;
			// $scope.query = newGroup.name;
		});

		$scope.$on('GROUPS_LOADED', function(event, groups) {
			$scope.allGroups = groups.sections;
		});

		$scope.$on('MEMBERS_LOADED', function(event, members) {
			$scope.$apply(function() {
				$scope.allMembers = members;
			});
		});

		$scope.isEmpty = function(obj) {
			for (var prop in obj) {
				if (obj.hasOwnProperty(prop))
					return false;
			}
			return true && JSON.stringify(obj) === JSON.stringify({});
		};
	}]);

// Custom filters allow me to filter the Firebase's JSON data without 
// worrying about turning everything into an array for Angular's built-in 
// filter.
angular.module('groupFilter',[])
.filter('group', function() {
	return function(input, groupName) {
		if (!input) return input;
		if (!groupName) return input;
		var expected = ('' + groupName).toLowerCase();
		var result = {};
		angular.forEach(input, function(actualGroup, groupKey) {
			var actual = ('' + actualGroup.name).toLowerCase();
			if (actual.indexOf(expected) !== -1) {
				result[groupKey] = actualGroup;
			}
		});
		return result;
  	};
});

angular.module('memberFilter',[])
.filter('member', function() {
 	return function(input, name, group) {
		if (!input) return input;
		var expected = ('' + name).toLowerCase();
		var result = {};
		angular.forEach(input, function(value, key) {
		  var actual = ('' + value.name).toLowerCase();
		  if (actual.indexOf(expected) !== -1 && (key in group.members) && group.members[key] === true) {
			result[key] = value;
		  }
		});
		return result;
  	};
});
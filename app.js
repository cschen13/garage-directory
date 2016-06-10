var garageApp = angular.module('garageApp', [
	'ngMaterial',
	'ngRoute',
	'homeController',
	'residentController'
]);

garageApp.config(['$routeProvider', '$mdThemingProvider',
	function($routeProvider, $mdThemingProvider) {
		$routeProvider.
			when('/', {
				templateUrl: 'homeView/home.html',
				controller: 'HomeCtrl'
			}).
			when('/resident', {
				templateUrl: 'residentView/resident.html',
				controller: 'ResidentCtrl'
			}).
			otherwise({
				redirectTo: '/'
			});

		$mdThemingProvider.theme('default')
			.primaryPalette('deep-purple')
			.accentPalette('pink');
	}]);

garageApp.service('groupService', function() {
	var currentGroup = { name: '', members: []};

	var get = function() {
		return currentGroup;
	};

	var set = function(g) {
		currentGroup = g;
	};

	return {
		set: set,
		get: get	
	};
});

garageApp.service('directoryService', function() {
	var allGroups = {};

	var get = function() {
		return allGroups;
	};

	var set = function(groups) {
		allGroups = groups;
	};

	return { set: set, get: get};
})

garageApp.controller('MainCtrl', ['$rootScope', '$scope', 'groupService',
	'directoryService',
	function($rootScope, $scope, groupService, directoryService) {
		var currentGroup = { name: '', members: []};

		$scope.setGroup = function(g) {
			groupService.set(g);
			currentGroup = groupService.get();
			$rootScope.$broadcast('GROUP_CHANGED', currentGroup);
		};

		// Mocks
		var audiovert = {
			name: 'Audiovert',
			members: [{name: 'Chris Chen'}]
		};

		var mdar = {
			name: 'MDAR',
			members: [{name:'Ben Williams'}]
		};

		var noteshark = {
			name: 'Noteshark',
			members: [{name:'Wyatt Cook'}, {name: 'Justin Fleishmann'}]
		};

		var epic = {
			name: 'EPIC',
			members: [{name: 'Garret Goehring'}, {name: 'Terence Chan'}, {name: 'Diane Liu'}]
		};

		var fte = {
			name: 'Full-Time Employees',
			members: [{name: 'Melissa Crounse'}, {name: 'Elisa Mitchell'}, {name: 'Ben Williams'}]
		};

		var aides = {
			name: 'Student Services Aides',
			members: [{name: 'Chris Chen'}, {name:'Ryan Miller'}, {name: 'Joanna Li'}, {name:'Lejia Duan'}, {name:'Gabriel Caniglia'}, {name:'Brigitte Brozsus'}]
		};

		var eir = {
			name: 'Entrepreneurs in Residence',
			members: [{name: 'Chris Steiner'}, {name:'Ben Vear'}]
		};

		var teams = {
			heading: 'Resident Teams',
			groups: [audiovert, mdar, noteshark, epic]
		};

		var staff = {
			heading: 'The Garage Staff',
			groups: [fte, aides, eir]
		};
		$scope.menu = {
			sections: {teams, staff}
		};

		directoryService.set($scope.menu);
	}]);
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
	var currentGroup = { name: '', children: []};

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

garageApp.controller('MainCtrl', ['$rootScope', '$scope', 'groupService',
	function($rootScope, $scope, groupService) {
		var currentGroup = { name: '', children: []};

		$scope.setGroup = function(g) {
			groupService.set(g);
			currentGroup = groupService.get();
			$rootScope.$broadcast('GROUP_CHANGED', currentGroup);
		};

		var audiovert = {
			name: 'Audiovert',
			children: ['Chris Chen']
		};

		var mdar = {
			name: 'MDAR',
			children: ['Ben Williams']
		};

		var noteshark = {
			name: 'Noteshark',
			children: ['Wyatt Cook', 'Justin Fleishmann']
		};

		var epic = {
			name: 'EPIC',
			children: ['Garret Goehring', 'Terence Chan', 'Diane Liu']
		};

		var fte = {
			name: 'Full-Time Employees',
			children: ['Melissa Crounse', 'Elisa Mitchell', 'Ben Williams']
		};

		var aides = {
			name: 'Student Services Aides',
			children: ['Chris Chen', 'Ryan Miller', 'Joanna Li', 'Lejia Duan', 'Gabriel Caniglia', 'Brigitte Brozsus']
		};

		var eir = {
			name: 'Entrepreneurs in Residence',
			children: ['Chris Steiner', 'Ben Vear']
		};

		var teams = {
			heading: 'Resident Teams',
			children: [audiovert, mdar, noteshark, epic]
		};

		var staff = {
			heading: 'The Garage Staff',
			children: [fte, aides, eir]
		};
		$scope.menu = {
			sections: {teams, staff}
		};
	}])
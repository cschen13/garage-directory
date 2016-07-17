var garageApp = angular.module('garageApp', [
	'ngMaterial',
	'ngRoute',
	'homeController',
	'residentController',
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

// This service is used to pass the selected group from MainCtrl to HomeCtrl.
garageApp.service('groupService', function() {
	var selectedGroup = { name: '', members: []};

	var get = function() {
		return selectedGroup;
	};

	var set = function(g) {
		selectedGroup = g;
	};

	return {
		set: set,
		get: get	
	};
});

// Likely isn't necessary now that I can query the database.
// Take out in future commit.
garageApp.service('directoryService', function() {
	var allGroups = {};

	var get = function() {
		return allGroups;
	};

	var set = function(groups) {
		allGroups = groups;
	};

	return { set: set, get: get};
});

garageApp.controller('MainCtrl', ['$rootScope', '$scope', 'groupService',
	'directoryService', '$mdDialog', '$mdSidenav', '$mdMedia',
	function($rootScope, $scope, groupService, directoryService, $mdDialog, $mdSidenav, $mdMedia) {
		$scope.selectedGroup = { name: '', members: []};
		$scope.menu = {
			sections: {}
		};
		$scope.members = {};

		// Basically grabbing all of the data from the database one time 
		// when the page first loads.
		// Could get hairy if too many people in the database. Might need
		// to put in some sort of loading indicator in the future.
		firebase.database().ref('/teams').once('value').then(function(snapshot) {
			var newTeams = snapshot.val();
			firebase.database().ref('/staff').once('value').then(function(snapshot) {
				var newStaff = snapshot.val();
				// $apply needed to update the DOM.
				$scope.$apply(function() {
					$scope.menu.sections = { newTeams, newStaff };
				});

				// Send broadcast so that HomeCtrl knows to pull the info.
				$rootScope.$broadcast('GROUPS_LOADED', $scope.menu);
				firebase.database().ref('/members').once('value').then(function(snapshot) {
					var members = snapshot.val();
					$scope.$apply(function() {
						$scope.members = members;
					});

					$rootScope.$broadcast('MEMBERS_LOADED', $scope.members);
				});
			});
		});

		// Called whenever a user selects a group from the sidenav.
		$scope.setGroup = function(g) {
			groupService.set(g);
			$scope.selectedGroup = groupService.get();
			$rootScope.$broadcast('GROUP_CHANGED', $scope.selectedGroup);
			// If you selected from a slide-out sidenav, close the sidenav.
			if (!$mdMedia('gt-sm')) {
				$mdSidenav('left').toggle();
			}
		};

		$scope.openMenu = function() {
			$mdSidenav('left').toggle();
		};

		// Authentication would allow database edits right in the web app
		// for privileged users. The login dialog will be the starting point.
		// $scope.showLoginDialog = function() {
		// 	// $mdDialog.show({
		// 	// 	contentElement: '#loginDialog',
		// 	// 	parent: angular.element(document.body),
		// 	// 	clickOutsideToClose: true
		// 	// });

		// 	alert = $mdDialog.alert()
		//         .title('Attention')
		//         .textContent('This is an example of how easy dialogs can be!')
		//         .ok('Close');
		//     $mdDialog
		// 		.show( alert )
		// 		.finally(function() {
		// 		alert = undefined;
		// 		});
		// };

		// $scope.closeDialog = function() {
		// 	// $mdDialog.hide();
		// 	$mdDialog.hide( alert, "finished" );
  //     alert = undefined;
		// }

		////////////////MOCKS//////////
		// var data = {
		//   members : {
		//     "aalexander" : {
		//       "groups" : {
		//         "audiovert" : true
		//       },
		//       "name" : "Ahren Alexander"
		//     },
		//     "bbanks" : {
		//       "groups" : {
		//         "fte" : true
		//       },
		//       "name" : "Billy Banks"
		//     },
		//     "bwilliams" : {
		//       "groups" : {
		//         "fte" : true
		//       },
		//       "name" : "Ben Williams"
		//     },
		//     "cchen" : {
		//       "groups" : {
		//         "aides" : true
		//       },
		//       "name" : "Chris Chen"
		//     },
		//     "csteiner" : {
		//       "groups" : {
		//         "eir" : true
		//       },
		//       "name" : "Chris Steiner"
		//     },
		//     "dliu" : {
		//       "groups" : {
		//         "epic" : true
		//       },
		//       "name" : "Diane Liu"
		//     },
		//     "emitchell" : {
		//       "groups" : {
		//         "fte" : true
		//       },
		//       "name" : "Elisa Mitchell"
		//     },
		//     "gcaniglia" : {
		//       "groups" : {
		//         "aides" : true
		//       },
		//       "name" : "Gabriel Caniglia"
		//     },
		//     "jfleishmann" : {
		//       "groups" : {
		//         "audiovert" : true
		//       },
		//       "name" : "Justin Fleishmann"
		//     },
		//     "jshi" : {
		//       "groups" : {
		//         "epic" : true
		//       },
		//       "name" : "Joshua Shi"
		//     },
		//     "mcrounse" : {
		//       "groups" : {
		//         "fte" : true
		//       },
		//       "name" : "Melissa Crounse"
		//     },
		//     "msaunders" : {
		//       "groups" : {
		//         "eir" : true
		//       },
		//       "name" : "Michael Saunders"
		//     }
		//   },
		//   staff : {
		//     "groups" : {
		//       "aides" : {
		//         "members" : {
		//           "cchen" : true,
		//           "gcaniglia" : true
		//         },
		//         "name" : "Student Services Aides"
		//       },
		//       "eir" : {
		//         "members" : {
		//           "csteiner" : true,
		//           "msaunders" : true
		//         },
		//         "name" : "Entrepreneurs-in-Residence"
		//       },
		//       "fte" : {
		//         "members" : {
		//           "bbanks" : true,
		//           "bwilliams" : true,
		//           "emitchell" : true,
		//           "mcrounse" : true
		//         },
		//         "name" : "Full-Time Employees"
		//       }
		//     },
		//     "name" : "The Garage Staff"
		//   },
		//   teams : {
		//     "groups" : {
		//       "audiovert" : {
		//         "members" : {
		//           "aalexander" : true,
		//           "jfleishmann" : true
		//         },
		//         "name" : "Audiovert"
		//       },
		//       "epic" : {
		//         "members" : {
		//           "dliu" : true,
		//           "jshi" : true
		//         },
		//         "name" : "EPIC"
		//       }
		//     },
		//     "name" : "Resident Teams"
		//   }
		// };
		// $scope.menu.sections = [data.teams, data.staff];
		// $scope.members = [ data.members ];
		// $rootScope.$broadcast('GROUPS_LOADED', $scope.menu);
		// $rootScope.$broadcast('MEMBERS_LOADED', $scope.members);
		

		/////////////////////////////////// Old Mock
		// var audiovert = {
		// 	name: 'Audiovert',
		// 	members: [{name: 'Chris Chen', studentID: 2846283}]
		// };

		// var mdar = {
		// 	name: 'MDAR',
		// 	members: [{name:'Ben Williams'}]
		// };

		// var noteshark = {
		// 	name: 'Noteshark',
		// 	members: [{name:'Wyatt Cook'}, {name: 'Justin Fleishmann'}]
		// };

		// var epic = {
		// 	name: 'EPIC',
		// 	members: [{name: 'Garret Goehring'}, {name: 'Terence Chan'}, {name: 'Diane Liu'}]
		// };

		// var fte = {
		// 	name: 'Full-Time Employees',
		// 	members: [{name: 'Melissa Crounse'}, {name: 'Elisa Mitchell'}, {name: 'Ben Williams'}]
		// };

		// var aides = {
		// 	name: 'Student Services Aides',
		// 	members: [{name: 'Chris Chen'}, {name:'Ryan Miller'}, {name: 'Joanna Li'}, {name:'Lejia Duan'}, {name:'Gabriel Caniglia'}, {name:'Brigitte Brozsus'}]
		// };

		// var eir = {
		// 	name: 'Entrepreneurs in Residence',
		// 	members: [{name: 'Chris Steiner'}, {name:'Ben Vear'}]
		// };

		// var teams = {
		// 	heading: 'Resident Teams',
		// 	groups: [audiovert, mdar, noteshark, epic]
		// };

		// var staff = {
		// 	heading: 'The Garage Staff',
		// 	groups: [fte, aides, eir]
		// };

		// Is this service even necessary anymore?
		// directoryService.set($scope.menu);
	}
]);
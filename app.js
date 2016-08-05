var garageApp = angular.module('garageApp', [
	'ngMaterial',
	'ngRoute',
	'ngMessages',
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
		$scope.loggingIn = false;
		$scope.loggedIn = false;
		$scope.loginError = '';

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
					$scope.menu.sections = { newTeams: newTeams, newStaff: newStaff };
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
		$scope.showLoginDialog = function() {
			$mdDialog.show({
				scope: $scope,
				preserveScope: true,
				openFrom: '#loginButton',
				template: 
				'<md-dialog>' +
				'			<form name="loginForm">' +
				'	<md-dialog-content>' +
				'		<div layout="column" layout-margin>' +
				'			<h3>Staff Login</h3>' +
				'				<md-input-container class="md-block">' +
				'					<label>Email Address</label>' +
				'					<input md-autofocus required ng-model="email" name="myEmail" type="email">' +
				'					<div ng-messages="loginForm.myEmail.$error" md-auto-hide="false" ng-show="loginForm.myEmail.$touched">' +
				'						<div ng-message="required">An email is required for login.</div>' +
				'						<div ng-message="email">Please provide a valid email address.</div>' +
				'					</div>' +
				'				</md-input-container>' +
				'				<md-input-container class="md-block">' +
				'					<label>Password</label>' +
				'					<input required ng-model="password" name="password" type="password">' +
				'					<div ng-messages="loginForm.password.$error">' +
				'						<div ng-message="required">Password is required.</div>' +
				'					</div>' +
				'				</md-input-container>' +

				'			<p ng-show="loginError != \'\'" style="color:red">{{loginError}}</p>' +
				'		</div>' +
				'	</md-dialog-content>' +
				'	<md-dialog-actions>' +
				'		<div layout="row">' +
				'			<md-button class="md-primary" type="submit" ng-disabled="loginForm.$invalid || loggingIn" ng-click="login(email, password)">' +
				'				Login' +
				'			</md-button>' +
				'			<md-button ng-click="closeDialog()">' +
				'				Cancel' +
				'			</md-button>' +
				'		</div>' +
				'	</md-dialog-actions>' +
								'			</form>' +
				'</md-dialog>'
			});	
		};

		$scope.login = function(email, password) {
			$scope.loggingIn = true;
			firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
				//This error checking isn't working, and I'm not sure why.
				var errorCode = error.code;
				$scope.$apply(function() {
					if (error.code == 'auth/user-not-found') {
						$scope.loginError = "Email not registered.";
					} else if (error.code == 'auth/wrong-password') {
						$scope.loginError = "The password is incorrect.";
					} else {
						$scope.loginError = error.message;
					}
					$scope.loggingIn = false;
				});
			});
		};

		firebase.auth().onAuthStateChanged(function(user) {
			if (user) {
				$scope.loggedIn = true;
				$scope.loginError = "";
				$scope.loggingIn = false;
				$mdDialog.hide();
			} else {
				$scope.loggedIn = false;
			}
		});

		$scope.signOut = function() {
			firebase.auth().signOut().then(function() {
				$scope.password = "";
			}, function(error) {
				console.log(error.code);
				console.log(error.message);
			});
		};
		

		$scope.closeDialog = function() {
			$mdDialog.hide();
		};

		// Is this service even necessary anymore?
		// directoryService.set($scope.menu);
	}
]);
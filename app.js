var garageApp = angular.module('garageApp', [
	'ngMaterial',
	'ui.router',
	'ngMessages',
	'homeController',
	'residentController',
]);

garageApp.config(['$stateProvider', '$urlRouterProvider', '$mdThemingProvider',
	function($stateProvider, $urlRouterProvider, $mdThemingProvider) {
		$urlRouterProvider.otherwise("/");
		$stateProvider
			.state('home', {
				url: "/",
				templateUrl: "homeView/home.html",
				controller: 'HomeCtrl'
			})
			.state('resident', {
				url: "/resident",
				templateUrl: "residentView/resident.html",
				controller: 'ResidentCtrl'
			});

		$mdThemingProvider.theme('default')
			.primaryPalette('deep-purple')
			.accentPalette('pink');
	}]);

garageApp.factory('data', ['$q', '$rootScope', function dataFactory($q, $rootScope) {
	// Basically grabbing all of the data from the database one time 
	// when the page first loads.
	// Could get hairy if too many people in the database. Might need
	// to put in some sort of loading indicator in the future.
	var data = {};

	var getSections = function() {
		firebase.database().ref('/teams').once('value').then(function(snapshot) {
			var newTeams = snapshot.val();
			firebase.database().ref('/staff').once('value').then(function(snapshot) {
				var newStaff = snapshot.val();
				data.sections = {teams: newTeams, staff: newStaff };

				//Send broadcast so that HomeCtrl knows to pull the info.
				$rootScope.$broadcast('GROUPS_LOADED', data.sections);
			});
		});
	};

	var getMembers = function() {
		firebase.database().ref('/members').once('value').then(function(snapshot) {
			data.members = snapshot.val();
			var storageRef = firebase.storage().ref();
			var headshotsRef = storageRef.child('headshots');
			var promises = [];
			angular.forEach(data.members, function(member, memberKey) {
				// if (member.id != null) {
				// 	fileName = '/' + member.id + '_'+ memberKey + '.jpg';
					fileName = '/' + memberKey + '.jpg';
					promises.push(
						headshotsRef.child(fileName).getDownloadURL().then(function(url) {
							member.headshotURL = url;
						}).catch(function(error) {
							switch (error.code) {
								case 'storage/object-not-found':
									console.log('No headshot found for: ' + member.name);
								break;
								//handle more later
							}
						})
					);
				// } else {
				// 	console.log('No Student ID found for ' + member.name);
				// }
			});

			$q.all(promises).then(function() {
				$rootScope.$broadcast('MEMBERS_LOADED', data.members);
			});
		});
	};	

	data.getData = function() {
		getSections();
		getMembers();
	};

	return data;
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

garageApp.controller('MainCtrl', ['$rootScope', '$scope', 'groupService',
	'$mdDialog', '$mdSidenav', '$mdMedia', 'data',
	function($rootScope, $scope, groupService, $mdDialog, $mdSidenav, $mdMedia, data) {
		$scope.selectedGroup = { name: '', members: []};
		data.getData();
		$scope.$on('GROUPS_LOADED', function(event, sections) {
			$scope.sections = data.sections;
		});
		$scope.$on('MEMBERS_LOADED', function(event, members) {
			$scope.members = data.members;
		});
		
		$scope.loggingIn = false;
		$scope.loggedIn = false;
		$scope.loginError = '';

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
				'<md-dialog flex="25">' +
				'	<form name="loginForm">' +
				'		<md-dialog-content>' +
				'			<div layout="column" layout-margin>' +
				'				<h3>Staff Login</h3>' +
				'					<md-input-container class="md-block">' +
				'						<label>Email Address</label>' +
				'						<input md-autofocus required ng-model="email" name="myEmail" type="email">' +
				'						<div ng-messages="loginForm.myEmail.$error" md-auto-hide="false" ng-show="loginForm.myEmail.$touched">' +
				'							<div ng-message="required">An email is required for login.</div>' +
				'							<div ng-message="email">Please provide a valid email address.</div>' +
				'						</div>' +
				'					</md-input-container>' +
				'					<md-input-container class="md-block">' +
				'						<label>Password</label>' +
				'						<input required ng-model="password" name="password" type="password">' +
				'						<div ng-messages="loginForm.password.$error">' +
				'							<div ng-message="required">Password is required.</div>' +
				'						</div>' +
				'					</md-input-container>' +
				'				<p ng-show="loginError != \'\'" style="color:red">{{loginError}}</p>' +
				'			</div>' +
				'		</md-dialog-content>' +
				'		<md-dialog-actions>' +
				'			<div layout="row">' +
				'				<md-progress-circular md-mode="indeterminate" ng-show="loggingIn"></md-progress-circular>' +
				'				<md-button class="md-primary" type="submit" ng-disabled="loginForm.$invalid || loggingIn" ng-click="login(email, password)">' +
				'					Login' +
				'				</md-button>' +
				'				<md-button ng-click="closeDialog()">' +
				'					Cancel' +
				'				</md-button>' +
				'			</div>' +
				'		</md-dialog-actions>' +
				'	</form>' +
				'</md-dialog>'
			});	
		};

		$scope.showAddResidentDialog = function() {
			$mdDialog.show({
				contentElement: '#addResidentDialog',
				parent: angular.element(document.body),
			});
		};

		$scope.addResident = function(name, team) {
			//TODO: Add resident, need to construct new node label from the name.
			//firebase.database.ref('members/' + )
		};

		$scope.showAddTeamDialog = function() {
			$mdDialog.show({
				contentElement: '#addTeamDialog',
				parent: angular.element(document.body),
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

		$scope.signOut = function() {
			firebase.auth().signOut().then(function() {
				$scope.password = "";
			}, function(error) {
				console.log(error.code);
				console.log(error.message);
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

		$scope.closeDialog = function() {
			$mdDialog.hide();
		};
	}
]);
angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $ionicPlatform, $rootScope, $state, $window, $ionicHistory) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };

    $scope.myGoBack = function() {
      $window.history.back();
    };

    $scope.hideInfo = true;

    $scope.menu = [
      {name: 'home', url: 'templates/info-home.html', isActive: true},
      {name: 'section1', url: 'templates/info-section-1.html', isActive: false},
      {name: 'section2', url: 'templates/info-section-2.html', isActive: false}
    ];

    function setActive(name) {
      angular.forEach($scope.menu, function (item) {
        item.isActive = (item.name === name);
      });
    }

    $scope.showMenu = function (name) {
      setActive(name);
    };

    $scope.viewInfo = function(){
      $scope.hideInfo = false;
    };

    $scope.closeInfo = function () {
      $scope.hideInfo = true;
      setActive('home');
    };

    // Hardware back button handler
    $ionicPlatform.registerBackButtonAction(function () {
      if (!$scope.hideInfo) {
        // Close info view if it is opened
        $scope.closeInfo();
        $state.go($state.current.name);
      } else if ($ionicHistory.viewHistory().currentView.backViewId === null) {
        // Quit app if there is no way back
        ionic.Platform.exitApp();
      } else {
        $scope.myGoBack();
      }
    }, 1000);

  })

.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})

.controller('PlaylistCtrl', function($scope) {
});


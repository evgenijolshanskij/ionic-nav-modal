angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $timeout, multiViewModal, customModal) {

  // Form data for the login modal
  $scope.loginData = {};

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };

  // Modal service initialization
  var multiPageModal = multiViewModal.get('modal1');
  
  $scope.showInfo = function(){
    multiPageModal.show();
  };

  $scope.closeInfo = function () {
    multiPageModal.close();
  };

  $scope.activateMenu = function (name) {
    multiPageModal.activateView(name);
  };

  $scope.previous = function () {
    multiPageModal.previousView();
  };

  // Modal service initialization.
  var simpleModal = customModal.get('modal2');

  $scope.showInfo2 = function () {
    simpleModal.show();
  };

  $scope.closeInfo2 = function () {
    simpleModal.close();
  }


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


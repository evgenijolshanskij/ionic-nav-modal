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
  var multiPageModal = multiViewModal.get({
    id: 'modal1',
    erasable: false,
    returnable: true,
    views: [
      {name: 'home', url: 'templates/info-home.html', isActive: true, root: true},
      {name: 'section1', url: 'templates/info-section-1.html', parent: 'home'},
      {name: 'section2', url: 'templates/info-section-2.html', parent: 'home'}
    ]
  });

  $scope.showInfo = function(){
    multiPageModal.show();
  };

  $scope.closeInfo = function () {
    multiPageModal.close();
  };

  $scope.activateMenu = function (name) {
    multiPageModal.activateMenu(name);
  };

  $scope.previous = function () {
    multiPageModal.previous();
  };

  // Modal service initialization.
  var simpleModal = customModal.get({
    id: 'modal2'
  });

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


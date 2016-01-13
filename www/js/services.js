angular.module('starter.services', [])

.factory('routingModal', ['$ionicHistory', '$ionicPlatform', '$state', '$compile', function ($ionicHistory, $ionicPlatform, $state, $compile) {

  return {

    initialize: function (templateString, options) {

      var scope = options.scope,
        jqLite = angular.element,
        modal = {};

      var routingModalEl = jqLite(document.getElementsByTagName('routing-modal'));
      routingModalEl.replaceWith('<ng-include src="\'' + templateString + '\'"></ng-include>');
      var newEl = jqLite(document.getElementsByTagName('ng-include'));
      $compile(newEl)(scope);

      scope.hideInfo = true;
      scope.menu = options.menu;

      scope.activateMenu = function (name) {
        setActive(name);
      };

      var findParent = function () {
        var matched;
        angular.forEach(scope.menu, function (v, k) {
          if (v.parent) matched = v;
        });
        return matched;
      };
      var parent = findParent();

      function setActive(name) {
        angular.forEach(scope.menu, function (item) {
          item.isActive = (item.name === name);
        });
      }

      var myGoBack = function() {
        $ionicHistory.goBack();
      };

      $ionicPlatform.registerBackButtonAction(function () {
        if (!scope.hideInfo) {
          // Close info view if it is opened
          scope.hideInfo = true;
          $state.go($state.current.name);
        } else if ($ionicHistory.viewHistory().currentView.backViewId === null) {
          // Quit app if there is no way back
          ionic.Platform.exitApp();
        } else {
          myGoBack();
        }
      }, 1000);

      modal.show = function () {
        scope.hideInfo = false;
      };

      modal.close = function () {
        scope.hideInfo = true;
        setActive(parent.name);
      };

      return modal;

    }

  }

}]);

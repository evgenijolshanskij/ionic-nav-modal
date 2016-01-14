angular.module('starter.services', [])

/**
 * Service created for managing the modal window rendered by navModal directive.
 * Provides object with functions for opening, closing and navigating within the modal.
 */
.factory('navigableModal', ['$ionicHistory', '$ionicPlatform', '$state', '$timeout', function ($ionicHistory, $ionicPlatform, $state, $timeout) {

  return {

    initialize: function (options) {

      /* Variables initialization */
      var scope = options.scope,
        modal = {},
        currentItem,
        root;
      scope.hidden = true;
      scope.menu = options.menu;

      /* Finds root page */
      var findRoot = function() {
        var matched;
        angular.forEach(scope.menu, function (v, k) {
          if (v.root) matched = v;
        });
        return matched;
      };
      root = findRoot();

      /* Sets page as active */
      function setActive(name) {
        angular.forEach(scope.menu, function (item) {
          if (item.name === name) {
            currentItem = item;
            item.isActive = true;
          } else item.isActive = false;
        });
      }

      /* Global go back event implementation */
      var myGoBack = function() {
        $ionicHistory.goBack();
      };

      /* Hardware back button handler */
      $ionicPlatform.registerBackButtonAction(function () {
        if (!scope.hidden) {
          // Close info view if it is opened
          scope.hidden = true;
          // In order to trigger Info window hiding state changing is simulated
          $state.go($state.current.name);
        } else if ($ionicHistory.viewHistory().currentView.backViewId === null) {
          // Quit app if there is no way back
          ionic.Platform.exitApp();
        } else {
          myGoBack();
        }
      }, 1000);

      modal.show = function () {
        scope.hidden = false;
      };

      modal.close = function () {
        scope.hidden = true;
        // Time is needed window to be closed
        $timeout(function () {
          setActive(root.name);
        }, 1000);
      };

      modal.activateMenu = function (name) {
        setActive(name);
      };

      modal.previous = function () {
        setActive(currentItem.prev);
      };

      return modal;

    }

  }

}]);

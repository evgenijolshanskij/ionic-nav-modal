angular.module('starter.services', [])

.factory('navigatingModal1', [function () {



}])

/**
 * Service created for managing the modal window rendered by navModal directive.
 * Provides object with functions for opening, closing and navigating within the modal.
 */
.factory('navigatingModal', ['$ionicHistory', '$ionicPlatform', '$state', '$timeout', function ($ionicHistory, $ionicPlatform, $state, $timeout) {

  var directive;

  return {

    /**
     * This function will be called first in a controller
     * to pass html pages and their routes.
     *
     * @param options an object with parameters.
     * @returns {{modal}} object.
     */
    initialize: function (options) {

      /* Variables initialization */
      var menu = options.menu,
        modal = {},
        currentItem,
        root;

      /* Finds root page */
      var findRoot = function() {
        var matched;
        angular.forEach(menu, function (v, k) {
          if (v.root) matched = v;
        });
        console.log(matched);
        return matched;
      };
      root = findRoot();

      /* Sets page as active */
      function setActive(name) {
        angular.forEach(menu, function (item) {
          if (item.name === name) {
            currentItem = item;
            item.isActive = true;
          } else item.isActive = false;
        });
        directive.updateMenu(menu);
      }

      /* Global go back event implementation */
      var myGoBack = function() {
        $ionicHistory.goBack();
      };

      /* Hardware back button handler */
      $ionicPlatform.registerBackButtonAction(function () {
        if (directive.isHidden) {
          // Close info view if it is opened
          directive.close();
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
        if (directive.isEmptyMenu()) directive.updateMenu(menu);
        directive.show();
      };

      modal.close = function () {
        directive.close();
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

    },

    /**
     *
     * @param directiveManager an object that provides methods for managing the modal.
     */
    registerDirective: function (directiveManager) {
      directive = directiveManager;
    }

  }

}]);

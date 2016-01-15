angular.module('starter.services', [])

.factory('navigatingModal', ['$ionicPlatform', '$ionicHistory', '$state', function ($ionicPlatform, $ionicHistory, $state) {

  var navModalDirective;

  return {
    initialize: function () {
      var modal = {};

      /* Global go back event implementation */
      var myGoBack = function() {
        $ionicHistory.goBack();
      };

      /* Hardware back button handler */
      $ionicPlatform.registerBackButtonAction(function () {
        if (navModalDirective.isHidden) {
          // Close info view if it is opened
          navModalDirective.close();
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
        navModalDirective.show();
      };

      modal.close = function () {
        navModalDirective.close();
      };

      return modal;

    },

    registerDirective: function (directiveManager) {
      navModalDirective = directiveManager;
    }
  }

}])

/**
 * Service created for managing the modal window rendered by navModal directive.
 * Provides object with functions for opening, closing and navigating within the modal.
 */
.factory('navigatingMenu', ['navigatingModal', '$timeout', '$compile', '$rootScope', function (navigatingModal, $timeout, $compile, $rootScope) {

  var navMenuDirective;

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
        erasable = options.erasable,
        returnable= options.returnable,
        modal = navigatingModal.initialize(),
        modalWithMenu = {},
        currentItem,
        root;

      /* Finds root page */
      var findRoot = function() {
        var matched;
        angular.forEach(menu, function (v, k) {
          if (v.root) matched = v;
        });
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
        navMenuDirective.updateMenu(menu);
      }

      modalWithMenu.show = function () {
        if (navMenuDirective.isEmptyMenu()) navMenuDirective.updateMenu(menu);
        modal.show();
      };

      modalWithMenu.close = function () {
        modal.close();
        // Time is needed window to be closed
        $timeout(function () {
          if (erasable) navMenuDirective.recompile();
          if (returnable) setActive(root.name);
        }, 1000);
      };

      modalWithMenu.activateMenu = function (name) {
        setActive(name);
      };

      modalWithMenu.previous= function () {
        setActive(currentItem.prev);
      };

      return modalWithMenu;

    },

    /**
     *
     * @param directiveManager an object that provides methods for managing the modal.
     */
    registerDirective: function (directiveManager) {
      navMenuDirective = directiveManager;
    }

  }

}]);

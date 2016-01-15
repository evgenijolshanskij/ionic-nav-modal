angular.module('starter.services', [])

/**
 * Service created for managing the modal window rendered by navModal directive.
 * Provides object with functions for opening, closing and navigating within the modal.
 */
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

    /**
     *
     * @param directiveManager an object that provides methods for managing the modal.
     */
    registerDirective: function (directiveManager) {
      navModalDirective = directiveManager;
    }
  }

}])

/**
 * Service for managing pages inside modal.
 */
.factory('navigatingMenu', ['navigatingModal', '$timeout', function (navigatingModal, $timeout) {

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
      var views = options.views,
        erasable = options.erasable,
        returnable= options.returnable,
        modal = navigatingModal.initialize(),
        modalWithRoutes = {},
        currentItem,
        root;

      /* Finds root page */
      var findRoot = function() {
        var matched = undefined;
        angular.forEach(views, function (v) {
          if (v.root) matched = v;
        });
        return matched;
      };
      root = findRoot();

      /* Sets page as active */
      function setActive(name) {
        angular.forEach(views, function (item) {
          if (item.name === name) {
            currentItem = item;
            item.isActive = true;
          } else item.isActive = false;
        });
        navMenuDirective.updateMenu(views);
      }

      modalWithRoutes.show = function () {
        if (navMenuDirective.isEmptyMenu()) navMenuDirective.updateMenu(views);
        modal.show();
      };

      modalWithRoutes.close = function () {
        modal.close();
        // Time is needed window to be closed
        $timeout(function () {
          if (erasable) navMenuDirective.recompile();
          if (returnable) setActive(root.name);
        }, 1000);
      };

      modalWithRoutes.activateMenu = function (name) {
        setActive(name);
      };

      modalWithRoutes.previous= function () {
        setActive(currentItem.prev);
      };

      return modalWithRoutes;

    },

    /**
     *
     * @param directiveManager an object that provides methods for managing pages.
     */
    registerDirective: function (directiveManager) {
      navMenuDirective = directiveManager;
    }

  }

}]);

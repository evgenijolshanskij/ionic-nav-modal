angular.module('starter.services', [])

/**
 * Service created for managing the modal window rendered by eModal directive.
 * Provides object with functions for opening, closing and navigating within the modal.
 */
.factory('emptyModal', ['$ionicPlatform', '$ionicHistory', '$state', function ($ionicPlatform, $ionicHistory, $state) {

  var directive = undefined;
  function isUndefined(obj) { return obj === undefined }

  var initFunction = function (f) { return isUndefined(f) ? function(){} : f; };

  return {
    initialize: function (options) {

      var modal = {},
        beforeOpened = initFunction(options.beforeOpened),
        afterOpened = initFunction(options.afterOpened),
        beforeClosed = initFunction(options.beforeClosed),
        afterClosed = initFunction(options.afterClosed);

      var show = function() {
        beforeOpened();
        directive.show();
        afterOpened();
      };

      var close = function () {
        beforeClosed();
        directive.close();
        afterClosed();
      };

      /* Global go back event implementation */
      var myGoBack = function() {
        $ionicHistory.goBack();
      };

      /* Hardware back button handler */
      $ionicPlatform.registerBackButtonAction(function () {
        if (!isUndefined(directive) && !directive.isHidden()) {
          // Close info view if it is opened
          close();
          // In order to trigger modal hiding, state changing is simulated
          $state.go($state.current.name);
        } else if ($ionicHistory.viewHistory().currentView.backViewId === null) {
          // Quit app if there is no way back
          ionic.Platform.exitApp();
        } else {
          myGoBack();
        }
      }, 1000);

      modal.show = function () {
        show();
      };

      modal.close = function () {
        close();
      };

      return modal;

    },

    /**
     *
     * @param handler an object that provides methods for managing the modal.
     */
    registerDirective: function (handler) {
      if (id === handler.getId) {
        directive = handler;
      }
    }
  }

}])

/**
 * Service for managing pages inside eModal rendered by navMenu directive.
 */
.factory('navigatingMenu', ['emptyModal', '$timeout', function (emptyModal, $timeout) {

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
      var views = options.views,
        erasable = options.erasable,
        returnable= options.returnable,
        modalWithRoutes = {},
        currentItem,
        root,
        modal = emptyModal.initialize({
          afterClosed: function () {
            // Time is needed window to be closed
            $timeout(function () {
              if (erasable) directive.recompile();
              if (returnable) setActive(root.name);
            }, 1000);
          }
      });

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
        directive.updateMenu(views);
      }

      modalWithRoutes.show = function () {
        if (directive.isEmptyMenu()) directive.updateMenu(views);
        modal.show();
      };

      modalWithRoutes.close = function () {
        modal.close();
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
     * @param handler an object that provides methods for managing pages.
     */
    registerDirective: function (handler) {
      directive = handler;
    }

  }

}]);

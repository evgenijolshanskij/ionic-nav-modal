angular.module('starter.services', [])

/**
 * Service created for managing the modal window rendered by eModal directive.
 * Provides object with functions for opening, closing and navigating within the modal.
 */
.factory('customModal', ['$ionicPlatform', '$ionicHistory', '$state', function ($ionicPlatform, $ionicHistory, $state) {

  var directives = {};
  function isUndefined(obj) { return obj === undefined }

  var initFunction = function (f) { return isUndefined(f) ? function(){} : f; };

  return {
    initialize: function (options) {

      var modal = {},
        beforeOpened = initFunction(options.beforeOpened),
        afterOpened = initFunction(options.afterOpened),
        beforeClosed = initFunction(options.beforeClosed),
        afterClosed = initFunction(options.afterClosed);

      var show = function(id) {
        beforeOpened();
        directives[id].show();
        afterOpened();
      };

      var close = function (id) {
        beforeClosed();
        directives[id].close();
        afterClosed();
      };

      /* Global go back event implementation */
      var myGoBack = function() {
        $ionicHistory.goBack();
      };

      /* Hardware back button handler */
      $ionicPlatform.registerBackButtonAction(function () {
        angular.forEach(directives, function (directive) {
          if (!isUndefined(directive) && !directive.isHidden()) {
            // Close info view if it is opened
            close(directive.id);
            // In order to trigger modal hiding, state changing is simulated
            $state.go($state.current.name);
          } else if ($ionicHistory.viewHistory().currentView.backViewId === null) {
            // Quit app if there is no way back
            ionic.Platform.exitApp();
          } else {
            myGoBack();
          }
        });
      }, 1000);

      modal.show = function (id) {
        show(id);
      };

      modal.close = function (id) {
        close(id);
      };

      return modal;

    },

    /**
     *
     * @param handler an object that provides methods for managing the modal.
     */
    registerDirective: function (handler) {
      directives[handler.id] = handler;
    }
  }

}])

/**
 * Service for managing pages inside eModal rendered by navMenu directive.
 */
.factory('modalViews', ['customModal', '$timeout', function (customModal, $timeout) {

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
      var modalWithViews = {};
      modalWithViews.id = options.id;
      modalWithViews.views = options.views;
      modalWithViews.erasable = options.erasable;
      modalWithViews.returnable = options.returnable;
      var cModal = customModal.initialize({
        afterClosed: function () {
          // Time is needed window to be closed
          $timeout(function () {
            if (modalWithViews.erasable) directive.recompile();
            if (modalWithViews.returnable) setActive(modalWithViews.root.name, modalWithViews);
          }, 500);
        }
      });

      /* Finds root page */
      var findRoot = function() {
        var matched = undefined;
        angular.forEach(options.views, function (v) {
          if (v.root) matched = v;
        });
        return matched;
      };
      modalWithViews.root = findRoot();

      /* Sets page as active */
      function setActive(name, modal) {
        console.log(modal);
        angular.forEach(modal.views, function (item) {
          if (item.name === name) {
            modal.currentItem = item;
            item.isActive = true;
          } else item.isActive = false;
        });
        directive.updateMenu(modal.id, modal.views);
      }

      modalWithViews.show = function () {
        if (directive.isEmptyMenu(this.id)) directive.updateMenu(this.id, this.views);
        directive.updateMenu(this.id, this.views);
        cModal.show(this.id);
      };

      modalWithViews.close = function () {
        cModal.close(this.id);
      };

      modalWithViews.activateMenu = function (name) {
        setActive(name, this);
      };

      modalWithViews.previous= function () {
        setActive(this.currentItem.prev, this);
      };

      return modalWithViews;

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

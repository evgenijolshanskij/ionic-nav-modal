angular.module('starter.services', [])

/**
 * Service created for managing the modal window rendered by cModal directive.
 * Provides object with functions for opening and closing the modal.
 */
.factory('customModal', ['$ionicPlatform', '$ionicHistory', '$state', function ($ionicPlatform, $ionicHistory, $state) {

  // Array holds all modal instances.
  var modals = [];

  return {
    /**
     * Function for initializing modal in the controller
     * @param options an object with options for modal
     * @returns {{modal}} instance
     */
    initialize: function (options) {

      // Checks whether modal id has been passed
      if (options.id === undefined) throw new Error('"id" option is required. ' +
        'Here is an example of valid modal initializing: ' +
        'var modal = customModal.initialize({id: \'your_modal_id\'});');
      // Checks whether any modal with such id is already exists.
      // If so throws TypeError.
      angular.forEach(modals, function (modal) {
        if (modal.id === options.id) throw new TypeError('Modal with such id (id: ' + modal.id + ') is already exists');
      });

      // Modal instance initializing.
      var modal = {};
      modal.beforeOpened = options.beforeOpened || function (){};
      modal.afterOpened = options.afterOpened || function (){};
      modal.beforeClosed = options.beforeClosed || function (){};
      modal.afterClosed = options.afterClosed || function (){};
      modal.id = options.id;

      /* Global go back event implementation */
      var myGoBack = function() {
        $ionicHistory.goBack();
      };

      /* Hardware back button handler */
      $ionicPlatform.registerBackButtonAction(function () {
        var wasOpened = false;
        angular.forEach(modals, function (modal) {
          if (modal.directive !== undefined && !modal.directive.isHidden()) {
            // Close info view if it is opened
            modal.close();
            // In order to trigger modal hiding, state changing is simulated
            $state.go($state.current.name);
            wasOpened = true;
          }
        });
        if (!wasOpened) {
          if ($ionicHistory.viewHistory().currentView.backViewId === null) {
            // Quit app if there is no way back
            ionic.Platform.exitApp();
          } else {
            myGoBack();
          }
        }
      }, 1000);

      /* Method provided to user that triggers opening modal event */
      modal.show = function () {
        this.beforeOpened();
        this.directive.show();
        this.afterOpened();
      };

      /* Method provided to user that triggers closing modal event */
      modal.close = function () {
        this.beforeClosed();
        this.directive.close();
        this.afterClosed();
      };

      // Adds modal to the array with the other modals.
      modals.push(modal);

      return modal;

    },

    /**
     * Function is used by bound directive to be registered within appropriate modal instance.
     * @param handler an object that provides methods for managing the directive.
     */
    registerDirective: function (handler) {
      var notExists = true;
      // Looking for the modal with the same id as the directive has.
      angular.forEach(modals, function (modal) {
        if (modal.id === handler.id) {
          // Binds directive to the modal instance.
          modal.directive = handler;
          notExists = false;
        }
      });
      // If there is no modals with the same id the directive has TypeError is thrown.
      if (notExists) throw new TypeError('Modal with such id (id: ' + handler.id + ') is not exists. ' +
      'Please, initialize one in the controller.');
    }
  }

}])

/**
 * Service for managing pages inside cModal rendered by navMenu directive.
 */
.factory('multiViewModal', ['customModal', '$timeout', function (customModal, $timeout) {

  // Array holds all modal instances.
  var multiViewModals = [];

  return {

    /**
     * This function will be called first in a controller
     * to pass html pages and their routes.
     *
     * @param options an object with parameters.
     * @returns {{modal}} instance.
     */
    initialize: function (options) {

      var afterClosed = function (modalInstance) {
        // Time is needed window to be closed
        $timeout(function () {
          if (modalInstance.erasable) modalInstance.directive.recompile();
          if (modalInstance.returnable) setActive(modalInstance.root.name, modalInstance);
        }, 500);
      };

      // Modal instance initializing.
      var multiViewModal = {};
      // Gets the list of html pages to be shown.
      multiViewModal.views = options.views;
      // Whether modal should erase inputs after is being closed.
      multiViewModal.erasable = options.erasable || true;
      // Whether modal should go back to the root page after is being closed.
      multiViewModal.returnable = options.returnable || true;
      // Adds customModal instance.
      multiViewModal.cModal = customModal.initialize({
        id: options.id,
        afterClosed: function () { afterClosed(multiViewModal) }
      });

      /* Finds root page */
      var findRoot = function() {
        var matched = undefined;
        angular.forEach(options.views, function (v) {
          if (v.root) matched = v;
        });
        return matched;
      };
      multiViewModal.root = findRoot();

      /* Sets page as active */
      function setActive(name, modal) {
        angular.forEach(modal.views, function (item) {
          if (item.name === name) {
            modal.currentItem = item;
            item.isActive = true;
          } else item.isActive = false;
        });
        multiViewModal.directive.updateMenu(modal.id, modal.views);
      }

      /* Method provided to user that triggers opening modal event */
      multiViewModal.show = function () {
        if (this.directive.isEmptyMenu(this.id)) this.directive.updateMenu(this.id, this.views);
        this.directive.updateMenu(this.id, this.views);
        this.cModal.show();
      };

      /* Method provided to user that triggers closing modal event */
      multiViewModal.close = function () {
        this.cModal.close();
      };

      /* Method provided to user that activates view with the name has been passed */
      multiViewModal.activateMenu = function (name) {
        setActive(name, this);
      };

      /* Method provided to user that returns previous view inside modal */
      multiViewModal.previous= function () {
        setActive(this.currentItem.prev, this);
      };

      // Adds modal to the array with the other modals.
      multiViewModals.push(multiViewModal);

      return multiViewModal;

    },

    /**
     * Function is used by bound directive to be registered within appropriate modal instance.
     * @param handler an object that provides methods for managing the directive.
     */
    registerDirective: function (handler) {
      var notExists = true;
      // Looking for the modal with the same id as the directive has.
      angular.forEach(multiViewModals, function (modal) {
        if (modal.cModal.id === handler.id) {
          // Binds directive to the modal instance.
          modal.directive = handler;
          notExists = false;
        }
      });
      // If there is no modals with the same id the directive has TypeError is thrown.
      if (notExists) throw new TypeError('Modal with such id (id: ' + handler.id + ') is not exists. ' +
      'Please, initialize one in the controller.');

    }

  }

}]);

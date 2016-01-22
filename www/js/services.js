angular.module('starter.services', [])

/**
 * Provides an object that is represent a modal instance.
 */
.factory('customModal', ['$ionicPlatform', '$ionicHistory', '$state',
    function ($ionicPlatform, $ionicHistory, $state) {

  // Container to hold all modal instances that will be created.
  var modals = [];

  return {
    /**
     * Creates new modal instance.
     *
     * @param   options   set of parameters needed for the modal to be created
     * @returns {{modal}} an object represented modal dialog window
     */
    initialize: function (options) {

      // Checks whether modal id has been passed.
      if (options.id === undefined) throw new Error('"id" option is required. ' +
        'Here is an example of valid modal initializing: ' +
        'var modal = customModal.initialize({id: "your_modal_id"});');
      // Checks whether any modal with such id is already exists.
      // If so, throws TypeError.
      angular.forEach(modals, function (modal) {
        if (modal.id === options.id) throw new TypeError('Modal with such id' +
          '(id: ' + modal.id + ') is already exists');
      });

      // Start of the modal instance initialization process.
      var modal = {};
      // Callback function that is being invoked before modal is opened.
      modal.beforeOpened = options.beforeOpened || function (){};
      // Callback function that is being invoked after modal is opened.
      modal.afterOpened = options.afterOpened || function (){};
      // Callback function that is being invoked before modal is closed.
      modal.beforeClosed = options.beforeClosed || function (){};
      // Callback function that is being invoked after modal is closed.
      modal.afterClosed = options.afterClosed || function (){};
      // Modal id that matches the id of html element.
      modal.id = options.id;

      /**
       * Global `go back` event implementation.
       */
      var myGoBack = function() {
        $ionicHistory.goBack();
      };

      /**
       * Hardware `back` button handler.
       */
      $ionicPlatform.registerBackButtonAction(function () {
        var wasOpened = false;
        angular.forEach(modals, function (modal) {
          // Checks whether modal is opened.
          if (modal.directive !== undefined && !modal.directive.isHidden()) {
            // Closes info view if it is opened.
            modal.close();
            // In order to trigger modal hiding, state changing is simulated.
            $state.go($state.current.name);
            wasOpened = true;
          }
        });
        if (!wasOpened) {
          // Checks if there is way back or not.
          if ($ionicHistory.viewHistory().currentView.backViewId === null) {
            // Quits app if there is no way back.
            ionic.Platform.exitApp();
          } else {
            myGoBack();
          }
        }
      }, 1000);

      /**
       * Triggers opening modal event.
       */
      modal.show = function () {
        this.beforeOpened();
        this.directive.show();
        this.afterOpened();
      };

      /**
       * Triggers closing modal event.
       */
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
     * Binds directive within appropriate modal instance.
     *
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
      if (notExists) throw new TypeError('Modal with such id' +
        '(id: ' + handler.id + ') is not exists. ' +
        'Please, initialize one in the controller.');
    }
  }

}])

/**
 * Provides an object that is represent a modal instance.
 *
 * The modal that is provided by this service allows to create multiple
 * views inside and navigate between them.
 */
.factory('multiViewModal', ['customModal', '$timeout', function (customModal, $timeout) {

    // Container to hold all modal instances that will be created.
  var multiViewModals = [];

  return {

    /**
     * Creates new modal instance.
     *
     * @param   options   set of parameters needed for the modal to be created
     * @returns {{modal}} an object represented modal dialog window
     */
    initialize: function (options) {

      var afterClosed = function (modalInstance) {
        // According to the .menu-animation css class,
        // time is needed window to be closed is 0.5s.
        // Thus, all actions connected with the modal DOM manipulation
        // should be done after the animation is completed.
        // In this case functions invokes 0.1s earlier to have all done
        // if it is decided to open the modal immediately just after it is being closed.
        $timeout(function () {
          if (modalInstance.erasable) modalInstance.directive.recompile();
          if (modalInstance.returnable) setActive(modalInstance.root.name, modalInstance);
        }, 400);
      };

      // Start of the modal instance initialization process.
      var multiViewModal = {};
      // Gets the list of html pages to be shown.
      multiViewModal.views = options.views;
      // Whether inputs in modal should be erased after it is being closed.
      multiViewModal.erasable = options.erasable || true;
      // Whether modal should go back to the root page after it is being closed.
      multiViewModal.returnable = options.returnable || true;
      // Adds `customModal` instance.
      multiViewModal.cModal = customModal.initialize({
        id: options.id,
        afterClosed: function () { afterClosed(multiViewModal) }
      });

      /**
       * Finds root page.
       *
       * @returns {matched} an object that represents root page
       */
      var findRoot = function() {
        var matched = undefined;
        angular.forEach(options.views, function (v) {
          if (v.root) matched = v;
        });
        return matched;
      };
      multiViewModal.root = findRoot();

      /**
       * Sets page as active.
       *
       * @param name  string with a name of the page
       * @param modal the modal instance
       */
      function setActive(name, modal) {
        angular.forEach(modal.views, function (item) {
          if (item.name === name) {
            modal.currentItem = item;
            item.isActive = true;
          } else item.isActive = false;
        });
        multiViewModal.directive.updateMenu(modal.id, modal.views);
      }

      /**
       * Triggers opening modal event.
       */
      multiViewModal.show = function () {
        if (this.directive.isEmptyMenu(this.id)) this.directive.updateMenu(this.id, this.views);
        this.directive.updateMenu(this.id, this.views);
        this.cModal.show();
      };

      /**
       * Triggers closing modal event.
       */
      multiViewModal.close = function () {
        this.cModal.close();
      };

      /**
       * Activates view with the name that has been passed.
       *
       * @param name string with a name of the page
       */
      multiViewModal.activateMenu = function (name) {
        setActive(name, this);
      };

      /**
       * Sets previous view inside the modal as active.
       */
      multiViewModal.previous= function () {
        setActive(this.currentItem.prev, this);
      };

      // Adds modal to the array with the other modals.
      multiViewModals.push(multiViewModal);

      return multiViewModal;

    },

    /**
     * Binds directive within appropriate modal instance.
     *
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
      if (notExists) throw new TypeError('Modal with such id' +
        '(id: ' + handler.id + ') is not exists. ' +
        'Please, initialize one in the controller.');

    }

  }

}]);

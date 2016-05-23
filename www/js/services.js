angular.module('starter.services', [])

/**
 * Provides an object that is represent a modal instance.
 */
.factory('customModal', ['$ionicPlatform', '$ionicHistory', '$state',
    function ($ionicPlatform, $ionicHistory, $state) {

  // Container to hold all modal instances that will be created.
  var modals = [];
  var speed = 1000;
  registerBackButtonAction();

  return {
    get:                get,
    registerDirective:  registerDirective
  };

  //////////////////////////////////

  function registerBackButtonAction() {
    /**
     * Hardware `back` button handler.
     */
    $ionicPlatform.registerBackButtonAction(registration, speed);

    function predicate(modal) {
      return modal && modal.directiveHandler && !modal.directiveHandler.isHidden();
    }

    function registration() {
      var modal = modals.isSatisfied(predicate);
      if (modal) {
        // Closes info view if it is opened.
        modal.close();
        // In order to trigger modal hiding, state changing is simulated.
        $state.go($state.current.name);
      } else {
        // Checks if there is way back or not.
        if ($ionicHistory.viewHistory().currentView.backViewId === null) {
          // Quits app if there is no way back.
          ionic.Platform.exitApp();
        } else {
          $ionicHistory.goBack();
        }
      }
    }
  }

  /**
   * Creates new modal instance.
   *
   * @param   options   set of parameters needed for the modal to be created
   * @returns {{modal}} an object represented modal dialog window
   */
  function get(options) {

    checkId();

    var modal =  {
      id:           options.id,
      beforeOpened: initCallback('beforeOpened'),
      afterOpened:  initCallback('afterOpened'),
      beforeClosed: initCallback('beforeClosed'),
      afterClosed:  initCallback('afterClosed'),
      show:         show,
      close:        close
    };
    // Adds modal to the array with the other modals.
    modals.push(modal);
    return modal;

    /**
     * Checks whether modal id has been passed.
     */
    function checkId() {
      if (options.id === undefined) throw new Error('"id" option is required. ' +
        'Here is an example of valid modal initializing: ' +
        'var modal = customModal.initialize({id: "your_modal_id"});');
    }

    /**
     * Callback function initialization.
     *
     * @param name callback function name.
     * @returns {*|Function}
     */
    function initCallback(name) {
      return options[name] || function (){};
    }

    /**
     * Triggers opening modal event.
     */
    function show() {
      var self = this;
      self.directiveHandler.show(self.beforeOpened, self.afterOpened);
    }

    /**
     * Triggers closing modal event.
     */
    function close() {
      var self = this;
      self.directiveHandler.close(self.beforeClosed, self.afterClosed);
    }

  }

  /**
   * Binds directive within appropriate modal instance.
   *
   * @param handler an object that provides methods for managing the directive.
   */
  function registerDirective(handler) {
    // Looking for the modal with the same id as the directive has.
    var modal = modals.findById(handler.id);
    if (modal) modal.directiveHandler = handler;
    // If there is no modals with the same id the directive has TypeError is thrown.
    else throw new TypeError('Modal with such id' +
      '(id: ' + handler.id + ') is not exists. ' +
      'Please, initialize one in the controller.');
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
        if (modalInstance.erasable) modalInstance.directive.recompile();
        if (modalInstance.returnable) setActive(modalInstance.root.name, modalInstance);
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
      multiViewModal.cModal = customModal.get({
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

angular.module('starter.services', [])

/**
 * Provides custom modal instance.
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

  ////////////////////////////
  // *** Implementation *** //
  ////////////////////////////

  /**
   * Hardware `back` button handler.
   */
  function registerBackButtonAction() {
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
   * Binds a directive within an appropriate modal instance.
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
 * Provides custom modal instance.
 *
 * The modal that is provided by this service allows to create multiple
 * views inside and navigate between them.
 */
.factory('multiViewModal', ['customModal', function (customModal) {

  // Container to hold all modal instances that will be created.
  var modals = [];

  return {
    get: get,
    registerDirective: registerDirective
  };

  ////////////////////////////
  // *** Implementation *** //
  ////////////////////////////

  /**
   * Creates new modal instance.
   *
   * @param   options   set of parameters needed for the modal to be created
   * @returns {{modal}} an object represented modal dialog window
   */
  function get(options) {

    // Start of the modal instance initialization process.
    var modal = {
      id:           options.id, // Gets the list of html pages to be shown.
      views:        options.views, // Whether inputs in modal should be erased after it is being closed.
      erasable:     options.erasable || true, // Whether modal should go back to the root page after it is being closed.
      returnable:   options.returnable || true, // Adds `customModal` instance.
      root:         findRoot(),
      show:         show,
      close:        close,
      activateMenu: activateMenu,
      previous:     previous
    };
    var customModalService = customModal.get({
      id:           modal.id,
      afterClosed:  afterClosed.bind(modal)
    });
      // Adds modal to the array with the other modals.
    modals.push(modal);
    return modal;

    /**
     * Callback to be invoked after modal is closed.
     *
     */
    function afterClosed() {
      var self = this;
      if (self.erasable) self.directiveHandler.recompile();
      if (self.returnable) setActive(self.root.name);
    }

    /**
     * Finds root page.
     *
     * @returns {matched} an object that represents root page
     */
    function findRoot() {
      var result = undefined;
      angular.forEach(options.views, function (view) {
        if (view.root) result = view;
      });
      return result;
    }

    /**
     * Sets page as active.
     *
     * @param name  string with a name of the page
     */
    function setActive(name) {
      angular.forEach(modal.views, function (view) {
        if (view.name === name)
          view.isActive = true;
        else
          delete view.isActive;
      });
      modal.directiveHandler.updateMenu(modal.views);
    }

    /**
     * Triggers opening modal event.
     */
    function show() {
      var self = this;
      self.directiveHandler.updateMenu(self.views);
      customModalService.show();
    }

    /**
     * Triggers closing modal event.
     */
    function close() {
      customModalService.close();
    }

    /**
     * Activates view with the name that has been passed.
     *
     * @param name string with a name of the page
     */
    function activateMenu(name) {
      setActive(name);
    }

    /**
     * Sets previous view inside the modal as active.
     */
    function previous() {
      setActive(modal.views.findByActivity().parent);
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

}]);

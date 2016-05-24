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
   * @param   id directive's id.
   * @returns {{modal}} an object represented modal dialog window
   */
  function get(id) {

    checkId();

    var modal =  {
      id:           id,
      setOptions:   setOptions,
      show:         show,
      close:        close
    };
    modal.setOptions({});
    // Adds modal to the array with the other modals.
    modals.push(modal);
    return modal;

    /**
     * Checks whether modal id has been passed.
     */
    function checkId() {
      if (id === undefined) throw new Error('"id" option is required. ' +
        'Here is an example of valid modal initializing: ' +
        'var modal = customModal.initialize({id: "your_modal_id"});');
    }

    /**
     * Triggers opening modal event.
     */
    function show() {
      var self = this;
      self.directiveHandler.show(self._beforeOpened, self._afterOpened);
    }

    /**
     * Triggers closing modal event.
     */
    function close() {
      var self = this;
      self.directiveHandler.close(self._beforeClosed, self._afterClosed);
    }

    function setOptions(options) {
      var self = this;
      self._beforeOpened  = initCallback(options, 'beforeOpened');
      self._afterOpened   = initCallback(options, 'afterOpened');
      self._beforeClosed  = initCallback(options, 'beforeClosed');
      self._afterClosed   = initCallback(options, 'afterClosed');
    }

    /**
     * Callback function initialization.
     *
     * @param options options to be applied.
     * @param name    callback function name.
     * @returns {*|Function}
     */
    function initCallback(options, name) {
      return options[name] || function (){};
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
   * @param   id        set of parameters needed for the modal to be created
   * @returns {{modal}} an object represented modal dialog window
   */
  function get(id) {

    // Start of the modal instance initialization process.
    var modal = {
      id:           id,
      show:         show,
      close:        close,
      activateMenu: activateMenu,
      previous:     previous
    };
    modal.customModalService = customModal.get(modal.id);
    modal.customModalService.setOptions({
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
      self.directiveHandler.close();
    }

    /**
     * Triggers opening modal event.
     */
    function show() {
      var self = this;
      self.customModalService.show();
    }

    /**
     * Triggers closing modal event.
     */
    function close() {
      var self = this;
      self.customModalService.close();
    }

    /**
     * Activates view with the name that has been passed.
     *
     * @param name string with a name of the page
     */
    function activateMenu(name) {
      var self = this;
      self.directiveHandler.setActive(name);
    }

    /**
     * Sets previous view inside the modal as active.
     */
    function previous() {
      var self = this;
      self.directiveHandler.previous();
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

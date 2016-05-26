angular.module('starter.services', [])

/**
 * Provides custom modal instance.
 */
.factory('customModal', ['$ionicPlatform', '$ionicHistory', '$state', '$timeout',
    function ($ionicPlatform, $ionicHistory, $state, $timeout) {

  // Container to hold all modal instances that will be created.
  var modals              = [];
  var timeModalToBeClosed = 500;

  // Registers hardware `back` button handler.
  registerBackButtonAction(modals);

  return {
    get:                get,
    registerDirective:  registerDirective
  };

  ////////////////////////////
  // *** Implementation *** //
  ////////////////////////////

  /**
   * Intercepts the hardware `back` button click on mobile device.
   */
  function registerBackButtonAction(modals) {
    // Set the highest priority.
    // More information on:
    // http://ionicframework.com/docs/api/service/$ionicPlatform/#registerBackButtonAction
    var priority = 500;

    $ionicPlatform.registerBackButtonAction(backButtonAction, priority);

    function predicate(modal) {
      return modal && modal.directiveHandler && !modal.directiveHandler.isHidden();
    }

    // Closes the modal if it is opened, otherwise executes 'go back' action.
    function backButtonAction() {
      // isSatisfied() method has been added to the Array's prototype
      // and can be found in app.js file of the source code on GitHub or Plunker.
      // Finds the element in an array that is satisfied the passed predicate.
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
   * Retrieves modal for a user.
   *
   * @param   id directive's id.
   * @returns {{modal}} an object represented modal dialog window
   */
  function get(id) {

    if (!id) throw new Error('"id" option is required. ' +
      'Here is an example of valid modal initializing: ' +
      'var modal = customModal.initialize({id: "your_modal_id"});');

    // findById() method has been added to the Array's prototype
    // and can be found in app.js file of the source code on GitHub or Plunker.
    // Finds the element in an array that is satisfied the passed predicate.
    var modal = modals.findById(id);
    return (!modal) ? createModal(id) : modal;
  }

  /**
   * Binds a directive within an appropriate modal instance.
   *
   * @param handler an object that provides methods for managing the directive.
   */
  function registerDirective(handler) {
    // Looking for the modal with the same id as the directive has.
    //
    // findById() method has been added to the Array's prototype
    // and can be found in app.js file of the source code on GitHub or Plunker.
    // Finds the element in an array that is satisfied the passed predicate.
    var modal = modals.findById(handler.id);
    if (!modal) modal = createModal(handler.id);
    modal.directiveHandler = handler;
  }

  /**
   * Creates new modal instance.
   *
   * @param   id of the modal.
   * @returns {{modal}} instance.
   */
  function createModal(id) {

    var modal =  {
      id:           id,
      callbacks:    ['beforeOpened', 'afterOpened', 'beforeClosed', 'afterClosed']
                      .reduce(toObject, {}),
      show:         show,
      close:        close
    };
    // Adds modal to the array with the other modals.
    modals.push(modal);
    return modal;

    function toObject(result, item) {
      result[item] = function(){};
      return result;
    }

    /**
     * Triggers opening modal event.
     */
    function show() {
      this.callbacks.beforeOpened();
      this.directiveHandler.show();
      this.callbacks.afterOpened();
    }

    /**
     * Triggers closing modal event.
     */
    function close() {
      this.callbacks.beforeClosed();
      this.directiveHandler.close();
      // According to the .menu-animation css class (can be found in style.css file),
      // time is needed window to be closed is 0.5s.
      // Thus, all actions connected with the modal DOM manipulation
      // should be done after the animation is completed.
      $timeout(this.callbacks.afterClosed, timeModalToBeClosed);
    }

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
   * Gets modal instance.
   *
   * @param   id        set of parameters needed for the modal to be created
   * @returns {{modal}} an object represented modal dialog window
   */
  function get(id) {

    if (!id) throw new Error('"id" option is required. ' +
      'Here is an example of valid modal initializing: ' +
      'var modal = customModal.initialize({id: "your_modal_id"});');

    var modal = modals.findById(id);
    return (!modal) ? createModal(id) : modal;
  }

  /**
   * Binds directive within appropriate modal instance.
   *
   * @param handler an object that provides methods for managing the directive.
   */
  function registerDirective(handler) {
    // Looking for the modal with the same id as the directive has.
    //
    // findById() method has been added to the Array's prototype
    // and can be found in app.js file of the source code on GitHub or Plunker.
    // Finds the element in an array that is satisfied the passed predicate.
    var modal = modals.findById(handler.id);
    if (!modal) modal = createModal(handler.id);
    modal.directiveHandler = handler;
  }

  /**
   * Creates new modal instance.
   *
   * @returns {{modal}} instance.
   */
  function createModal(id) {
    // Start of the modal instance initialization process.
    var modal = {
      id:           id,
      show:         show,
      close:        close,
      activateMenu: activateMenu,
      previous:     previous
    };
    modal.customModal = customModal.get(modal.id);
    modal.customModal.callbacks.afterClosed = afterClosed.bind(modal);
    // Adds modal to the array with the other modals.
    modals.push(modal);
    return modal;

    /**
     * Callback to be invoked after a modal is closed.
     *
     */
    function afterClosed() {
      // Triggers the directive's close() method after a modal is being closed.
      // Applies preferences set by user. See the 'multiViewModal' directive to get more.
      this.directiveHandler.close();
    }

    /**
     * Triggers opening modal event.
     */
    function show() {
      this.customModal.show();
    }

    /**
     * Triggers closing modal event.
     */
    function close() {
      this.customModal.close();
    }

    /**
     * Activates view with the name that has been passed.
     *
     * @param name string with a name of the page
     */
    function activateMenu(name) {
      this.directiveHandler.setActive(name);
    }

    /**
     * Sets previous view inside the modal as active.
     */
    function previous() {
      this.directiveHandler.previous();
    }
  }

}]);

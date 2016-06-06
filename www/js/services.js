angular.module('starter.services', [])

/**
 * Helps to access and manipulate custom modal instances.
 */
.factory('customModal', ['$ionicPlatform', '$ionicHistory', '$state', '$timeout',
    function ($ionicPlatform, $ionicHistory, $state, $timeout) {

  // container to hold all available modal instances
  var modals = [];

  // registering hardware `back` button handler...
  registerBackButtonAction();

  return {
    // returns model instance by id
    get:        get,
    // attaches a directive handler which allows to display / hide the modal
    setHandler: setHandler
  };

  ////////////////////////////
  // *** Implementation *** //
  ////////////////////////////

  /**
   * Intercepts the hardware `back` button click on a mobile device.
   */
  function registerBackButtonAction() {
    // registers back button action which closes the modal if it is opened
    var priority = 500; // the highest priority for the action, please read
    // http://ionicframework.com/docs/api/service/$ionicPlatform/
    $ionicPlatform.registerBackButtonAction(backButtonAction, priority);

    // closes the modal if it is opened, otherwise executes 'go back' action.
    function backButtonAction() {
      // checks if there is a modal that is currently opened
      var modal = modals.find(function(modal) {
        return modal && modal.directiveHandler && !modal.directiveHandler.isHidden();
      });
      if (modal) {
        // closes the modal view if it is opened
        modal.close();
        // simulates state change in order to trigger the modal hiding
        $state.go($state.current.name);
      } else {
        // otherwise, checks if there is a way back
        if ($ionicHistory.viewHistory().currentView.backViewId === null) {
          // exists the app if there is no way back
          ionic.Platform.exitApp();
        } else {
          // or goes back to the previous page
          $ionicHistory.goBack();
        }
      }
    }
  }

  /**
   * Returns a modal instance by id.
   */
  function get(id) {
    return modals.findById(id) || createModal(id);
  }

  /**
   * Attaches a directive handler which is used to display / hide the modal.
   */
  function setHandler(id, handler) {
    get(id).directiveHandler = handler;
  }

  /**
   * Creates a new modal instance.
   */
  function createModal(id) {

    var modal =  {
      // unique modal identifier
      id: id,
      // a set of dummy callback functions which can be overridden from a controller
      callbacks: ['beforeOpened', 'afterOpened', 'beforeClosed', 'afterClosed'].reduce(
        function(result, item) {result[item] = function(){}; return result;}, {}),
      // shows the modal
      show: show,
      // hides the modal
      close: close
    };
    // adds modal to the array with the other modals.
    modals.push(modal);
    return modal;

    /**
     * Triggers the 'open' event, and executes callbacks.
     */
    function show() {
      this.callbacks.beforeOpened();
      this.directiveHandler.show();
      this.callbacks.afterOpened();
    }

    /**
     * Triggers the 'close' event, and executes callbacks.
     */
    function close() {
      this.callbacks.beforeClosed();
      this.directiveHandler.close();
      // wait till window is closed, and only then perform DOM manipulations
      $timeout(this.callbacks.afterClosed, 500);
    }

  }

}])

/**
 * Helps to access and manipulate navigatable modal instances with
 * multiple inner views.
 */
.factory('multiViewModal', ['customModal', function (customModal) {

  // container to hold all available modal instances
  var modals = [];

  // this service repeats functionality of the first one
  // in a real project it's better to take them out to avoid repetitions
  return {
    get: get,
    setHandler: setHandler
  };

  ////////////////////////////
  // *** Implementation *** //
  ////////////////////////////

  /**
   * Returns a modal instance by id.
   */
  function get(id) {
    return modals.findById(id) || createModal(id);
  }

  /**
   * Attaches a directive handler which allows to manipulate modal state.
   */
  function setHandler(id, handler) {
    get(id).directiveHandler = handler;
  }

  /**
   * Creates a new modal instance.
   */
  function createModal(id) {
    var baseModal = customModal.get(id);
    var modal = {
      id: id,
      show: show,
      close: close,
      // activates view with the given name
      activateView: activateView,
      // activates the previous view in hierarchy
      previousView: previousView,
      baseModal: baseModal
    };
    modal.baseModal.callbacks.afterClosed = afterClosed(modal);
    // adds modal to the array with the other modals.
    modals.push(modal);
    return modal;

    /**
     * Triggers the 'open' event.
     */
    function show() {
      this.baseModal.show();
    }

    /**
     * Triggers the 'close' event.
     */
    function close() {
      this.baseModal.close();
    }

    /**
     * Activates view with the given name.
     */
    function activateView(name) {
      this.directiveHandler.activateView(name);
    }

    /**
     * Activates the previous view in hierarchy.
     */
    function previousView() {
      this.directiveHandler.previousView();
    }

    /**
     * Clears inputs and pre-activates the root view if required.
     */
    function afterClosed(modal) {
      var m = modal;
      return function () {
        var handler = m.directiveHandler;
        // `erasable` determines if all data should be erased after the modal is closed
        if (handler.options.erasable) handler.clearInputs();
        // `returnable` if the root view will be set as active after modal is closed
        if (handler.options.returnable) handler.activateRoot();
      };
    }
  }

}]);

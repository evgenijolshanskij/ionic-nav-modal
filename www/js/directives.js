angular.module('starter.directives', [])

/**
 * Renders modal template.
 * 
 */
  .directive('customModal', ['customModal', '$compile', '$timeout', function (customModal, $compile, $timeout) {

    var timeModalToBeClosed = 500;

    return {
      restrict: 'E',
      transclude: true,
      link: link
    };

    ////////////////////////////
    // *** Implementation *** //
    ////////////////////////////

    function link(scope, element, attrs, ctrl, transclude) {

      // Assigns the directive id.
      var id = attrs.id;
      // Creates a unique variable name to get it be bound to `ng-hide`.
      var ngHideBinder = "hidden_" + id;
      var modalEl = '<ion-pane ng-hide="' + ngHideBinder + '" class="menu-animation ng-hide"></ion-pane>';
      scope[ngHideBinder] = true;
      transclude(wrap);
      // Passes handles to the customModal service.
      customModal.registerDirective(handler());

      //////////////////////////////////

      // Transclude function implementation.
      function wrap(clone) {
        var wrapper = $compile(modalEl)(scope);
        // Appends wrapper element and content of the directive.
        element.append(wrapper.append(clone));
      }

      // Object that provides methods for modal visibility handling.
      function handler() {
        return {
          id: id,
          show: show,
          close: close,
          isHidden: isHidden
        };

        // Makes modal visible.
        function show(callbackBefore, callbackAfter) {
          callbackBefore.call();
          scope[ngHideBinder] = false;
          callbackAfter.call();
        }

        // Hides modal.
        function close(callbackBefore, callbackAfter) {
          callbackBefore.call();
          scope[ngHideBinder] = true;
          // According to the .menu-animation css class,
          // time is needed window to be closed is 0.5s.
          // Thus, all actions connected with the modal DOM manipulation
          // should be done after the animation is completed.
          $timeout(callbackAfter, timeModalToBeClosed);
        }

        // Shows current state of the modal.
        function isHidden() {
          return scope[ngHideBinder];
        }
      }

    }

  }])

  .directive('multiViewModal', ['multiViewModal', '$compile', function (multiViewModal, $compile) {

    return {
      restrict: 'E',
      link: link
    };

    ////////////////////////////
    // *** Implementation *** //
    ////////////////////////////

    function link(scope, element, attrs) {

      var id = attrs.id;
      // Creates a variable name for array that holds views.
      var menus = 'menu_' + id;
      // Compiles modal content.
      var menusTemplate = '<ion-pane ng-repeat="item in ' + menus + '" ng-show="item.isActive" ng-include="item.url"></ion-pane>';
      var customModalTemplate = '<custom-modal id="' + id + '">' + menusTemplate + '</custom-modal>';
      var customModal = $compile(customModalTemplate)(scope);
      element.replaceWith(customModal);
      // Creates unique array variable with views.
      scope[menus] = [];

      multiViewModal.registerDirective(handler());

      function handler() {
        // Object that provides methods for modal visibility handling.
        return {
          id:           id,
          isEmptyMenu:  isEmptyMenu,  // Shows whether array is initialized.
          updateMenu:   updateMenu,   // Updates views array
          recompile:    recompile     // Clears modal's content.
        };

        function isEmptyMenu() {
          return (scope[menus]) ? scope[menus].length === 0 : false;
        }

        function updateMenu(menu) {
          scope[menus] = menu;
        }

        function recompile() {
          var pane = angular.element(customModal.children()[0]);
          pane.empty();
          pane.append($compile(menusTemplate)(scope));
        }
      }


    }

  }]);

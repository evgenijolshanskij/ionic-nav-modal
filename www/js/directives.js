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
      var menus = 'menu_' + id;
      setViews();
      var options = getOptions();

      // Compiles modal content.
      var menusTemplate = '<ion-pane ng-repeat="item in ' + menus + '" ng-show="item.isActive" ng-include="item.url"></ion-pane>';
      var customModalTemplate = '<custom-modal id="' + id + '">' + menusTemplate + '</custom-modal>';
      var customModal = $compile(customModalTemplate)(scope);
      element.replaceWith(customModal);

      multiViewModal.registerDirective(handler());

      /**
       * Retrieves data from the inner view items
       * and applies it to the scope.
       */
      function setViews() {
        scope[menus] = [];
        angular.forEach(element.children(), function (viewItem) {
          if (viewItem.localName === 'view-item') {
            var view = {};
            if (viewItem.attributes['name'])      view.name = viewItem.attributes['name'].value;
            if (viewItem.attributes['url'])       view.url = viewItem.attributes['url'].value;
            if (viewItem.attributes['isActive'])  view.isActive = viewItem.attributes['isActive'].value === 'true';
            if (viewItem.attributes['root'])      view.root = viewItem.attributes['root'].value === 'true';
            if (viewItem.attributes['parent'])    view.parent = viewItem.attributes['parent'].value;
            scope[menus].push(view);
          }
        });
      }

      /**
       * Reads the option attributes.
       *
       * @returns options object.
       */
      function getOptions() {
        return {
          // Stores the root view.
          root:       findRoot(),
          // Determines if all data should be erased after modal is closed.
          erasable:   validateBoolean(attrs.erasable),
          // Determines if the root view will be set as active after modal is closed.
          returnable: validateBoolean(attrs.returnable)
        };

        function validateBoolean(value) {
          if (value) return value === 'true';
          return true;
        }

        function findRoot() {
          var result = undefined;
          angular.forEach(scope[menus], function (view) {
            if (view.root) result = view;
          });
          return result;
        }
      }

      /**
       * Creates a handler to run the directive.
       *
       * @returns directive handler.
       */
      function handler() {
        return {
          id:           id,
          setActive:    setActive,    // Finds view and sets as active
          previous:     previous,     // Returns to the parent view
          close:        close         // Needs to be invoked after modal is closed
        };

        function setActive(name) {
          angular.forEach(scope[menus], function (view) {
            if (view.name === name)
              view.isActive = true;
            else
              delete view.isActive;
          });
        }

        function previous() {
          setActive(scope[menus].findByActivity().parent)
        }

        function close() {
          if (options.erasable) recompile();
          if (options.returnable) setActive(options.root.name);
        }

        function recompile() {
          var pane = angular.element(customModal.children()[0]);
          pane.empty();
          pane.append($compile(menusTemplate)(scope));
        }
      }


    }

  }]);

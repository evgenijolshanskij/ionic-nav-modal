angular.module('starter.directives', [])

/**
 * Renders modal template.
 *
 */
  .directive('customModal', ['customModal', '$compile', function (customModal, $compile) {

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
      var modalEl = '<ion-pane ng-hide="' + ngHideBinder + '" class="menu-animation ng-hide">' +
        '</ion-pane>';
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
        function show() {
          scope[ngHideBinder] = false;
        }

        // Hides modal.
        function close() {
          scope[ngHideBinder] = true;
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
      var views = 'view_' + id;
      scope[views] = retrieveMenus(element.children());
      var options = {
        // Stores the root view.
        root:       findRoot(scope[views]),
        // Determines if all data should be erased after a modal is closed.
        erasable:   attrs.erasable ? attrs.erasable === 'true' : true,
        // Determines if the root view will be set as active after modal is closed.
        returnable: attrs.returnable ? attrs.returnable === 'true' : true
      };

      // Compiles modal content.
      var menusTemplate = '<ion-pane ng-repeat="item in ' + views + '"' +
        ' ng-show="item.isActive" ng-include="item.url"></ion-pane>';
      var customModalTemplate = '<custom-modal id="' + id + '">' + menusTemplate +
        '</custom-modal>';
      var customModal = $compile(customModalTemplate)(scope);
      element.replaceWith(customModal);

      multiViewModal.registerDirective(handler());

      /**
       * Retrieves data from the inner view items
       * and applies it to the scope.
       */
      function retrieveMenus(childElements) {
        var views = [];
        initMenus();
        return views;

        // Loops over the all child elements, finds the <view-item>
        // and retrieves the data from its attributes.
        // Assigns the retrieved data to the views array.
        function initMenus() {
          angular.forEach(childElements, function (viewItem) {
            if (viewItem.localName === 'view-item') {
              var view = {};
              angular.forEach(['name', 'url', 'isActive', 'root', 'parent'],
                setName.bind({viewItem: viewItem, view: view}));
              views.push(view);
            }
          });

          // Helps to get value from an attribute.
          // Determines whether the value is Boolean.
          function setName(name) {
            if (this.viewItem.attributes[name]) {
              var value = this.viewItem.attributes[name].value;
              this.view[name] = value === 'true' || value === 'false' ? value === 'true' : value;
            }
          }
        }
      }

      /**
       * Finds the root view.
       *
       * @returns root view.
       */
      function findRoot(views) {
        var result = undefined;
        angular.forEach(views, function (view) {
          if (view.root) result = view;
        });
        return result;
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
          close:        close         // Needs to be invoked after a modal is closed
        };

        // Sets view with an appropriate name as active.
        function setActive(name) {
          angular.forEach(scope[views], function (view) {
            if (view.name === name)
              view.isActive = true;
            else
              delete view.isActive;
          });
        }

        // Goes back to the previous view.
        function previous() {
          // findByActivity() method has been added to the Array's prototype
          // and can be found in app.js file of the source code on GitHub or Plunker.
          setActive(scope[views].findByActivity().parent)
        }

        // Invokes after a modal is closed.
        function close() {
          // If the 'erasable' option is set,
          // then recompiles modal (erases all the input data).
          if (options.erasable) recompile();
          // If the 'returnable' option is set,
          // Returns to the root view.
          if (options.returnable) setActive(options.root.name);

          function recompile() {
            var pane = angular.element(customModal.children()[0]);
            pane.empty();
            pane.append($compile(menusTemplate)(scope));
          }
        }
      }
    }
  }]);

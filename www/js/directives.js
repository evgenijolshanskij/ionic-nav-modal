angular.module('starter.directives', [])

/**
 * Renders modal template.
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

      // gets the directive id
      var id = attrs.id;
      // creates a unique variable name for `ng-hide`
      var ngHideBinder = "hidden_" + id;
      var modalEl = '<ion-pane ng-hide="' +
        ngHideBinder +
        '" class="menu-animation ng-hide"></ion-pane>';
      scope[ngHideBinder] = true;
      // gets the directive content and appends it to a modal element
      transclude(function(clone) {
        var wrapper = $compile(modalEl)(scope);
        element.append(wrapper.append(clone));
      });
      // registers directive handler in the customModal service
      customModal.setHandler(id, handler());

      //////////////////////////////////

      // object that provides methods for the modal visibility handling
      function handler() {
        return {
          show: show,
          close: close,
          isHidden: isHidden
        };

        // shows the modal
        function show() {
          scope[ngHideBinder] = false;
        }

        // hides the modal
        function close() {
          scope[ngHideBinder] = true;
        }

        // checks if the modal is hidden / visible
        function isHidden() {
          return scope[ngHideBinder];
        }
      }

    }

  }])

  .directive('multiViewModal', ['multiViewModal', '$compile',
    function (multiViewModal, $compile) {

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

      // reads views defined as child directive elements
      scope[views] = readViews(element.children());

      // reads options defined as directive attributes
      var options = {
        // Determines if all data should be erased after a modal is closed.
        erasable:   attrs.erasable ? attrs.erasable === 'true' : true,
        // Determines if the root view will be set as active after modal is closed.
        returnable: attrs.returnable ? attrs.returnable === 'true' : true
      };

      // initializes and updates directive template
      var viewsTemplate = '<ion-pane ng-repeat="item in ' + views + '"' +
        ' ng-show="item.isActive" ng-include="item.url"></ion-pane>';

      var baseModalTemplate = '<custom-modal id="' + id + '">' +
          viewsTemplate +
        '</custom-modal>';

      var baseModal = $compile(baseModalTemplate)(scope);
      element.replaceWith(baseModal);

      // registers directive handler in the customModal service
      multiViewModal.setHandler(id, handler());

      /**
       * Retrieves information about the views from the inner view items and their attrs.
       */
      function readViews(childElements) {
        return Array.from(childElements).reduce(function (views, viewItem) {
          if (viewItem.localName === 'view-item') {
            views.push(
              ['name', 'url', 'isActive', 'root', 'parent'].reduce(function(view, attrName) {
                var attribute = viewItem.attributes[attrName];
                if (attribute) {
                  var value = attribute.value;
                  view[attrName] = value === 'true' || value === 'false' ? value === 'true' : value;
                }
                return view;
              }, {})
            );
          }
          return views;
        }, []);
      }

      /**
       * Creates a handler to manipulate the directive state.
       */
      function handler() {
        return {
          options: options,
          activateRoot: activateRoot, // activate the root view
          activateView: activateView, // activates view with the given name
          previousView: previousView, // activates the previous view in hierarchy
          clearInputs:  clearInputs   // clears all inputs by recompiling the modal
        };

        // Sets view with an appropriate name as active.
        function activateView(name) {
          scope[views].forEach(function (view) {
            if (view.name === name)
              view.isActive = true;
            else
              delete view.isActive;
          });
        }

        function activateRoot() {
          activateView(scope[views].find(function (view) { return view.root; }).name);
        }

        // goes back to the previous view.
        function previousView() {
          activateView(scope[views].findByActivity().parent);
        }

        function clearInputs() {
          var pane = angular.element(baseModal.children()[0]);
          pane.empty();
          pane.append($compile(viewsTemplate)(scope));
        }
      }
    }
  }]);

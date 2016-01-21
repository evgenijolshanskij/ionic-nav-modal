angular.module('starter.directives', [])

/**
 * Directive renders modal container template and wraps its content.
 */
.directive('cModal', ['customModal', '$compile', function (customModal, $compile) {

  var link = function (scope, element, attrs, ctrl, transclude) {

    // Creates a variable name to get it be bound to `ng-hide`.
    var ngHideBinder = "hidden_" + attrs.id;
    scope[ngHideBinder] = true;

    transclude(function (clone) {
      var wrapper = $compile('<ion-pane ng-hide="' + ngHideBinder + '" class="menu-animation ng-hide"></ion-pane>')(scope);
      // Appends wrapper element and content of the directive.
      element.append(wrapper.append(clone));
    });

    // Object that provides methods for modal visibility handling.
    var handler = {
      id: attrs.id,
      // Makes modal visible.
      show: function () {
        scope[ngHideBinder] = false;
      },
      // Hides modal.
      close: function () {
        scope[ngHideBinder] = true;
      },
      // Shows current state of the modal.
      isHidden: function () {
        return scope[ngHideBinder];
      }
    };

    // Passes handles to the customModal service.
    customModal.registerDirective(handler);

  };

  return {
    restrict: 'E',
    transclude: true,
    link: link
  }

}])

.directive('navMenu', ['multiViewModal', '$compile', function (multiViewModal, $compile) {

  var link = function (scope, element, attrs) {

    // Creates a variable name for array that holds views.
    var menus = 'menu_' + attrs.id;

    // Compiles modal content.
    var menusTemplate = '<ion-pane ng-repeat="item in ' + menus + '" ng-show="item.isActive" ng-include="item.url"></ion-pane>';
    var customModal = $compile(
      '<c-modal id="' + attrs.id + '">' + menusTemplate + '</c-modal>')(scope);
    element.replaceWith(customModal);

    // Creates unique array variable with views.
    scope[menus] = [];

    // Object that provides methods for modal visibility handling.
    var handler = {
      id: attrs.id,
      // Shows whether array is initialized.
      isEmptyMenu: function (id) {
        return (scope[menus] !== undefined) ? scope[menus].length === 0 : false;
      },
      // Updates views array
      updateMenu: function (id, menu) {
        scope[menus] = menu;
      },
      // Clears modal's content.
      recompile: function () {
        var pane = angular.element(customModal.children()[0]);
        pane.empty();
        pane.append($compile(menusTemplate)(scope));
      }
    };

    multiViewModal.registerDirective(handler);

  };

  return {
    restrict: 'E',
    link: link
  }

}]);

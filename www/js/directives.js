angular.module('starter.directives', [])

/**
 * Directive renders container template for modal content.
 * Works along with the navigableModal service.
 */
.directive('cModal', ['customModal', '$compile', function (customModal, $compile) {

  var link = function (scope, element, attrs, ctrl, transclude) {

    var ngHideBinder = "hidden_" + attrs.id;
    scope[ngHideBinder] = true;

    transclude(function (clone) {
      var wrapper = $compile('<ion-pane ng-hide="' + ngHideBinder + '" class="menu-animation ng-hide"></ion-pane>')(scope);
      element.append(wrapper.append(clone));
    });

    var handler = {
      id: element.attr('id'),
      show: function () {
        scope[ngHideBinder] = false;
      },
      close: function () {
        scope[ngHideBinder] = true;
      },
      isHidden: function () {
        return scope[ngHideBinder];
      }
    };

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

    var menus = 'menu_' + attrs.id;

    var menusTemplate = '<ion-pane ng-repeat="item in ' + menus + '" ng-show="item.isActive" ng-include="item.url"></ion-pane>';
    var customModal = $compile(
      '<c-modal id="' + attrs.id + '">' + menusTemplate + '</c-modal>')(scope);
    element.replaceWith(customModal);

    // Creates unique array variable with views.
    scope[menus] = [];

    var handler = {
      id: element.attr('id'),
      isEmptyMenu: function (id) {
        return (scope[menus] !== undefined) ? scope[menus].length === 0 : false;
      },
      updateMenu: function (id, menu) {
        scope[menus] = menu;
      },
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

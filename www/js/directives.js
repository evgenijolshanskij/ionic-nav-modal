angular.module('starter.directive', [])

/**
 * Directive renders container template for modal content.
 * Works along with the navigableModal service.
 */
.directive('navModal', ['navigatingModal', function (navigatingModal) {

  var template = '<ion-pane ng-hide="hidden" class="menu-animation ng-hide"></ion-pane>';

  var link = function (scope, element, attrs, ctrl, transclude) {

    transclude(scope, function (clone) {
      angular.element(element.children()[0]).append(clone);
    });

    scope.hidden = true;

    var manageIt = {
      show: function () {
        scope.hidden = false;
      },
      close: function () {
        scope.hidden = true;
      },
      isHidden: scope.hidden
    };

    navigatingModal.registerDirective(manageIt);

  };

  var controller = function ($scope) {};

  return {
    restrict: 'E',
    template: template,
    transclude: true,
    link: link,
    controller: ['$scope', controller]
  }

}])

.directive('navMenu', ['navigatingMenu', '$compile', function (navigatingMenu, $compile) {

  var template = '<ion-pane ng-repeat="item in menu" ng-show="item.isActive" ng-include="item.url"></ion-pane>';

  var link = function (scope, element) {

    scope.menu = [];

    var manageIt = {
      isEmptyMenu: function () {
        return scope.menu.length === 0;
      },
      updateMenu: function (menu) {
        scope.menu = menu;
      },
      recompile: function () {
        element.empty();
        element.append($compile(template)(scope));
      }
    };

    navigatingMenu.registerDirective(manageIt);

  };

  return {
    require: '^navModal',
    restrict: 'E',
    transclude: true,
    template: template,
    link: link
  }

}]);

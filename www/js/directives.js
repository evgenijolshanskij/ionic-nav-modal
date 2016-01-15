angular.module('starter.directive', [])

/**
 * Directive renders container template for modal content.
 * Works along with the navigableModal service.
 */
.directive('navModal', ['navigatingModal', function (navigatingModal) {

    var template =
      '<ion-pane ng-hide="hidden" class="menu-animation ng-hide">' +
        '<ion-pane ng-repeat="item in menu" ng-show="item.isActive" ng-include="item.url"></ion-pane>' +
      '</ion-pane>';

  var link = function (scope) {
    scope.hidden = true;
    scope.menu = [];

    var manageIt = {
      isEmptyMenu: function () {
        return scope.menu.length === 0;
      },
      updateMenu: function (menu) {
        scope.menu = menu;
      },
      show: function () {
        scope.hidden = false;
      },
      close: function () {
        scope.hidden = true;
      },
      isHidden: scope.hidden
    };

    navigatingModal.registerDirective(manageIt)
  };

  return {
    restrict: 'E',
    template: template,
    link: link
  }

}])

.directive('navMenu', function () {

  var template = '<ion-pane ng-repeat="item in menu" ng-show="item.isActive" ng-include="item.url"></ion-pane>';

  var link = function (scope) {
    scope.menu = [];

    var manageIt = {
      isEmptyMenu: function () {
        return scope.menu.length === 0;
      },
      updateMenu: function (menu) {
        scope.menu = menu;
      }
    };


  };

  return {
    require: '^navModal',
    restrict: 'A',
    template: template,
    link: link
  }

});

angular.module('starter.directive', [])

/**
 * Directive renders container template for modal content.
 * Works along with the navigableModal service.
 */
.directive('navModal', [function () {

    var template =
      '<ion-pane ng-hide="hidden" class="menu-animation ng-hide">' +
        '<ion-pane ng-repeat="item in menu" ng-show="item.isActive" ng-include="item.url"></ion-pane>' +
      '</ion-pane>';

    return {
      template: template
    }

}]);

angular.module('starter.directives', [])

/**
 * Directive renders container template for modal content.
 * Works along with the navigableModal service.
 */
.directive('eModal', ['customModal', '$animate', '$timeout', function (customModal, $animate, $timeout) {

  var template = '<ion-pane class="menu-animation ng-hide"></ion-pane>';

  var link = function (scope, element, attrs, ctrl, transclude) {

    var pane = element.find('ion-pane');

    transclude(scope, function (clone) {
      angular.element(element.children()[0]).append(clone);
    });


    var handler = {
      show: function () {
        $animate.removeClass(pane, 'ng-hide');
      },
      close: function () {
        $animate.addClass(pane, 'hiding');
        $timeout(function () {
          pane.addClass('ng-hide');
          pane.removeClass('hiding');
        }, 400);
      },
      isHidden: function () {
        return !pane.hasClass('ng-hide');
      }
    };

    customModal.registerDirective(handler);

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

.directive('navMenu', ['modalViews', '$compile', function (modalViews, $compile) {

  var template = '<ion-pane ng-repeat="item in menu" ng-show="item.isActive" ng-include="item.url"></ion-pane>';

  var link = function (scope, element) {

    scope.menu = [];

    var handler = {
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

    modalViews.registerDirective(handler);

  };

  return {
    require: '^eModal',
    restrict: 'E',
    transclude: true,
    template: template,
    link: link
  }

}]);

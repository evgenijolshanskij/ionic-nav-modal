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
      id: element.attr('id'),
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

  var link = function (scope, element) {

    /*
      Finds first parent eModal directive and returns its id.
     */
    var findId = function (el) {
      return (el.parent()[0].tagName.toLowerCase() === 'e-modal') ? el.parent().attr('id') : findId(el.parent());
    };

    // Gets id.
    var id = findId(element);
    // Creates template to be compiled.
    var template = '<ion-pane ng-repeat="item in menu_' + id + '" ng-show="item.isActive" ng-include="item.url"></ion-pane>';
    element.append($compile(template)(scope));

    // Creates unique array variable with views.
    scope['menu_' + id] = [];

    var handler = {
      isEmptyMenu: function (id) {
        return (scope['menu_' + id] !== undefined) ? scope['menu_' + id].length === 0 : false;
      },
      updateMenu: function (id, menu) {
        scope['menu_' + id] = menu;
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
    link: link
  }

}]);

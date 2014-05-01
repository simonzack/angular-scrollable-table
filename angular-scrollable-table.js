
/* global angular, $ */

(function(angular) {
  'use strict';

  angular.module('scrollable-table', [])
  .directive('scrollableTable', ['$timeout', '$q', function($timeout, $q) {
    /**
    Scrollable table implementation, works by separating the headers from the table body, and scrolling the table body.
    */

    return {
      transclude: true,
      restrict: 'E',
      scope: {
        rows: '=watch',
      },
      template:
        '<div class="scrollableContainer">' +
          '<div class="headerSpacer"></div>' +
          '<div class="scrollArea" ng-transclude></div>' +
        '</div>',
      controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {
        // There's no event fired when rendering is complete ($viewContentLoaded does not work),
        // so use setTimeout() instead.
        function waitForRender() {
          var deferredRender = $q.defer();
          function wait() {
            if($element.find('table:visible').length === 0) {
              $timeout(wait, 100);
            } else {
              deferredRender.resolve();
            }
          }
          $timeout(wait);
          return deferredRender.promise;
        }

        // Fix the widths of the table headers, so scrollable table works.
        function fixHeaderWidths() {
          if(!$element.find('thead th .th-inner').length)
            $element.find('thead th').wrapInner('<div class="th-inner"></div>');

          $element.find('table th .th-inner').each(function(index, el) {
            el = $(el);
            var padding = el.outerWidth() - el.width();
            var width = el.parent().width() - padding;
            // For the last header, add space for the scrollbar equivalent unless it's centered.
            var lastCol = $element.find('table th:visible:last');
            if(lastCol.css('text-align') !== 'center') {
              var hasScrollbar = $element.find('.scrollArea').height() < $element.find('table').height();
              if(lastCol[0] == el.parent()[0] && hasScrollbar) {
                width += $element.find('.scrollArea').width() - $element.find('tbody tr').width();
              }
            }

            el.css('width', width);
            var title = el.parent().attr('title');
            if(!title) {
              title = el.children().length ? el.find('.title .ng-scope').html() : el.html();
            }
            el.attr('title', title);
          });
        }

        $(window).resize(fixHeaderWidths);

        // when the data model changes, fix the header widths.  See the comments here:
        // http://docs.angularjs.org/api/ng.$timeout
        $scope.$watch('rows', function(newValue, oldValue) {
          if(newValue) {
            waitForRender().then(fixHeaderWidths);
          }
        });
      }]
    };
  }]);
})(angular);

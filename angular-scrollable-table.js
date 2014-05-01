
/* global angular, $ */

(function(angular) {
  'use strict';

  angular.module('scrollable-table', [])
  .directive('scrollableTable', ['$timeout', '$q', function($timeout, $q) {
    /**
    Scrollable table implementation, works by placing the headers absolutely, and scrolling the table body.
    */

    return {
      transclude: true,
      restrict: 'E',
      scope: {
        rows: '=watch',
      },
      template:
        '<div class="scrollContainer">' +
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

        // fix the distances of the table headers, so scrollable table works
        function fixDistances() {
          // fix widths
          var row = $element.find('table > tbody > tr:first > td');
          if(!row.length)
            return;
          $element.find('table > thead > tr > th').each(function(i, th) {
            // ignore the last header
            if(i==row.length-1)
              return;
            th = $(th);
            var padding = th.outerWidth() - th.width();
            var width = row[i].offsetWidth;
            th.css('width', width - padding);
            th.css('max-width', width - padding);
          });
          // fix heights
          var headRows = $element.find('table > thead > tr:first');
          if(!headRows.length)
            return;
          $('.scrollContainer').css('padding-top', headRows[0].offsetHeight);
        }

        // fix header widths on window resize
        $(window).resize(fixDistances);

        // fix header widths when the data model changes
        $scope.$watch('rows', function(newValue, oldValue) {
          if(newValue) {
            waitForRender().then(fixDistances);
          }
        });
      }]
    };
  }]);
})(angular);

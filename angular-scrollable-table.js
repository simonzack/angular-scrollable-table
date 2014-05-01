
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
          var row = $element.find('table > tbody > tr:first');
          if(!row)
            return;
          row = row[0];
          var cells = row.children;
          $element.find('table > thead > tr > th').each(function(i, th) {
            th = $(th);
            if(i<cells.length-1){
              var padding = th.outerWidth() - th.width();
              var width = cells[i].offsetWidth;
              th.css('width', width - padding);
              th.css('max-width', width - padding);
            }else{
              // last header includes the scrollbar, use 100% width
              th.css('width', th.width() - th.parent().width() + $(row).parent().parent().width());
            }
          });
          // fix heights
          var headRow = $element.find('table > thead > tr:first');
          if(!headRow.length)
            return;
          headRow = headRow[0];
          $('.scrollContainer').css('padding-top', headRow.offsetHeight);
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

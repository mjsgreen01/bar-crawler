angular
.module('instatrip')
.controller('mainCtrl',['$scope', '$rootScope', 'MapService', mainCtrl]);

function mainCtrl($scope, $rootScope, MapService){
  $scope.loadingBarCrawl = MapService.loadingBarCrawl;
  $scope.$watch(function () {return MapService.loadingBarCrawl;}, function(newValue, oldValue) {
    if (newValue === true) {
      $scope.loadingBarCrawl = true;
    } else {
      $scope.loadingBarCrawl = false;
    }
  });

  $scope.setScope = function(start, end, method){
    MapService.loadingBarCrawl = true;

    $rootScope.start = start;
    $rootScope.end = end;
    $rootScope.travelMethod = method || 'WALKING';
    MapService.getmap($rootScope.start, $rootScope.end, $rootScope.travelMethod);
  };

}

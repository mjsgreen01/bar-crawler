angular
.module('instatrip')
.controller('mainCtrl',['$scope', '$rootScope', 'MapService', mainCtrl])

function mainCtrl($scope, $rootScope, MapService){

  $scope.setScope = function(start, end, method){debugger;
    $rootScope.start = start;
    $rootScope.end = end;
    $rootScope.travelMethod = method || 'WALKING';
    MapService.getmap($rootScope.start, $rootScope.end, $rootScope.travelMethod);
  };

}

angular.module('instatrip.map',[])
  .controller('mapCtrl', mapCtrl);

function mapCtrl ($scope, MapService, $rootScope) {
  $scope.init = function () {
    $scope.barClicked = false;
    // $scope.makeMap();
  };
  
  function randomIntFromInterval (min,max) {
      return Math.floor(Math.random()*(max-min+1)+min);
  }
  
  // randomly add drunken-blur effect
  function setRandomInterval () {
    var bodyEl = angular.element( document.querySelector( 'body' ) );
    setTimeout(function () {
      bodyEl.addClass('youreDrunk');
      setTimeout(function () {
        bodyEl.removeClass('youreDrunk');
      }, 1500);
      setRandomInterval();
    }, randomIntFromInterval(30000,90000));
  }

  // setRandomInterval();

  // watch for user clicking on a bar
  $scope.$watch( function (scope) {
    return MapService.getImages();
  }, function (newValue, oldValue) {
    newValue === undefined || newValue.length === 0 ? $scope.barClicked = false : $scope.barClicked = true;
  });

  $scope.showUber = false;

  $scope.getmap = MapService.getmap;

  $scope.makeMap = function () {
    MapService.getmap($rootScope.start, $rootScope.end, $rootScope.travelMethod);
  };

  $scope.init();
}

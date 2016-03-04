angular.module('instatrip.map',[])
  .controller('mapCtrl', mapCtrl);

function mapCtrl ($scope, Getdata, $rootScope){
  $scope.init = function(){
    $scope.barClicked = false;
  };
  
  function randomIntFromInterval(min,max){
      return Math.floor(Math.random()*(max-min+1)+min);
  }
  
  // randomly add drunken-blur effect
  function setRandomInterval(){
    var bodyEl = angular.element( document.querySelector( 'body' ) );
    setTimeout(function(){
      bodyEl.addClass('youreDrunk');
      setTimeout(function(){
        bodyEl.removeClass('youreDrunk');
      }, 1500);
      setRandomInterval();
    }, randomIntFromInterval(30000,90000));
  }

  // setRandomInterval();

  $scope.$watch(function(scope) {
    return Getdata.getImages();
  }, function(newValue, oldValue) {
    newValue === undefined || newValue.length === 0 ? $scope.barClicked = false : $scope.barClicked = true;
  });

  $scope.showUber = false;

  $scope.getmap = Getdata.getmap;

  $scope.makeMap = function(){
    Getdata.getmap($rootScope.start, $rootScope.end, $rootScope.travelMethod);
  };

  $scope.init();
  $scope.makeMap();
}

angular.module('instatrip.map',[])
  .controller('mapCtrl', mapCtrl);

function mapCtrl ($scope, Getdata, $rootScope){
  
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
    }, randomIntFromInterval(9000,30000));
  }

  setRandomInterval();

  $scope.showUber = false;

  $scope.getmap = Getdata.getmap;

  $scope.makeMap = function(){
    Getdata.getmap($rootScope.start, $rootScope.end, $rootScope.travelMethod);
  };

  $scope.makeMap();
}

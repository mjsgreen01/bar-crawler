angular.module('instatrip.pics',[])
  .controller('picsCtrl', picsCtrl);


function picsCtrl ($scope, MapService, $rootScope, $window){

  $scope.changeImage = function(){
    $scope.imgs = MapService.getImages();
    $scope.$emit('content.changed');
    setTimeout(function(){
      $scope.$emit('content.changed');
    },1000);
  };

  $scope.changeImage();

  // This watches for changes in the MapService factory from getImages function
  // For instance when a marker is clicked currentImages changes
  $scope.$watch(function(scope) {
    return MapService.getImages();
  }, function(newValue, oldValue) {
    $scope.imgs = newValue;
  });

  $scope.openLink = function(location){
    $window.open(location);
  };

}

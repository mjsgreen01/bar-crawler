angular.module('instatrip.pics',[])
  .controller('picsCtrl', picsCtrl);


function picsCtrl ($scope, Getdata, $rootScope, $window){

  $scope.changeImage = function(){
    $scope.imgs = Getdata.getImages();
    $scope.$emit('content.changed');
    setTimeout(function(){
      $scope.$emit('content.changed');
    },1000);
  };

  $scope.changeImage();

  // This watches for changes in the Getdata factory from getImages function
  // For instance when a marker is clicked currentImages changes
  $scope.$watch(function(scope) {
    return Getdata.getImages();
  }, function(newValue, oldValue) {
    $scope.imgs = newValue;
  });

  $scope.openLink = function(location){
    $window.open(location);
  };

}

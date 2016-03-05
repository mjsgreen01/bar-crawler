angular
.module('instatrip')
.directive('ngAutocomplete', function() {
  return {
    require: 'ngModel',
    scope: {
      ngModel: '='
    },
    link: function(scope, element, attrs, controller) {
      if (scope.gPlace === undefined) {
        scope.gPlace = new google.maps.places.Autocomplete(element[0], {});
      }
      google.maps.event.addListener(scope.gPlace, 'place_changed', function() {
        var result = scope.gPlace.getPlace();
        if (result !== undefined) {
          if (result.formatted_address !== undefined) {
            controller.$setViewValue(result.formatted_address);
          }
        }
      });
    }
  };
});

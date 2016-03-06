angular.module('instatrip.mapService', [])

.factory('MapService', function ($http, $state) {
  var currentImages = [],
  currentCoords = [],
  markers = [],
  points = 15,
  activeWindow,
  Map,
  currentMarker,
  directionsDisplay,
  directionsService,
  map,
  startCoords = {
    location: {}
  },
  endCoords = {
    location: {}
  };

  var getmap = function (start,end,travelMethod) {

    travelMethod = travelMethod || 'WALKING';
    start = start || 'San Francisco';
    end = end || 'Oakland';
    directionsService = new google.maps.DirectionsService();


    getLocs(start, end);

  }; // END OF getmap()



  function getLocs (start, end) {
    return $http({
      method: 'POST',
      url: "/search",
      data: {
        start: start,
        end: end
      }
    }).then(function(resp){ 
       return $state.go('display').then(function(){return resp;}); 
    }).then(function(resp){ 
       initialize();
       return resp;
    }).then(function(resp){ 
      setMarkers(resp.data);
    })
    .catch(function(err) {
      console.log(err);
    });
  }


  var makeMarker = function makeMarker (data, id) { console.log('marker data', data, id);
    var myLatlng = new google.maps.LatLng(data.location.latitude, data.location.longitude);

    var contentString = '';

    if(data.location.address !== undefined) {
      contentString = '<div id="content" class="marker">' +
      '<div class="marker-title">' + data.barName + '</div>' +
      '<div class="marker-address">' + data.location.address + '</div>' +
      '</div>';
    } else {
      contentString = '<div id="content" class="marker">' +
      '<div class="marker-title">' + data.barName + '</div>' +
      '</div>';
    }

    // This is what will display above the marker when clicked
    var infoWindow = new google.maps.InfoWindow({
      content: contentString
    });

    // custom bar-icon
    var icon = {
      url: 'http://www.charbase.com/images/glyph/127866',
      scaledSize: new google.maps.Size(50, 50),
      origin: new google.maps.Point(0,0),
      anchor: new google.maps.Point(32,32)
    };

    var markerParams = {
      position: myLatlng,
      id: id,
      photos: data.photos
    };

    if (id !== 'start' && id !== 'end') {
      markerParams.icon = icon;
    }

    var marker = new google.maps.Marker(markerParams);

    // Add the event listener to markers so we know when they're clicked
    google.maps.event.addListener(marker, 'click', function() {
      if(activeWindow) {
        activeWindow.close();
      }
      currentImages = []; // empty out currentImages
      infoWindow.open(map, marker);
      activeWindow = infoWindow;
      currentImages = marker.photos;
      $state.go('display.pics'); // we have to fire off an event for the controller
    });

    return marker;
  };

  

  function setMarkers (data) {
    var bars = data.bars;
    markers = [];

    startCoords.location.latitude = data.startLocation.lat;
    startCoords.location.longitude = data.startLocation.lng;
    endCoords.location.latitude = data.endLocation.lat;
    endCoords.location.longitude = data.endLocation.lng;

    // this recreates the start waypoint
    startCoords.barName = 'Start';
    markers.push(makeMarker(startCoords, 'start'));
    for(var i = 0; i < bars.length; i++) {
      var newMarker = makeMarker(bars[i], i);
      markers.push(newMarker);
    }
    // this recreates the end waypoint
    endCoords.barName = 'End';
    markers.push(makeMarker(endCoords, 'end'));

    for(i = 0; i < markers.length; i++) {
      markers[i].setMap(Map);
    }
    calcRoute(start, end, travelMethod);
  }



  


  function initialize() {
    directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: true});
    var MakerSquare = new google.maps.LatLng(37.787518, -122.399868);
    var mapOptions = {
      zoom:7,
      center: MakerSquare,
      disableDefaultUI: true,
      zoomControl: true,
         zoomControlOptions: {
           style: google.maps.ZoomControlStyle.SMALL
         }
    };
    
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    // var styles = [
    //   {
    //       featureType: 'all',
    //       stylers : [
    //           {invert_lightness: 'true'}
    //       ]
    //   }
    // ];
    // map.setOptions({styles: styles});

    directionsDisplay.setMap(map);
    Map = map;
  }



  function calcRoute(start, end, travelMethod) {
    var waypoints = []; // these will be waypoints along the way
    var checkboxArray = document.getElementById('waypoints');

    if (markers.length > 0) {
      for (var k = 0; k < markers.length; k++) {
        waypoints.push({
          location: new google.maps.LatLng(markers[k].position.lat(), markers[k].position.lng()),
          stopover: true
        });
      }

    }

    var request = {
        origin: start,
        destination: end,
        waypoints: waypoints,
        travelMode: google.maps.TravelMode[travelMethod],
        unitSystem: google.maps.UnitSystem.METRIC
    };

    directionsService.route(request, function(response, status) {
      if (status === google.maps.DirectionsStatus.OK) {

          directionsDisplay.setDirections(response);
      }
      console.log('directionsService RESPONSE: ', response.routes[0]);

    });
  }


  var getImages = function(){
    return currentImages;
  };



  return {
            getmap: getmap,
            getImages: getImages
         };
});
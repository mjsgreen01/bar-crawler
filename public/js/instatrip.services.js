angular.module('instatrip.services', [])

.factory('Getdata', function ($http, $state) {
  var currentImages = [];
  var activeWindow;
  var currentCoords = [];
  var Map;
  var markers = [];
  var currentMarker;
  var points = 15;
  var startCoords = {
    location: {}
  };
  var endCoords = {
    location: {}
  };

  var getmap = function(start,end,travelMethod) {

    this.curImgs = [];

    var that = this.curImgs;

    travelMethod = travelMethod || 'WALKING';
    start = start || 'San Francisco';
    end = end || 'Oakland';
    var trvmthd = travelMethod;
    var directionsDisplay;
    var directionsService = new google.maps.DirectionsService();
    var map;
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
      directionsDisplay.setMap(map);
      Map = map;
    }

    function calcRoute(start, end, travelMethod, callback) {
      var waypoints = []; // these will be waypoints along the way
      var checkboxArray = document.getElementById('waypoints');
      if (markers.length > 0) {
        for (var k = 0; k < markers.length; k++) {
          waypoints.push({
            location: new google.maps.LatLng(markers[k].position.G, markers[k].position.K),
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
            var path = response.routes[0].overview_path;
            startCoords.location.latitude = path[0].G;
            startCoords.location.longitude = path[0].K;
            endCoords.location.latitude = path[path.length-1].G;
            endCoords.location.longitude = path[path.length-1].K;
            directionsDisplay.setDirections(response);
        }
        console.log('directionsService RESPONSE: ', response.routes[0]);
        var nPts = findN(response.routes[0].overview_path, points);
        var coords = [];
        for(var i = 0; i < nPts.length; i++){
          coords.push({
            lat: nPts[i].A,
            lng: nPts[i].F
          });
        }
        currentCoords = coords;
          // callback(response.routes[0].overview_path, coords);
      });
    }

    initialize();
    var routes = calcRoute(start, end, travelMethod, ourCallback);

// take variable length array and return an array with n evenly spaced points
    var findN = function(input, n){
        var len = input.length;
        var divis;
        var output = [];
        if (len > n){
            divis = Math.floor(len / n);
        } else {
            divis = n;
        }

        for(var i = 0; i < len; i+=divis){
            output.push(input[i]);
        }
        return output;
    };


    function ourCallback(routes, coords){
      return getPhoto({
        coords: coords
      });
    }

    var setMarkers = function(data) {
      markers = [];

      var makeMarker = function(data, id) {
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

        var icon = {
          url: 'http://www.charbase.com/images/glyph/127866',
          scaledSize: new google.maps.Size(50, 50),
          origin: new google.maps.Point(0,0),
          anchor: new google.maps.Point(32,32)
        };

        var marker = new google.maps.Marker({
          position: myLatlng,
          id: id,
          photos: data.photos,
          icon: icon
        });

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

      // this recreates the start waypoint
      startCoords.barName = 'Start';
      markers.push(makeMarker(startCoords, 'start'));
      for(var i = 0; i < data.length; i++) {
        var newMarker = makeMarker(data[i], i);
        markers.push(newMarker);
      }
      // this recreates the end waypoint
      endCoords.barName = 'End';
      markers.push(makeMarker(endCoords, 'end'));

      for(i = 0; i < markers.length; i++) {
        markers[i].setMap(Map);
      }
      calcRoute(start, end, travelMethod, ourCallback);
    };

    var getLocs = function(start, end) {
      return $http({
        method: 'POST',
        url: "/search",
        data: {
          start: start,
          end: end
        }
      }).then(function(resp){
        setMarkers(resp.data);
      })
      .catch(function(err) {
        console.log(err);
      });
    };

    getLocs(start, end);

  }; // END OF getmap()

  var markMap = function(num) {
    // collect all of the coords/create require objects and put them into markers array

    var curlen = markers.length;
    if (curlen > 0){
      for (var i = 0; i < curlen; i++){
          markers[i].setMap(null);
      }
    }
        markers = [];
    for (var j = 0; j < currentCoords.length; j++){
        var myLatlng = new google.maps.LatLng(currentCoords[j].lat ,currentCoords[j].lng);
        var marker = new google.maps.Marker({
            position: myLatlng
         });
        markers.push(marker);
    }
    // remove all of the markers expect the one need to be marked
    // To add or remove the marker to the map, call setMap();
    for (j = 0; j < currentCoords.length; j++){
        if (j === num) {
          if (currentMarker !== num){
            currentMarker = num;
            markers[j].setMap(Map);
          }
        } else {
          markers[j].setMap(null);
        }

    }
  };

  // Initiate Instagram request and package response into display
  var getPhoto = function(routes){
    var imgHolder = [];
    var linkHolder = {};
    return $http({
      method: 'POST',
      url: "/search",
      data: {start:"611 Mission Street, San Francisco, CA, United States", end:"25 Rausch Street, San Francisco, CA, United States"}

    }).then(function(resp){
      var respLength = resp.data.length;
      for(var i = 0; i < respLength; i++){
        for (var j = 0; j < resp.data[i].length; j++){
          if (!(resp.data[i][j].link in linkHolder)){
            linkHolder[resp.data[i][j].link] = resp.data[i][j];
            imgHolder.push(resp.data[i][j]);
            break;
          }
        }
      }
      currentImages = imgHolder;
      $state.go('display.pics');
      return currentImages;
    });
  };

  var getImages = function(){
    return currentImages;
  };

  return {
            getmap: getmap,
            getPhoto: getPhoto,
            getImages: getImages,
            markMap: markMap

         };
});

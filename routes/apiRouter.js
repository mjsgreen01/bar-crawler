var foursquare = require('../api/foursquare');
var instagram = require('../api/instagram');
var maps = require('../api/maps');
var uber = require('../api/uber');
var express = require('express');
var router = express.Router();

router.post('/', function(req, res) {
  var start = req.body.start;
  var end = req.body.end;

  if (!start || !end) {
    res.status(400).send();
  }

  maps.get_map_route(start, end).then(function(route) {
    var leg = route.routes[0].legs[0];
    var points = maps.choose_points(leg);

    return foursquare.get_foursquare_data_for_array_of_points(points);
  }).then(function(data) {
    var venue_ids = {};

    var fourSquareData = data.map(function(venues) {
      for(var i = 0; i < venues.length; i++) {
        if (venue_ids[venues[i].venue.id]) {
          continue;
        }

        venue_ids[venues[i].venue.id] = true;

        return {
          'name': venues[i].venue.name,
          'coordinates': {
            'lat': venues[i].venue.location.lat,
            'lng': venues[i].venue.location.lng
          },
          'address': venues[i].venue.location.formattedAddress.join(' '),
          'foursquare_v2_id': venues[i].venue.id
        };
      }
    });

    return fourSquareData;
  }).then(function(data){
    instagram.obtainInstaData(data).then(function(resData){
      res.json(resData);
    });
  });
});

router.post('/uber', function(req, res) {
  var start_latitude = parseFloat(req.body.start_latitude);
  var start_longitude = parseFloat(req.body.start_longitude);
  var end_latitude = parseFloat(req.body.end_latitude);
  var end_longitude = parseFloat(req.body.end_longitude);

  uber.get_uber_data(start_latitude, start_longitude, end_latitude, end_longitude).then(function(data) {
    res.json(data);
  });
});

module.exports = router;

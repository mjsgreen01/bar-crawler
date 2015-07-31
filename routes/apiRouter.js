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
    console.log("data from 4square", fourSquareData);
    return fourSquareData;

  }).then(function(data){
    console.log('right before calling instagram with: ', data);
    // // test-data
    // data = [ { name: 'Justice Urban Tavern',
    // coordinates: { lat: 34.05124604421524, lng: -118.2423198223114 },
    // address: '120 S Los Angeles St (1st St.) Los Angeles, CA 90012 United States',
    // foursquare_v2_id: '447bf8f1f964a520ec331fe3' }];
    instagram.obtainInstaData(data).then(function(resData){
      console.log('before sending response Data: ', resData);
      res.json(resData);
    });
  });
});

module.exports = router;

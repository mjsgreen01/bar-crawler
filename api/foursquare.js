/**
 * @module foursquare
 */

var Promise = require('bluebird');
var request = require('request-promise');

var keys = {};
if (process.env.NODE_ENV === 'production') {
  keys.FOURSQUARE_ID = process.env.FOURSQUARE_ID;
  keys.FOURSQUARE_SECRET = process.env.FOURSQUARE_SECRET;
} else {
  keys = require('../config.js');
}


/**
 * Finds bars within 300m of a coordinate
 * @param  {Array} coords
 * @param {Float} coords.0 Latitude
 * @param {Float} coords.1 Longitude
 * @return {Promise.<Array>}        Array of bars sorted by rating
 */
var get_foursquare_data_for_coord = function(coords) {
  return request({
    'uri': 'https://api.foursquare.com/v2/venues/explore',
    'qs': {
      'v': 20150728,
      'm': 'foursquare',
      'client_id': keys.FOURSQUARE_ID,
      'client_secret': keys.FOURSQUARE_SECRET,
      'll': coords.join(','),
      'radius': 300,
      'categoryId': '4bf58dd8d48988d116941735',
      // 'query': 'bar',
      'section': 'drinks',
      'limit': 15,
      'openNow': 0
    },
    'json': true
  });
};

/**
 * Takes an array of coordinates and fetches nearby bars from for
 * @param  {Object[]} points
 * @param {Float} points[].lat Latitude
 * @param {Float} points[].lng Longitude
 * @return {Promise.<Array>} Array of results from [get_foursquare_data_for_coord]{@link module:foursquare~get_foursquare_data_for_coord}
 */
var get_foursquare_data_for_array_of_points = function(points) {
  var calls = [];

  points.forEach(function(point) {
    calls.push(get_foursquare_data_for_coord([point.lat, point.lng]));
  });

  return Promise.all(calls);
};


/**
 * Filters out unwanted bar types and sorts Foursquare results
 * @param  {Object} res Result from [get_foursquare_data_for_coord]{@link module:foursquare~get_foursquare_data_for_coord}
 * @return {Object[]}     Filtered and sorted results
 */
var filter_foursquare_data = function(res) {
  var data = res.response.groups[0].items;

  data = data.filter(function(obj) {
    return !(obj.venue.categories[0].id in {
      '4bf58dd8d48988d1d5941735': 'Hotel Bars',
      '4bf58dd8d48988d119941735': 'Hookah Bar'
    });
  });

  var with_ratings = data.filter(function(obj) {
    return obj.venue.rating !== undefined;
  });

  if (with_ratings.length) {
    data = with_ratings.sort(function(a, b) {
      if (a.venue.rating > b.venue.rating) {
        return -1;
      } else if (a.venue.rating < b.venue.rating) {
        return 1;
      } else {
        return 0;
      }
    });
  } else {
    data = data.sort(function(a, b) {
      if (a.venue.stats.checkinscount > b.venue.stats.checkinscount) {
        return 1;
      } else if (a.venue.stats.checkinscount < b.venue.stats.checkinscount) {
        return -1;
      } else {
        return 0;
      }
    });
  }

  return data;
};


/**
 * Choose bars from filtered and sorted results
 * @param  {Object[]} data - Result from [filter_foursquare_data]{@link module:foursquare~filter_foursquare_data}
 * @param  {Boolean} [always_top=false] - Always return the top sorted results
 *
 * @returns {Object[]} list - Array of chosen bars
 * @returns {String} list[].name - Name of venue
 * @returns {Object} list[].coordinates - Coordinates of venue
 * @returns {Float} list[].coordinates.lat - Latitude of venue
 * @returns {Float} list[].coordinates.lng - Longitude of venue
 * @returns {String} list[].address - Address of venue
 * @returns {Integer} list[].foursquare_v2_id - Foursquare id of venue
 */
var choose_foursquare_venues = function(data, always_top) {
  always_top = (always_top === undefined) ? false : always_top;
  var venue_ids = {};

  var fourSquareData = data.map(function(venues) {
    venues = venues.filter(function(venue) {
      return !(venue_ids[venue.venue.id]);
    });

    if (!venues.length) {
      return undefined;
    }

    var index = (always_top) ? 0 : Math.floor(Math.random() * venues.length);

    return {
      'name': venues[index].venue.name,
      'coordinates': {
        'lat': venues[index].venue.location.lat,
        'lng': venues[index].venue.location.lng
      },
      'address': venues[index].venue.location.formattedAddress.join(' '),
      'foursquare_v2_id': venues[index].venue.id
    };
  });

  // Filter out undefined indexes
  fourSquareData = fourSquareData.filter(function(location){
    return location !== undefined;
  });

  return fourSquareData;
};

module.exports = {
  get_foursquare_data_for_coord: get_foursquare_data_for_coord,
  get_foursquare_data_for_array_of_points: get_foursquare_data_for_array_of_points,
  filter_foursquare_data: filter_foursquare_data,
  choose_foursquare_venues: choose_foursquare_venues
};

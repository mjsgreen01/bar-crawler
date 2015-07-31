var keys = require('../config.js');
var Promise = require('bluebird');
var request = require('request-promise');
// Uber API Constants
var uberClientId = keys.UBER_CLIENT_ID
  , uberServerToken = keys.UBER_SERVER_TOKEN;




// Create variable to store timer
// var timer;

//get price estimates

var getPriceEstimates = function(latitude, longitude, end_latitude, end_longitude) {
  return request({
    uri: "https://api.uber.com/v1/estimates/price",
    headers: {
      Authorization: "Token " + uberServerToken
    },
    qs: {
      start_latitude: latitude,
      start_longitude: longitude,
      end_latitude: end_latitude,
      end_longitude: end_longitude
    },
    json: true
  }).then(function(res) {

      // 'res' is an object with a key containing an Array
      var data = res["prices"]; 
      return data;
  })
};

var getTimeEstimates = function(latitude, longitude) {
  return request({
      uri: "https://api.uber.com/v1/estimates/time",
      headers: {
        Authorization: "Token " + uberServerToken
      },
      qs: { 
        start_latitude: latitude,
        start_longitude: longitude
      },
      json: true
    })
      .then(function(res) {

        // 'res' is an object with a key containing an Array
        var data = res["times"];
        return data; 
      
    });
  };

var get_uber_data = function(latitude, longitude, end_latitude, end_longitude){
  var calls = [getPriceEstimates(latitude, longitude, end_latitude, end_longitude), getTimeEstimates(latitude, longitude)];
  return Promise.all(calls).then(function(data_array) {
    var uber_arr = [];
    for(var i = 0; i < data_array[0].length; i++) {
      var temp = data_array[0][i];
      temp.eta = data_array[1][i].estimate;
      uber_arr.push(temp);
    }
    return uber_arr;
  });
};



module.exports = {
  getPriceEstimates: getPriceEstimates,
  getTimeEstimates: getTimeEstimates,
  get_uber_data: get_uber_data
};
  
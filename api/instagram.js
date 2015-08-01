var instagram = require('instagram-node-lib');
var Promise = require('bluebird');

var keys = {};
if (process.env.NODE_ENV === 'production') {
  keys.INSTAGRAM_ID = process.env.INSTAGRAM_ID;
  keys.INSTAGRAM_SECRET = process.env.INSTAGRAM_SECRET;
} else {
  keys = require('../config.js');
}

instagram.set('client_id', keys.INSTAGRAM_ID);
instagram.set('client_secret', keys.INSTAGRAM_SECRET);



/**
* Gets instagram photos tagged with a specific location.
* Searches by instagram-location-ID
*/
var getInstaDataById = function(locationId, barName, coords, lat, lng, address ){
  var d = new Date();
  var m = d.getMonth();
  d.setMonth(d.getMonth() - 12);

  // If still in same month, set date to last day of 
  // previous month
  if (d.getMonth() == m) d.setDate(0);
  d.setHours(0,0,0);

  // Get the time value in milliseconds and convert to seconds
  var timeStamp = d/1000;

  return new Promise(function(resolve, reject){
    instagram.locations.recent({ location_id: locationId, min_timestamp: timeStamp,
      complete: function(data){
        // 'data' is an array of photo-objects for a specific location
        resolve({barName:barName, lat: lat, lng: lng, address: address, data: data});
      },error: function(errorMessage, errorObject, caller){
        reject(errorMessage);
        // console.log(errorMessage);
      }
    });
  });
};



/**
* Gets instagram location info based on foursquare ID
*/
var getInstaLocation = function(foursquareId, barName, coords, lat, lng, address, dist){
  return new Promise(function(resolve, reject){
    instagram.locations.search({ foursquare_v2_id: foursquareId, 
      complete: function(data){
        console.log('instagram location info request data: ', data);
        if (data.length === 0) {
          resolve();
        }else{
          resolve({
            instagramLocationId: data[0].id,
            barName: barName, 
            coords: coords, 
            lat: lat,
            lng: lng,
            address: address
          });
        }
      },error: function(errorMessage, errorObject, caller){
        reject(errorMessage);
        console.log(errorMessage);
        // console.log(errorMessage);
      } 
    });
  });
};



/**
* Format instagram data object to send back to client
*/
var photoParser = function(barName, lat, lng, address, photoObjArr){
  var results = [];
  var locationPhotoObj = { barName: barName, location: {latitude: lat, longitude: lng, address: address}, photos: [] };
  for(var i = 0; i < photoObjArr.length; i++){
    locationPhotoObj.photos.push({
      link: photoObjArr[i].link,
      url: photoObjArr[i].images.low_resolution.url
    });
  }

  return locationPhotoObj;

};



/**
* This gets called first
* Recieves array of locations' data
*/

var obtainInstaData = function(instaData){
  return new Promise(function(resolve, reject){
  
    var lat, lng, barName, foursquare_v2_id, address; 
    var dist = 300; // dist unit: m, max: 5000m --- distance around lat+lng to look for photos
    var instaLocationPromiseArr = [];

    // get the instagram id of each location based on the foursquare id
    for (var i = 0; i < instaData.length; i++){
      foursquare_v2_id = instaData[i].foursquare_v2_id;
      barName = instaData[i].name;
      lat = instaData[i].coordinates.lat;
      lng = instaData[i].coordinates.lng;
      address = instaData[i].address;
      // save each promise in an array
      instaLocationPromiseArr.push( getInstaLocation( foursquare_v2_id, barName, instaData, lat, lng, address, dist ) );
    }

    // once all promises are resolved, look up photos tagged with each location
    Promise.all( instaLocationPromiseArr ).then(function(resultsArr){
      var instaDataPromiseArr = [];

      // filter out results where instagram did not find a location matching a foursquare ID
      resultsArr = resultsArr.filter(function(location){
        return location !== undefined;
      });

      for (var i = 0; i < resultsArr.length; i++){
        var instagramLocationId = resultsArr[i].instagramLocationId;
        var barName = resultsArr[i].barName;
        var  coords = resultsArr[i].coords;
        var  lat = resultsArr[i].lat;
        var  lng = resultsArr[i].lng;
        var address = resultsArr[i].address;

        instaDataPromiseArr.push( getInstaDataById( instagramLocationId, barName, coords, lat, lng, address ) );
      }

      return Promise.all( instaDataPromiseArr );
      // once all promises are resolved, format the data for each location to send to client
    }).then(function(resultsArr){
      var parsedResultsArr = [];

      // format each location's data to send back to client
      for(var i = 0; i < resultsArr.length; i++){
        var barName = resultsArr[i].barName;
        var lat = resultsArr[i].lat;
        var lng = resultsArr[i].lng;
        var address = resultsArr[i].address;
        var photoObjArr = resultsArr[i].data;

        parsedResultsArr.push( photoParser(barName, lat, lng, address, photoObjArr) );
      }

      resolve(parsedResultsArr);

    });

  });
};



module.exports = {
  obtainInstaData: obtainInstaData
};


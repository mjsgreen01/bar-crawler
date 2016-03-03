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
var getInstaDataById = function (instagramVenue ) {
  var d = new Date();
  var m = d.getMonth();
  d.setMonth(d.getMonth() - 12);

  // If still in same month, set date to last day of 
  // previous month
  if (d.getMonth() == m) d.setDate(0);
  d.setHours(0,0,0);

  // Get the time value in milliseconds and convert to seconds
  var timeStamp = d/1000;

  return new Promise(function (resolve, reject) {
    instagram.locations.recent({ location_id: instagramVenue.instagramLocationId, min_timestamp: timeStamp,
      complete: function (photoObjArr) {
        // 'photoObjArr' is an array of photo-objects for a specific location
        // TODO: use extend here to add photoObjArray to the obj. rather than rebuilding it by hand
        resolve({
          barName:instagramVenue.barName, 
          lat: instagramVenue.lat, 
          lng: instagramVenue.lng, 
          address: instagramVenue.address, 
          photoObjArr: photoObjArr
        });
      },error: function (errorMessage, errorObject, caller) {
        reject(errorMessage);
        // console.log(errorMessage);
      }
    });
  });
};



/**
* Gets instagram location info based on foursquare ID
*/
var getInstaLocation = function (foursquareVenue) {
  return new Promise(function (resolve, reject) {
    instagram.locations.search({ foursquare_v2_id: foursquareVenue.foursquareId, 
      complete: function (data) {
        console.log('instagram location info request data: ', data);
        if (data.length === 0) {
          resolve();
        }else{
          // TODO: use extend here to add instagramLocationId to the obj. rather than rebuilding it by hand
          resolve({
            instagramLocationId: data[0].id,
            barName: foursquareVenue.barName, 
            coords: foursquareVenue.coords, 
            lat: foursquareVenue.lat,
            lng: foursquareVenue.lng,
            address: foursquareVenue.address
          });
        }
      },error: function (errorMessage, errorObject, caller) {
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
var photoParser = function (venueData) {
  var locationPhotoObj = { 
    barName: venueData.barName, 
    location: {
      latitude: venueData.lat, 
      longitude: venueData.lng, 
      address: venueData.address
    }, 
    photos: [] 
  };

  // get the link and low-res image from each intagram photo obj.
  for(var i = 0; i < venueData.photoObjArr.length; i++){
    locationPhotoObj.photos.push({
      link: venueData.photoObjArr[i].link,
      url: venueData.photoObjArr[i].images.low_resolution.url
    });
  }

  return locationPhotoObj;

};



/**
* This gets called first
* @param {Array} foursquareData - array of foursquare location objects
*/

var obtainInstaData = function (foursquareData) {
  return new Promise(function (resolve, reject) {
  
    var lat, lng, barName, foursquare_v2_id, address; 
    var instaLocationPromiseArr = [];

    // get the instagram id of each location based on the foursquare id
    // TODO: verify that we can remove the 'coords' property here
    // TODO: use forEach with extend here instead of rebuilding the obj. by hand
    for (var i = 0; i < foursquareData.length; i++){
      foursquareVenue = {
        foursquare_v2_id: foursquareData[i].foursquare_v2_id,
        barName: foursquareData[i].name,
        coords: foursquareData,
        lat: foursquareData[i].coordinates.lat,
        lng: foursquareData[i].coordinates.lng,
        address: foursquareData[i].address
      };
      // save each promise in an array
      instaLocationPromiseArr.push( getInstaLocation( foursquareVenue ) );
    }

    // once all promises are resolved, look up photos tagged with each location
    Promise.all( instaLocationPromiseArr ).then(function (resultsArr) {
      var instaDataPromiseArr = [];

      // filter out results where instagram did not find a location matching a foursquare ID
      resultsArr = resultsArr.filter(function (location) {
        return location !== undefined;
      });

      resultsArr.forEach(function (instagramVenue) {
        instaDataPromiseArr.push( getInstaDataById( instagramVenue ) );
      });

      return Promise.all( instaDataPromiseArr );
    // once all promises are resolved, format the data for each location to send to client
    }).then(function (resultsArr) {
      var parsedResultsArr = [];

      // format each location's data to send back to client
      resultsArr.forEach(function (instagramVenueData) {
        parsedResultsArr.push( photoParser( instagramVenueData ) );
      });

      resolve(parsedResultsArr);

    });

  });
};



module.exports = {
  obtainInstaData: obtainInstaData
};


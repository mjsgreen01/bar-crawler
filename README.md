# Orbiting Kittens
Orbiting Kittens Project Repo

## Overview ##

Barcrawler enables users to input a start and end point to automatically build a bar crawl route with Instagram pictures from each stop.

<!-- Simply visit https://teamkraken.herokuapp.com to use the application. -->

## Installation ##

To work on the source code, after cloning the repo you must `npm install` & `bower install`.

To start your local server run `npm start`.

## API Reference ##

We utilized both Google Maps, Instagram, and Foursquare APIs.
You can get API keys for each from:
* Instagram: <https://instagram.com/developer/clients/register/>
* Foursquare: <https://foursquare.com/developers/register>
* Google Maps: <https://console.developers.google.com/flows/enableapi?apiid=directions_backend&keyType=SERVER_SIDE>


You must create a config.js file within the instatrip folder and insert the below into it + your keys:

    module.exports = {
      INSTAGRAM_ID: 'KEY',
      INSTAGRAM_SECRET: 'KEY',

      FOURSQUARE_ID: 'KEY',
      FOURSQUARE_SECRET: 'KEY',

      MAPS_KEY: 'KEY'
    }

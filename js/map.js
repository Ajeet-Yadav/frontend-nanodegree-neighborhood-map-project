// google map api //
'use strict';

var map;

// constructor fn to create a new google map center and zoom 
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 47.6133436, lng: -122.3460575},
    zoom: 12
  });

  // center map based on screen size
  // https://developers.google.com/maps/documentation/javascript/events#DomEvents
  // http://stackoverflow.com/questions/18444161/google-maps-responsive-resize
  google.maps.event.addDomListener(window, 'resize', function() {
    var center = map.getCenter();
    google.maps.event.trigger(map, 'resize');
    map.setCenter(center);
  });

  var ViewModel = function() {
    var self = this;

    // create an observable array by passing in the locations data
    // museum observable array need to contain marker
    self.museums = ko.observableArray(locations);

    // search
    self.query = ko.observable('');

    // click list view item opens marker with info
    self.listClick = function(museum) {
      google.maps.event.trigger(museum.marker, 'click');
    };

    // https://discussions.udacity.com/t/having-trouble-on-markers-array/181801/3
    /*
    rather than creating a separate array of markers, I would create an observable array of locations, and make each marker a property of the location
    */
    var marker;
    var largeInfoWindow = new google.maps.InfoWindow();
    self.museums().forEach(function(museum) {
      // define the marker
      marker = new google.maps.Marker({
        position: new google.maps.LatLng(museum.location.lat, museum.location.lng),
        map: map,
        title: museum.name,
        animation: google.maps.Animation.DROP,

      });

      museum.marker = marker;

      marker.addListener('click', function(infowindow) {
        populateInfoWindow(this, largeInfoWindow);
        toggleBounce(this);
      });
    })

    // https://discussions.udacity.com/t/search-function-implemetation/15105/33
    // https://discussions.udacity.com/t/having-problems-linking-markers-getting-them-to-disappear/182951
    self.search = ko.computed(function() {
      var query = self.query().toLowerCase();
      if(!query) {
        // reset markers
        self.museums().forEach(function(museum) {
          museum.marker.setVisible(true);
        })
        return self.museums();
      } else {
        return ko.utils.arrayFilter(self.museums(), function(museum) {
          var queryMatch = museum.name.toLowerCase().indexOf(self.query().toLowerCase()) >= 0;
          museum.marker.setVisible(queryMatch);
          return queryMatch;
        });
      }
    });

  } // end ViewModel
  ko.applyBindings(new ViewModel());

} // end map init

// google map error handling
//  https://discussions.udacity.com/t/handling-google-maps-in-async-and-fallback/34282#using-jquery
function googleMapError() {
  document.getElementById('map').innerHTML="Failed to get Google Map."
}

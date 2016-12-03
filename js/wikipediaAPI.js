'use strict';

// populate info window function
function populateInfoWindow(marker, infowindow) {
  // check if info window is not already open
  if(infowindow.marker != marker) {
    infowindow.marker = marker;

    // begin fetching wiki article
    var museumMarker = marker.title;
    var wikiAPI = 'https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles='+museumMarker+'&callback=?';
    var wikiURL = 'https://en.wikipedia.org/wiki/'+museumMarker;
    var wikiArr = [];
    var wikiArticle;
    var wikiElem = '';

    // wikipedia api error handling
    var wikiRequestTimeout = setTimeout(function() {
      $('body').text('Failed to get Wikipedia.');
    }, 3000);

    $.ajax({
      url: wikiAPI,
      dataType: 'jsonp',
      }).done(function(data) {
        for (var key in data.query.pages) {
          wikiArr.push(key);
        }

        wikiArticle = data.query.pages[wikiArr[0]].extract;
        wikiElem = '<div><h2>' + marker.title + '</h2><br>' + wikiArticle + '<br><br><em>Source: Wikipedia: ' + '<a href="'+ wikiURL+'">' + wikiURL + '</a></em></div>'

        infowindow.setContent(wikiElem);

      infowindow.open(map, marker);

      marker.addListener('closeclick',function(){
        marker.setMarker(null);
      });

      clearTimeout(wikiRequestTimeout);
      }); // end ajax done
  }
}; // end populate fn

// fn for bouncing marker
function toggleBounce(marker) {
  if(marker.getAnimation() !== null) {
    marker.setAnimation(null);
  } else {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
      marker.setAnimation(null);
    }, 700);
  }
} // end bounce

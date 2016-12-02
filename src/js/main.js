var model = {
    position: ko.observable(),
    lat: ko.observable(),
    lng: ko.observable(),
    mapOptions: ko.observable(),
    drawnMap: ko.observable(),
    userMarker: ko.observable(),
    artMarkersArray: ko.observableArray([]),
    museumMarkersArray: ko.observableArray([]),
    infoBox: new InfoBox(),
    showCheckboxes: ko.observable(false),
    showMap: ko.observable(false),
    showFilterInputBox: ko.observable(false),
    artCheckbox: ko.observable(false),
    museumCheckbox: ko.observable(false),
    cityInput: ko.observable(''),
    searchTermsArray: ko.observableArray([]),
    businessNamesArray: ko.observableArray([]),
    filteredArray: ko.observableArray([]),
    photoIdsArray: ko.observableArray([])
};

var helperFunctions = {

    // fill model.artMarkersArray;  
    // create new Marker object containing map, position, address, title, placeId, label properties using data passed into the function;
    // instead of using Google's built-in object Marker constructor and new maps.google.Marker, use Map Icons' Marker library and new Marker();
    // Map Icons (map-icons.com) extends the Google Maps Marker object for better marker control and customization
    // instead of using Google's built-in object InfoWindow constructor and new maps.google.InfoWindow, use Google's InfoBox library and new InfoBox();
    // InfoBox (http://google-maps-utility-library-v3.googlecode.com/svn/tags/infobox/1.1.9/docs/reference.html) extends the Google InfoWindow object for better infowindow control and customization;

    fillArtMarkersArray: function(data, status) {
        var len = data.length;

        if (status == google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < len; i++) {
                var lat = data[i].geometry.location.lat();
                var lng = data[i].geometry.location.lng();
                var latLng = new google.maps.LatLng(lat, lng);
                var placeId = data[i].place_id;
                var title = data[i].name;
                var address = data[i].vicinity;
                var placeUrlEncodedName = encodeURIComponent(title);
                var photoSrcUrl = '';
                var marker = new Marker({
                    map: model.drawnMap(),
                    position: latLng,
                    title: title,
                    address: address,
                    placeId: placeId,
                    zIndex: 9,
                    icon: {
                        path: MAP_PIN,
                        fillColor: '#0E77E9',
                        fillOpacity: 1,
                        strokeColor: '',
                        strokeWeight: 0,
                        scale: 0.26
                    },
                    label: '<i class="map-icon-art-gallery art-gallery"></i>',
                    infoBox: function() {
                        model.infoBox.setContent(this.title + '<br /><span class="info-box-address">' + this.address + '</span>');
                        model.infoBox.open(model.drawnMap(), this);
                    }
                });

                model.artMarkersArray.push(marker);
                model.photoIdsArray.push(placeId);
            }
            helperFunctions.addArtMarkerListener(model.artMarkersArray());
        }
    },
    fillMuseumMarkersArray: function(data, status) {
        var len = data.length;

        if (status == google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < len; i++) {
                var lat = data[i].geometry.location.lat();
                var lng = data[i].geometry.location.lng();
                var latLng = new google.maps.LatLng(lat, lng);
                var placeId = data[i].place_id;
                var title = data[i].name;
                var address = data[i].vicinity;
                var placeUrlEncodedName = encodeURIComponent(title);
                var photoSrcUrl = '';
                var marker = new Marker({
                    map: model.drawnMap(),
                    position: latLng,
                    title: title,
                    address: address,
                    placeId: placeId,
                    zIndex: 9,
                    icon: {
                        path: MAP_PIN,
                        fillColor: '#0E77E9',
                        fillOpacity: 1,
                        strokeColor: '',
                        strokeWeight: 0,
                        scale: 0.26
                    },
                    label: '<i class="map-icon-museum museum"></i>',
                    infoBox: function() {
                        model.infoBox.setContent(this.title + '<br /><span class="info-box-address">' + this.address + '</span>');
                        model.infoBox.open(model.drawnMap(), this);
                    }
                });

                model.museumMarkersArray.push(marker);
                model.photoIdsArray.push(placeId);
            }
            helperFunctions.addMuseumMarkerListener(model.museumMarkersArray());
        }
    },

    // listen for click events on the markers;
    // when a user clicks on a marker image, an infoBox opens;
    // a closure is used to prevent ONLY the last marker from getting the listener when looping through the markers

    addArtMarkerListener: function(data) {
        var dataLength = data.length;

        for (var i = 0; i < dataLength; i++) {
            var marker = data[i];

            google.maps.event.addListener(marker, 'click', (function(sameMarker) {
                return function() {
                    sameMarker.infoBox();
                };
            })(marker));
        }
    },
    addMuseumMarkerListener: function(data) {
        var dataLength = data.length;

        for (var i = 0; i < dataLength; i++) {
            var marker = data[i];

            google.maps.event.addListener(marker, 'click', (function(sameMarker) {
                return function() {
                    sameMarker.infoBox();
                };
            })(marker));
        }
    },

    // if the checkbox is checked (i.e. true), then uncheck it (make it false);
    // if the checkbox is unchecked (i.e. false), then check it (make it true);

    hideShowMarkers: ko.computed(function() {
        if (!model.artCheckbox()) {
            model.artMarkersArray().forEach(function(markerItem) {
                markerItem.setMap(null);
            });
        }
        if (!model.museumCheckbox()) {
            model.museumMarkersArray().forEach(function(markerItem) {
                markerItem.setMap(null);
            });
        }
        if (model.artCheckbox()) {
            model.artMarkersArray().forEach(function(markerItem) {
                markerItem.setMap(model.drawnMap());
            });
        }
        if (model.museumCheckbox()) {
            model.museumMarkersArray().forEach(function(markerItem) {
                markerItem.setMap(model.drawnMap());
            });
        }
    }),

    // use Flickr API to add a photo to each marker in each of the arrays model.artMarkersArray() and model.museumMarkersArray();
    // add Flickr image tag to each marker's infoBox object(via infoBox.setContent());

    addFlickrImages: function(marker, name, address, lat, lng, arr, i) {
        apiResponse = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=4c1c3a64fcef86837a9839120dcd9da9&text=' + name + '&content_type=1&accuracy=13&tag_mode=all&min_upload_date=2014&media=photos&lat=' + lat + '&lon=' + lng + '&format=json&nojsoncallback=1';

        $.getJSON(apiResponse, function(data) {
                if (data.photos.total > 1) {
                    var photoArrayItem = data.photos.photo[1];
                    var farmId = photoArrayItem.farm;
                    var serverId = photoArrayItem.server;
                    var photoId = photoArrayItem.id;
                    var secret = photoArrayItem.secret;
                    var cssId = marker.placeId;

                    var photoSrcUrl = 'https://farm' + farmId + '.staticflickr.com/' + serverId + '/' + photoId + '_' + secret + '_n.jpg';
                    var photoImageTag = '<img id="' + cssId + '" width="320" src="' + photoSrcUrl + '" />';

                    marker.infoBox = (function(samePhotoImageTag) {
                        return function() {
                            model.infoBox.setContent(name + '<br /><span class="info-box-address">' + address + '</span><br />' + samePhotoImageTag);
                            model.infoBox.open(model.drawnMap(), this);
                        };
                    })(photoImageTag);

                } else {
                    marker.infoBox = function() {
                        model.infoBox.setContent(name + '<br /><span class="info-box-address">' + address + '</span>');
                        model.infoBox.open(model.drawnMap(), this);
                    };
                }
            })
            .fail(function() {
                marker.infoBox = function() {
                    model.infoBox.setContent(name + '<br /><span class="info-box-address">' + address + '</span>');
                    model.infoBox.open(model.drawnMap(), this);
                };
            });
    },

    // a function to filter out common/insignificant words within a string;
    // function returns false if the word passed into the function should be ignored;
    // use checkIgnored within the normalizeSearchTerm() function;

    checkIgnored: function(word) {
        switch (word) {
            case 'the':
                return false;
                break;
            case 'in':
                return false;
                break;
            case 'a':
                return false;
                break;
            case 'for':
                return false;
                break;
            case 'of':
                return false;
                break;
            case 'on':
                return false;
                break;
            default:
                return true;
        }
    },

    // function to clear Marker objects, initialize the arrays holding the list of markers, and unchecking the checkbox inputs;
    // clearMarkers is used when a user enters a new city, state or zip code

    clearMarkers: function() {
        var artCheckboxInput = document.getElementById('art_gallery');
        var museumCheckboxInput = document.getElementById('museum');

        model.artMarkersArray([]);
        model.artMarkersArray().length = 0;

        model.museumMarkersArray([]);
        model.museumMarkersArray().length = 0;

        document.getElementById('filter-input').value = '';

        artCheckboxInput.disabled = false;
        museumCheckboxInput.disabled = false;
        model.artCheckbox(false);
        model.museumCheckbox(false);
    }
};

var mapViewModel = {
    // initialize app by checking if the browser's geolocation property is enabled;
    // if geolocation is enabled, calculate the user's current latitude and longitude to setup a new Map object and a new Marker object (representing the user's current position);

    initialize: ko.computed(function() {
        var success = function(data) {
            model.position(data);
            model.lat(model.position().coords.latitude);
            model.lng(model.position().coords.longitude);
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(success);
        } else {
            console.log('geolocation not enabled');
        }
    }),

    // function to update the model.lat and model.lng observable objects, which in turn will re-render the Map object and the user's Marker object (if geolocation is enabled);

    updateLatLng: function() {
        var city = document.getElementById('city-input').value;
        var cityToArray = city.split(' ');
        var cityToString = cityToArray.join('+');

        var serverBasedAPI = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + cityToString + '&key=AIzaSyCAKkm8AzFk7yxHGF3eJNyimOln2BE_HlI';

        $.getJSON(serverBasedAPI, function(data) {

            // if a city is found to match the user's input, update model.lat and model.lng;
            // if a city is not found to match, then attempt to draw the user's current position using the browser's geolocation feature;

            if (data.status != 'ZERO_RESULTS' && city != '') {
                helperFunctions.clearMarkers();
                model.lat(data.results[0].geometry.location.lat);
                model.lng(data.results[0].geometry.location.lng);
            } else {
                var success = function(data) {
                    model.position(data);
                    model.lat(model.position().coords.latitude);
                    model.lng(model.position().coords.longitude);
                };

                helperFunctions.clearMarkers();

                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(success);
                } else {
                    alert('There was an error in determining your location. Please (1)enable geolocation AND/OR (2)enter a valid city and state.');
                }
            }
        }).fail(function() {
            alert('There was an error in determining your location. Please check your internet connection.');
        });
    },

    // model.mapOptions help further customize the Map object and the rendered map shown on the user's screen;

    makeMapOptions: ko.computed(function() {
        var mapCenter = new google.maps.LatLng(model.lat(), model.lng());

        model.mapOptions({
            center: mapCenter,
            zoom: 13,
            panControl: false,
            mapTypeControl: false,
            streetViewControl: false,
            styles: [{
                "stylers": [
                    { "lightness": -8 },
                    { "hue": "#7BFF00" }
                ]
            }, {
                "featureType": "road",
                "stylers": [
                    { "hue": "#FFC915" },
                    { "saturation": -42 }
                ]
            }]
        });
    }),

    // infoBox options help further customize the infoBox object;

    makeInfoBoxOptions: ko.computed(function() {
        model.infoBox.setOptions({
            boxStyle: {
                background: 'rgba(239, 244, 250, 0.85)',
                color: '#0738B6',
                textAlign: 'left',
                border: '1px solid',
                width: '341px',
                padding: '10px'
            }
        });
    }),
    makeMapObj: ko.computed(function() {
        model.drawnMap(new google.maps.Map(document.getElementById('map-canvas'), model.mapOptions()));

        if (document.getElementById('map-canvas').innerHTML != '') {
            model.showCheckboxes(true);
            model.showMap(true);
        }
    }),

    // create new Marker to show user's current position, the center of the current city, or the center of the current zip code;
    // the icon and label properties uses the Map Icons library to render the userMarker

    makeUserMarker: ko.computed(function() {
        model.userMarker(new Marker({
            map: model.drawnMap(),
            position: model.drawnMap().center,
            title: 'You are here!',
            zIndex: 9,
            icon: {
                path: SQUARE_PIN,
                fillColor: '#0E77E9',
                fillOpacity: 1,
                strokeColor: '',
                strokeWeight: 0,
                scale: 0.36
            },
            label: '<i class="map-icon-walking"></i><div id="walking">You are here!</div>'
        }));
    }),

    // setup the search parameters for Google Place's nearbySearch feature;
    // pass the server's response (data) to helperFunctions.fillArtMarkersArray and helperFunctions.fillMuseumMarkersArray

    setupArtArray: ko.computed(function() {
        var service = new google.maps.places.PlacesService(model.drawnMap());
        var request = {
            location: model.drawnMap().center,
            radius: '6200',
            types: ['art_gallery']
        };

        service.nearbySearch(request, helperFunctions.fillArtMarkersArray);
    }),
    setupMuseumArray: ko.computed(function() {
        var service = new google.maps.places.PlacesService(model.drawnMap());
        var request = {
            location: model.drawnMap().center,
            radius: '6200',
            types: ['museum']
        };

        service.nearbySearch(request, helperFunctions.fillMuseumMarkersArray);
    }),
    listClickCallback: function(marker) {
        marker.infoBox();
    },

    // show or hide the unordered list of businesses (business-list) based on what checkbox(es) are checked(true);
    // also, show or hide the 'filter businesses' input box based on whether or not a checkbox is checked(true);

    updateShowFilterInput: ko.computed(function() {
        if (model.artCheckbox() || model.museumCheckbox()) {
            model.showFilterInputBox(true);
            document.getElementById('business-list').style.bottom = '5%';
        } else if (!model.artCheckbox() && !model.museumCheckbox()) {
            model.showFilterInputBox(false);
            document.getElementById('business-list').style.bottom = '-999px';
        } else {
            model.showFilterInputBox(true);
            document.getElementById('business-list').style.bottom = '5%';
        }
    }),

    // function uses regular expressions to filter the business list based on a user's input;
    // when a user enters a string to filter the business list, the art and museum checkboxes become disabled; they only become enabled when the user clears the input box;
    // the normalizeSearchTerm function separates the user's string into an array of individual words;
    // function attempts to normalize the words to prevent apostrophe's/commas/dashes/etc. from making it too difficult to find a match; loop through the array and filter out only characters 0-9, a-z, and A-Z, into a new array, searchTermArray;

    normalizeSearchTerm: function() {
        var searchBoxText = document.getElementById('filter-input').value;
        var textArray = searchBoxText.split(' ');

        var artCheckboxInput = document.getElementById('art_gallery');
        var museumCheckboxInput = document.getElementById('museum');

        var artGalleriesListUL = document.getElementById('art-galleries');
        var museumsListUL = document.getElementById('museums');

        var textArrayLength = textArray.length;

        model.filteredArray([]);
        model.searchTermsArray([]);

        if (searchBoxText == '') {
            console.log('searchBox is empty');

            artCheckboxInput.disabled = false;
            museumCheckboxInput.disabled = false;

            document.getElementById('filtered-businesses').innerHTML = '';

            if (model.artCheckbox()) {
                artGalleriesListUL.style.display = 'block';
                model.artMarkersArray().forEach(function(markerItem) {
                    markerItem.setMap(model.drawnMap());
                });
            }
            if (model.museumCheckbox()) {
                museumsListUL.style.display = 'block';
                model.museumMarkersArray().forEach(function(markerItem) {
                    markerItem.setMap(model.drawnMap());
                });
            }

            return false;
        } else {
            console.log('searchBox not empty');

            artCheckboxInput.disabled = true;
            museumCheckboxInput.disabled = true;

            artGalleriesListUL.style.display = 'none';
            museumsListUL.style.display = 'none';

            model.artMarkersArray().forEach(function(markerItem) {
                markerItem.setMap(null);
            });
            model.museumMarkersArray().forEach(function(markerItem) {
                markerItem.setMap(null);
            });

            for (var i = 0; i < textArrayLength; i++) {
                var str = textArray[i];
                var regPatt = /[A-z0-9]/g;
                var result = str.match(regPatt);
                var resultNew = result.join('');

                if (helperFunctions.checkIgnored(resultNew)) {
                    model.searchTermsArray.push(resultNew);
                    console.log('new search string is ' + model.searchTermsArray());
                }
            }

            return false;
        }
    },

    // using regular expressions, use the JavaScript filter method on artMarkersArray and/or museumMarkersArray to get only those markers whose title/name matches a words/string in searchTermsArray

    businessSearch: ko.computed(function() {
        var searchArray = model.searchTermsArray();
        var searchLen = searchArray.length;

        function checkItem(marker, i) {
            for (var i = 0; i < searchLen; i++) {
                var regexp = new RegExp(searchArray[i], 'gi');
                var name = marker.title;

                if (name.match(regexp)) {
                    marker.setMap(model.drawnMap());
                    return true;
                }
            }
        }

        if (model.artCheckbox() && !model.museumCheckbox()) {
            console.log('museum checkbox not checked');
            model.filteredArray(model.artMarkersArray().filter(checkItem));
        } else if (!model.artCheckbox() && model.museumCheckbox()) {
            console.log('art checkbox not checked');
            model.filteredArray(model.museumMarkersArray().filter(checkItem));
        } else if (model.artCheckbox() && model.museumCheckbox()) {
            console.log('both checked');
            model.filteredArray(model.artMarkersArray().concat(model.museumMarkersArray()).filter(checkItem));
        } else {
            model.filteredArray({ title: 'no matching businesses found' });
        }
    }),

    // setup Flickr API and setup parameters that will eventually be passed to the helperFunctions.addFlickrImages function;
    // use a closure to ensure that the addFlickrImages function will be passed the correct set of parameters when looping through the artMarkersArray and museumMarkersArray arrays;

    setupFlickrAPI: ko.computed(function() {
        model.artMarkersArray().forEach(function(marker, index, array) {
            var marker = marker;
            var name = marker.title;
            var address = marker.address;
            var lat = marker.position.lat();
            var lng = marker.position.lng();
            var arr = model.artMarkersArray;
            var i = index;

            (function(sameMarker, sameName, sameAddress, sameLat, sameLng, sameArr, sameI) {
                return helperFunctions.addFlickrImages(sameMarker, sameName, sameAddress, sameLat, sameLng, sameArr, sameI);
            })(marker, name, address, lat, lng, arr, i);
        });
        model.museumMarkersArray().forEach(function(marker, index, array) {
            var marker = marker;
            var name = marker.title;
            var address = marker.address;
            var lat = marker.position.lat();
            var lng = marker.position.lng();
            var arr = model.museumMarkersArray;
            var i = index;

            (function(sameMarker, sameName, sameAddress, sameLat, sameLng, sameArr, sameI) {
                return helperFunctions.addFlickrImages(sameMarker, sameName, sameAddress, sameLat, sameLng, sameArr, sameI);
            })(marker, name, address, lat, lng, arr, i);
        });
    })
};

ko.applyBindings(mapViewModel);

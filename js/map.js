/**
 * Created by GL552JX on 18-Nov-16.
 */

var sKey = 'FTOA5S';
var sHome = new google.maps.LatLng(16.040276, 108.245381);
var map, i;
var markers = [];

routeMarkers = [];

function initSMap() {
    var script = document.createElement('script');
    script.src = 'js/data.js';
    document.getElementsByTagName('head')[0].appendChild(script); // End get Data

    var mapStyle = [
        {
            featureType: 'road.highway',
            elementType: 'geometry',
            stylers: [
                {hue: '#ff6600'},
                {saturation: 20},
                {lightness: -20}
            ]
        }, {
            featureType: 'road.highway',
            elementType: 'labels.text',
            stylers: [
                {hue: '#222831'}
            ]
        }, {
            featureType: 'road.arterial',
            elementType: 'all',
            stylers: [
                {hue: '#02a5c2'},
                {lightness: -40},
                {visibility: 'simplified'},
                {saturation: 30}
            ]
        }, {
            featureType: 'road.local',
            elementType: 'all',
            stylers: [
                {hue: '#f6ff00'},
                {saturation: 50},
                {gamma: 0.7},
                {visibility: 'simplified'}
            ]
        }, {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [
                {saturation: 40},
                {lightness: 40}
            ]
        }, {
            featureType: 'road.arterial',
            elementType: 'labels.text',
            stylers: [
                {color: '#000000'},
                {visibility: 'simplified'}
            ]
        },{
            elementType: 'labels.icon',
            stylers: [
                {visibility: 'off'}
            ]
        }
    ];

    var mapOptions;
    if (window.innerWidth < 768) {
        mapOptions = {
            center: sHome,
            zoom: 15,
            mapTypeControl: false,
            mapTypeControlOptions: {
                mapTypeIds: [google.maps.MapTypeId.ROADMAP, sKey]
            },
            mapTypeId: sKey
        };
    } else {
        mapOptions = {
            center: sHome,
            zoom: 15,
            mapTypeControlOptions: {
                mapTypeIds: [google.maps.MapTypeId.ROADMAP, sKey]
            },
            mapTypeId: sKey
        }
    }

    map = new google.maps.Map(document.getElementById('sMap'), mapOptions); // End Init Map

    var myStyledMap = new google.maps.StyledMapType(mapStyle, {name: 'S-Map'});
    map.mapTypes.set(sKey, myStyledMap);  // End Styled Map

    new google.maps.Marker({
        position: sHome,
        title: 'Trụ sở',
        draggable: false,
        animation: google.maps.Animation.DROP,
        icon: 'images/icons/favicon.png',
        map: map
    }); // End Home Maker

    map.controls[google.maps.ControlPosition.LEFT_TOP].push(document.getElementById('btnToggleShow'));
    map.controls[google.maps.ControlPosition.LEFT_TOP].push(document.getElementById('btnCurrent'));
    map.controls[google.maps.ControlPosition.LEFT_TOP].push(document.getElementById('btnDirection')); // End Add Button

    google.maps.event.addDomListener(document.getElementById('btnCurrent'), 'click', function () {
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(function (position) {
                var currentMarker = new google.maps.Marker({
                    map: map,
                    position: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
                    icon: 'images/current-location.png',
                    title: 'Vị trí hiện tại',
                    animation:  google.maps.Animation.DROP
                });
                map.panTo(currentMarker.getPosition());
            });
        }
    }); // End Get Current Location

    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer;
    directionsDisplay.setMap(map);
    // directionsDisplay.setPanel(document.getElementById('mapPanel'));

    var streetMarker = new google.maps.Marker({ map: map });
    var streetInfo = new google.maps.InfoWindow();
    toggleInfo(streetMarker, streetInfo);

    var searchInput = new google.maps.places.Autocomplete(document.getElementById('searchInp'), {
        types: ['address']
    });
    searchInput.bindTo('bounds', map);

    searchInput.addListener('place_changed', function () {
        var place = searchInput.getPlace();

        if (!place.geometry) {
            return;
        }

        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.panTo(place.geometry.location);
            map.setZoom(17);
        }

        streetMarker.setPlace({
            placeId: place.place_id,
            location: place.geometry.location
        });

        streetInfo.setContent('<div><strong>' + place.name + '</strong><br>' +
            '<br>' + place.formatted_address);
        streetInfo.open(map, streetMarker);
        window.setTimeout(function () {
            streetInfo.close();
        }, 4000);

        document.getElementById('btnDirection').addEventListener('click', function () {
            if (navigator.geolocation) { // If have current location
                navigator.geolocation.getCurrentPosition(function (position) {
                    directionsService.route({
                        origin: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
                        destination: place.geometry.location,
                        travelMode: 'DRIVING'
                    }, function (response, status) {
                        if (status == 'OK') {
                            directionsDisplay.setDirections(response);
                        }
                    });
                });
            }

            directionsService.route({ // Default
                origin: sHome,
                destination: place.geometry.location,
                travelMode: 'DRIVING'
            }, function (response, status) {
                if (status == 'OK') {
                    directionsDisplay.setDirections(response);
                }
            });
        });

    }); // End AutoComplete
}

google.maps.event.addDomListener(window, 'load', initSMap);

window.getLocation = function(results) {
    for (i = 0; i < results.DiaDiem.length; i++) {
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(results.DiaDiem[i].Lat, results.DiaDiem[i].Lng),
            title: results.DiaDiem[i].Name,
            icon: results.DiaDiem[i].Icon
        });

        var infoMarker = new google.maps.InfoWindow({
            content: '<strong>' + results.DiaDiem[i].Name+ '</strong>'
        });

        markers.push(marker);

        toggleInfo(marker, infoMarker);

        // openAllInfo(marker, infoMarker);
    }
}; // Function Show Location

function toggleInfo(marker, infoMarker) {
    marker.addListener('click', function () {
        infoMarker.open(map, this);
        setTimeout(function () {
            infoMarker.close();
        }, 4000);
    });
} // Function Show and Hide InfoWindow

function toggleMarkers() {
    for (i = 0; i < markers.length; i++) {
        if (markers[i].map == null) {
            markers[i].setMap(map);
        } else {
            markers[i].setMap(null);
        }
    }
}  // Function Show and Hide Marker

function toggleShowBtn() {
    var toggleOn = document.getElementById('toggleOn');
    var toggleOff = document.getElementById('toggleOff');

    if (toggleOff.style.display == 'none') {
        toggleOff.style.display = 'inline-block';
        toggleOn.style.display = 'none';
    } else {
        toggleOff.style.display = 'none';
        toggleOn.style.display = 'inline-block';
    }
} // Function Toggle Icon

function checkSearch() {
    if (document.getElementById('searchInp').value == '') {
        alert("Vui lòng nhập địa điểm!");
    }
} // Function check if don't fill anything

function animateIcon(x) {
    x.classList.toggle("change");
} // Animation Button

/*function directionsStreet(directionsService, directionsDisplay, place) {
    for (i = 0; i < routeMarkers.length; i++) {
        routeMarkers[i].setMap(null);
    }

    directionsService.route({ // Default
        origin: sHome,
        destination: {placeId: place.place_id},
        travelMode: 'DRIVING'
    }, function (response, status) {
        if (status == 'OK') {
            var myRoute = response.routes[0].legs[0];
            for (i = 0; i < myRoute.steps.length; i++) {
                var infoMarker = new google.maps.InfoWindow;
                var marker = new google.maps.Marker({
                    map: map,
                    position: myRoute.steps[i].start_location
                });
                routeMarkers.push(marker);
                addInfo(marker, infoMarker, myRoute.steps[i].instructions);
            }
            directionsDisplay.setDirections(response);
        }
    });
}

function addInfo(marker, infoMarker, text) {
    marker.addListener('click', function () {
        infoMarker.setContent(text);
        infoMarker.open(map, marker);
        setTimeout(function () {
            infoMarker.close();
        }, 4000);
    })
}*/ // Directions Step by step

/*function openAllInfo(marker, infoMarker) {
    var currentBounds = map.getBounds();
    google.maps.event.addListener(map, 'zoom_changed', function () {
        if (map.zoom > 16) {
            infoMarker.open(marker.get(map), marker);
        } else {
            infoMarker.close();
        }
    })
 } // Function Open all Info when zoom > 19*/


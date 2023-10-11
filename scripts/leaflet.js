// ------------ Hooks -------------------

var hookAdressNumber = document.getElementById("adressNumber");
var hookAdressSubNumber = document.getElementById("adressSubNumber");
var hookAdressStreet = document.getElementById("adressStreet");
var hookAdressCity = document.getElementById("adressCity");
var hookAdressPostCode = document.getElementById("adressPostCode");
var hookAdressPostOffice = document.getElementById("adressPostOffice");
var hookCountry = document.getElementById("country");

var hookCoordinateNS = document.getElementById("coordinateNS");
var hookCoordinateWE = document.getElementById("coordinateWE");

var hookGpsNS = document.getElementById("gpsNS");
var hookGpsWE = document.getElementById("gpsWE");

// ------------ Leaflet map initialization and operation -------------------

let mapOptions = {
  center: [52, 19],
  zoom: 6,
};

const map = L.map("map", mapOptions);

var marker = L.marker([0, 0]);
marker.bindPopup("0,0");
marker.addTo(map);

const tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

function onMapClick(e) {
  hookCoordinateNS.value = e.latlng.lat.toFixed(7);
  hookCoordinateWE.value = e.latlng.lng.toFixed(7);

  var text = coordinatesToDms(e.latlng.lat, e.latlng.lng);
  findAdress(e.latlng.lat, e.latlng.lng);
  updateMarker(e.latlng.lat, e.latlng.lng, text);
}

function updateMarker(lat, lng, text) {
  marker.setLatLng(L.latLng(lat, lng)).setPopupContent(text).openPopup();
}

map.on("click", onMapClick);

// ------------ Find adress based on coordinates -------------------

async function findAdress(lat, lon) {
  await fetch(
    "https://nominatim.openstreetmap.org/reverse.php?lat=" +
      lat +
      "&lon=" +
      lon +
      "&zoom=18&format=jsonv2"
  )
    .then((resp) => resp.text())
    .then(function (data) {
      jsonData = JSON.parse(data);
    });

  if (!jsonData.error) {
    var houseNumber1 = "";
    var houseNumber2 = "";

    if (jsonData.address.house_number) {
      houseNumber1 = jsonData.address.house_number;
      var houseNumber = houseNumber1.split("/");
      houseNumber1 = houseNumber[0];
      if (houseNumber[1]) {
        houseNumber2 = houseNumber[1];
      }
    }

    hookAdressNumber.value = houseNumber1 ? houseNumber1 : "";
    hookAdressSubNumber.value = houseNumber2;
    hookAdressStreet.value = jsonData.address.road ? jsonData.address.road : "";

    var place = "";
    if (jsonData.address.city) {
      place = jsonData.address.city;
    }
    if (jsonData.address.county) {
      place = jsonData.address.county;
    }
    if (jsonData.address.town) {
      place = jsonData.address.town;
    }
    if (jsonData.address.village) {
      place = jsonData.address.village;
    }

    hookAdressCity.value = place ? place : "";
    hookAdressPostCode.value = jsonData.address.postcode
      ? jsonData.address.postcode
      : "";
    var postOffice = "";
    if (jsonData.address.municipality) {
      postOffice = jsonData.address.municipality;
    }
    if (jsonData.address.town) {
      postOffice = jsonData.address.town;
    }
    if (jsonData.address.city) {
      postOffice = jsonData.address.city;
    }
    hookAdressPostOffice.value = postOffice ? postOffice : "";
    hookCountry.value = jsonData.address.country
      ? jsonData.address.country
      : "";
  } else {
    hookAdressNumber.value = "";
    hookAdressSubNumber.value = "";
    hookAdressStreet.value = "";
    hookAdressCity.value = "";
    hookAdressPostCode.value = "";
    hookAdressPostOffice.value = "";
    hookCountry.value = "";
  }
}

// ------------ Find coordinates based on adress-------------------

async function findCoordinates() {
  if (hookAdressSubNumber == "") {
    var adresNumb = hookAdressNumber.value;
  } else {
    var adresNumb = hookAdressNumber.value + "/" + hookAdressSubNumber.value;
  }

  if (hookAdressStreet.value == "") {
    var adres =
      hookAdressCity.value +
      "+" +
      adresNumb +
      "+" +
      hookAdressPostCode.value +
      "+" +
      hookAdressPostOffice.value +
      "+" +
      hookCountry.value;
  } else {
    if (hookAdressCity.value == hookAdressPostOffice.value) {
      var adres =
        hookAdressStreet.value +
        "+" +
        adresNumb +
        "+" +
        hookAdressPostCode.value +
        "+" +
        hookAdressPostOffice.value +
        "+" +
        hookCountry.value;
    } else {
      var adres =
        hookAdressStreet.value +
        "+" +
        adresNumb +
        "+" +
        hookAdressCity.value +
        "+" +
        hookAdressPostCode.value +
        "+" +
        hookAdressPostOffice.value +
        "+" +
        hookCountry.value;
    }
  }

  await fetch(
    "http://nominatim.openstreetmap.org/search?format=json&limit=1&q=" + adres
  )
    .then((resp) => resp.text())
    .then(function (data) {
      jsonData = JSON.parse(data);
    });

  if (jsonData[0]) {
    var Lat = jsonData[0].lat;
    var Lon = jsonData[0].lon;

    hookCoordinateNS.value = Lat;
    hookCoordinateWE.value = Lon;

    var text = coordinatesToDms(Lat, Lon);

    updateMarker(Lat, Lon, text);
  } else {
    alert("Nie znaleziono adresu");
  }
}

// ------------ Conversion from NS,WE coordinates to degrees, minutes, seconds and hemisphere -------------------

function coordinatesToDms(latitude, longitude) {
  var latDir = "N";
  if (latitude < 0) {
    latDir = "S";
    latitude = -latitude;
  }
  latitudeValues = decimalToDms(latitude);

  var lonDir = "E";
  if (longitude < 0) {
    lonDir = "W";
    longitude = -longitude;
  }
  longitudeValues = decimalToDms(longitude);

  var latitudeGPS =
    latitudeValues[0] +
    "°" +
    latitudeValues[1] +
    "'" +
    latitudeValues[2] +
    "''" +
    latDir;

  var longitudeGPS =
    longitudeValues[0] +
    "°" +
    longitudeValues[1] +
    "'" +
    longitudeValues[2] +
    "''" +
    lonDir;

  hookGpsNS.value = latitudeGPS;
  hookGpsWE.value = longitudeGPS;

  daneGPS = latitudeGPS + " " + longitudeGPS;

  return (
    "<b>Długość:</b> " +
    latitude +
    "<br><b>Szerokość:</b> " +
    longitude +
    "<br><b>Dane GPS:</b> " +
    daneGPS
  );
}

// ------------ Conversion from decimal to degrees, minutes, seconds -------------------

function decimalToDms(valueDecimal) {
  degreesValue = Math.floor(valueDecimal);
  minutesValue = Math.floor(60 * (valueDecimal - degreesValue));
  secondsValue = Math.floor(
    60 * (60 * (valueDecimal - degreesValue) - minutesValue)
  );

  return [degreesValue, minutesValue, secondsValue];
}

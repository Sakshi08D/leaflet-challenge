// Define our API endpoint as apiEndPoint.
let apiEndPoint = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Establish a function to set marker size.
function setMarkerSize(magnitude) {
  return magnitude * 5;
}

// Establish function to select color based on depth.
function selectColor(depth) {
  return depth < 5 ? "#9d34eb" :
         depth < 20 ? "#34ebc6" :
         depth < 40 ? "#d234eb" :
         depth < 50 ? "#eb5934" :
         depth < 60 ? "#34eb40" :
         depth < 70 ? "#f5b042" :
         "#1cba9e";
}

// Log the data structure.
d3.json(apiEndPoint).then(function (data) {
  console.log(data);
});

// Initiate a GET request to the API endpoint.
d3.json(apiEndPoint).then(function (data) {
  // Once response is received, direct the data.features object to the generateFeatures function.
  generateFeatures(data.features);
});

function generateFeatures(earthquakeData) {

  // Establish a function to execute once for each feature in the features array.
  // Each feature will receive a popup describing the location and time of the earthquake.
  function executeForEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p>`);
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object.
  // The executeForEachFeature function will be initiated once for each data piece in the array.
  let earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: executeForEachFeature,
    pointToLayer : quakeMarkers
  });

  // Direct our earthquakes layer to the generateMap function.
  generateMap(earthquakes);
 }

function generateMap(earthquakes) {

  // Create the base layers.
  let streetMapLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  let topoMapLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Establish an object to contain our base maps.
  let baseMaps = {
    "Street Map": streetMapLayer,
    "Topographic Map": topoMapLayer
  };

  // Establish an object to hold our overlay.
  let overlayMaps = {
    Earthquakes: earthquakes
  };

  // Generate our map, giving it the street map and earthquakes layers to display on load.
  let myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [streetMapLayer, earthquakes]
  });

  // Generate a layer control, pass our baseMaps and overlayMaps, and add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Add legend specifics.
  var legend = L.control({position: "bottomright"});

  legend.onAdd = function(map) {
      var div = L.DomUtil.create("div", "info legend"),
      depths = [5, 20, 40, 50, 60, 70];

      div.innerHTML += "<h3 style='text-align: center'>Depths</h3>"
      for (var i = 0; i < depths.length; i++) {
        div.innerHTML +=
        '<i style="background:' + selectColor(depths[i] + 1) + '"></i> ' +
        depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');
      }
      return div;
  }
  legend.addTo(myMap)
}

function quakeMarkers(feature, latlng){
    let options = {
        radius : setMarkerSize(feature.properties.mag),
        fillColor: selectColor(feature.geometry.coordinates[2]),
        fillOpacity: 0.7,
        color: "black",
        stroke: true,
        weight: 0.7
    }
    return L.circleMarker(latlng,options);
}

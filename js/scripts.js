// Mapa Leaflet
    var mapa = L.map('mapid').setView([9.65, -83.95], 10);

// Conjunto de capas base

var CartoDB_Positron = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', 
      {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }
    ).addTo(mapa);

	var osm = L.tileLayer(
	  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?', 
	  {
	    maxZoom: 19,
	    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	  } 
	).addTo(mapa);	
	        
// Conjunto de capas base
	var mapasBase = {
        "OSM": osm, 
        "Carto": CartoDB_Positron,
	};	    

// Ícono personalizado para cafe
    const iconoCafe = L.divIcon({
        html: '<i class="fas fa-mug-hot fa-2x"></i>',
        className: 'estiloIconos'
});
   
// Control de capas
    control_capas = L.control.layers(mapasBase).addTo(mapa);
	
// Control de escala
    L.control.scale({ position: 'bottomright', imperial: false }).addTo(mapa);       

// Capa WMS
var capa_hillshade = L.tileLayer.wms('http://ows.mundialis.de/services/service?', {
  layers: 'SRTM30-Colored-Hillshade',
  format: 'image/png',
  transparent: true
}).addTo(mapa);

control_capas.addOverlay(capa_hillshade, 'Hillshade');

//Raster con Overlay
var capa_demcr = L.imageOverlay("https://raw.githubusercontent.com/ANALUGARITA/coolbeans.cafecr/main/capas/DEMCRclip.png", 
	[[11.2170149727014135, -87.0996182288391196], 
	[5.5008697751917763, -82.5542497585302470]], 
    {opacity:0.5}
).addTo(mapa);
control_capas.addOverlay(capa_demcr, 'MED Costa Rica');

function updateOpacityDemcr() {
  document.getElementById("span-opacity-demcr").innerHTML = document.getElementById("sld-opacity-demcr").value;
  capa_demcr.setOpacity(document.getElementById("sld-opacity-demcr").value);
}



// Capa vectorial en formato GeoJSON
$.getJSON("https://raw.githubusercontent.com/ANALUGARITA/coolbeans.cafecr/main/capas/fincascafe.geojson", function(geodata) {
  var capa_fincascafe = L.geoJson(geodata, {
    style: function(feature) {
	  return {'color': "red", 'weight': 1.5, 'fillOpacity': 0.0, 'icon': iconoCiudad}
    },   
    onEachFeature: function(feature, layer) {
        var popupText = "<strong>Finca</strong>: " + feature.properties.Nombre + "<br>" + "<strong>Tipo de Café</strong>: " + feature.properties.TipoCafe;
      layer.bindPopup(popupText);
    },
    pointToLayer: function(getJsonPoint, latlng) {
        return L.marker(latlng, {icon: iconoCafe});
    }
  }).addTo(mapa);

  control_capas.addOverlay(capa_fincascafe, 'Fincas de Café');
 });

$.getJSON("https://raw.githubusercontent.com/ANALUGARITA/coolbeans.cafecr/main/capas/viascafe.geojson", function(geodata) {
  var capa_viascafe = L.geoJson(geodata, {
    style: function(feature) {
	  return {'color': "red", 'weight': 1.5, 'fillOpacity': 0.0}
    },
    onEachFeature: function(feature, layer) {
      var popupText = "<strong>Vías a Fincas</strong>: " + feature.properties.RUTA;
      layer.bindPopup(popupText);
    }			
  }).addTo(mapa);

  control_capas.addOverlay(capa_viascafe, 'Vías a Fincas'); 
});


// Capa de coropletas de % de terreno sembrado de cafe en principales cantones cafetaleros 
$.getJSON('https://raw.githubusercontent.com/ANALUGARITA/coolbeans.cafecr/main/capas/cantonescafe.geojson', function (geojson) {
  var capa_cafe_coropletas = L.choropleth(geojson, {
	  valueProperty: 'AreaCafe',
	  scale: ['yellow', 'red'],
	  steps: 5,
	  mode: 'q',
	  style: {
	    color: '#fff',
	    weight: 1.5,
	    fillOpacity: 0.40
	  },
	  onEachFeature: function (feature, layer) {
	    layer.bindPopup('Cantón: ' + feature.properties.canton + '<br>' + 'Área sembrada de café: ' + feature.properties.AreaCafe.toLocaleString() + '%')
	  }
  }).addTo(mapa);
  control_capas.addOverlay(capa_cafe_coropletas, '% de terreno sembrado de cafe');	

  // Leyenda de la capa de coropletas
  var leyenda = L.control({ position: 'bottomright' })
  leyenda.onAdd = function (mapa) {
    var div = L.DomUtil.create('div', 'info legend')
    var limits = capa_cafe_coropletas.options.limits
    var colors = capa_cafe_coropletas.options.colors
    var labels = []

    // Add min & max
    div.innerHTML = '<div class="labels"><div class="min">' + limits[0] + '</div> \
			<div class="max">' + limits[limits.length - 1] + '</div></div>'

    limits.forEach(function (limit, index) {
      labels.push('<li style="background-color: ' + colors[index] + '"></li>')
    })

    div.innerHTML += '<ul>' + labels.join('') + '</ul>'
    return div
  }
  leyenda.addTo(mapa)
});
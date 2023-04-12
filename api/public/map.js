window.onload = (event) => {


let mapbox = new Leaflet.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: ''
})

let map = new Leaflet.Map('map', {
  center: [55.78976742274183, 49.139635562896736],
  zoom: 14,
  zoomControl: false,
  preferCanvas: true,
  cursor: 'pointer',
  layers: [mapbox],
  attributionControl: false,

});

const mapElement = document.querySelector('#map');
const geoData = JSON.parse(mapElement.dataset.geoData);


console.log(geoData)

for (let file of geoData.files){
  let trackLayer = [];
  for (let track of file.tracks){
    for (let segment of track.trkseg){
      for (let point of segment.points) {
        trackLayer.push([point.lat, point.lon])
      }
    }
  }
  let polyline = L.polyline(trackLayer, {color: 'red'}).addTo(map);
}


}

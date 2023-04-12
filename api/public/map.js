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

const defaultTracksStyle = {
  color: 'red',
  weight: 2,
  opacity: 1
}

const dimmedTracksStyle = {
  color: 'red',
  weight: 2,
  opacity: 0.2
}

const highlightedTrackStyle = {
  color: 'black',
  weight: 3,
  opacity: 1
}

let polylines = {};
for (let file of geoData.files){
  let trackLayer = [];
  for (let track of file.tracks){
    for (let segment of track.trkseg){
      for (let point of segment.points) {
        trackLayer.push([point.lat, point.lon])
      }
    }
  }
  polylines[file.metadata.name] = L.polyline(trackLayer, defaultTracksStyle).addTo(map);
}

let activeTrack = null

const highlightTrack = (e) => {
  resetTrackButtons()
  if (activeTrack === e) {
    setTracksStyle(defaultTracksStyle)
    activeTrack = null
    return
  }
  setTracksStyle(dimmedTracksStyle)
  e.style['color'] = '#3399FF'
  polylines[e.dataset.name].setStyle(highlightedTrackStyle)
  map.fitBounds(polylines[e.dataset.name].getBounds())
  activeTrack = e
}

const resetTrackButtons = () => {
  document.querySelectorAll('.track-list-item').forEach((e) => {
    e.style['color'] = 'black'
  });
}

const setTracksStyle = (style) => {
  for (let polyline in polylines) {
    polylines[polyline].setStyle(style)
  }
}

document.querySelectorAll('.track-list-item').forEach((e) => {
  e.addEventListener('click', (e) => highlightTrack(e.target))
});

}

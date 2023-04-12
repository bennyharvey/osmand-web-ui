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

let tracks = {};
for (let file of geoData.files) {
  let trackLayer = []
  let points = []
  for (let track of file.tracks) {
    for (let segment of track.trkseg) {
      for (let point of segment.points) {
        trackLayer.push([point.lat, point.lon])
        points.push(point)
      }
    }
  }
  tracks[file.metadata.name] = {
    layer: L.polyline(trackLayer, defaultTracksStyle).addTo(map),
    points: points
  }
}


let activeTrackElement = null

const highlightTrack = (e) => {
  resetTrackButtons()
  renderTrackPointsToTab(e)
  if (activeTrackElement === e) {
    setTracksStyle(defaultTracksStyle)
    activeTrackElement = null
    return
  }
  setTracksStyle(dimmedTracksStyle)
  e.style['color'] = '#3399FF'
  tracks[e.dataset.name].layer.setStyle(highlightedTrackStyle)
  map.fitBounds(tracks[e.dataset.name].layer.getBounds())
  activeTrackElement = e

}

const resetTrackButtons = () => {
  document.querySelectorAll('.track-list-item').forEach((e) => {
    e.style['color'] = 'black'
  });
}

const setTracksStyle = (style) => {
  for (let polyline in tracks) {
    tracks[polyline].layer.setStyle(style)
  }
}

const renderTrackPointsToTab = (e) => {
  let tab = document.getElementById('track-points-tab-content')
  tab.innerHTML = ''
  tracks[e.dataset.name].points.map((point) => {
    let pointElement = document.createElement("li")
    pointElement.innerHTML = point.time
    tab.appendChild(pointElement)
  })


}

document.querySelectorAll('.track-list-item').forEach((e) => {
  e.addEventListener('click', (e) => highlightTrack(e.target))
});

}

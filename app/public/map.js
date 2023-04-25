window.onload = (event) => {


let mapbox = new Leaflet.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: ''
})

const mapElement = document.querySelector('#map');
let map = new Leaflet.Map(mapElement, {
  center: [55.78976742274183, 49.139635562896736],
  zoom: 14,
  zoomControl: false,
  preferCanvas: true,
  cursor: 'pointer',
  layers: [mapbox],
  attributionControl: false,
});
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
  opacity: 0.4
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
  tracks[e.dataset.name].layer.bringToFront()
  map.fitBounds(tracks[e.dataset.name].layer.getBounds())
  activeTrackElement = e

}

const resetTrackButtons = () => {
  document.querySelectorAll('.track-list-item').forEach((e) => {
    e.style['color'] = 'black'
  });
}

const setTracksStyle = (style) => {
  for (let trackId in tracks) {
    tracks[trackId].layer.setStyle(style)
  }
}

const renderTrackPointsToTab = (e) => {
  let tab = document.getElementById('track-points-tab-content')
  tab.innerHTML = ''
  tracks[e.dataset.name].points.map((point) => {
    let pointElement = document.createElement("li")
    pointElement.className = 'point-list-item'
    pointElement.innerHTML = point.time
    pointElement.dataset.lat = point.lat
    pointElement.dataset.lon = point.lon
    tab.appendChild(pointElement)
  })
  registerPointClickHandlers()
}

let activePointCircle = new Leaflet.Layer()
const handlePointListItemHover = (e) => {
  if (map.hasLayer(activePointCircle)) {
    activePointCircle.removeFrom(map)
  }
  let coords = [e.target.dataset.lat, e.target.dataset.lon]
  map.panTo(coords)
  activePointCircle = new Leaflet.CircleMarker(coords, {radius: 20}).addTo(map)
}

const registerPointClickHandlers = () => {
  document.querySelectorAll('.point-list-item').forEach((e) => {
    e.addEventListener('mouseenter', (e) => handlePointListItemHover(e))
  });
}


let dotsLayer = new Leaflet.LayerGroup()
const handleTracksTabSwitch = (e) => {
  if (map.hasLayer(dotsLayer)) {
    map.removeLayer(dotsLayer)
  }
  dotsLayer = new Leaflet.LayerGroup()
}

const handleTrackPointsTabSwitch = (e) => {
  if (activeTrackElement === null) {
    return
  }
  tracks[activeTrackElement.dataset.name].layer.getLatLngs().map((point) => {
    let dot = new Leaflet.Circle(point, {radius: 2}).addTo(dotsLayer)
    bindPointEditingHandlers(point, dot)
  })
  dotsLayer.addTo(map)
}

const bindPointEditingHandlers = (point, marker) => {
  marker.on('mousedown', (e) => {
    map.dragging.disable()
    map.on('mousemove', (me) => {
      let mouseCoords = map.mouseEventToLatLng(me.originalEvent)
      e.target.setLatLng(mouseCoords)
      point.lat = mouseCoords.lat
      point.lng = mouseCoords.lng
      tracks[activeTrackElement.dataset.name].layer.redraw()
    })
  })
  map.on('mouseup', (e) => {
    map.dragging.enable()
    map.off('mousemove')
  })
}

document.getElementById("tracks-tab").addEventListener('click', (e) => handleTracksTabSwitch(e))
document.getElementById("track-points-tab").addEventListener('click', (e) => handleTrackPointsTabSwitch(e))
document.querySelectorAll('.track-list-item').forEach((e) => {
  e.addEventListener('click', (e) => highlightTrack(e.target))
});


}

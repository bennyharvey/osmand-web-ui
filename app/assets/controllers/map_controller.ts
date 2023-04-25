import { Controller } from '@hotwired/stimulus';
import { Map, TileLayer } from 'leaflet'

class MapController extends Controller<HTMLFormElement> {
    static targets: Array<string> = ['count']

    declare readonly hasCountTarget: boolean
    declare readonly countTarget: HTMLElement
    declare readonly countTargets: HTMLElement[]

    declare count: number
    declare map: Map
    connect() {
        let mapbox = new TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: ''
        })
        const mapElement: HTMLElement = document.querySelector('#map');

        this.map = new Map(mapElement, {
            center: [55.78976742274183, 49.139635562896736],
            zoom: 14,
            zoomControl: false,
            preferCanvas: true,
            layers: [mapbox],
            attributionControl: false,
        });
    }

    switchToTracksView(): void {
        console.log('switchToTracksView')
    }

    switchToTrackPointsView(): void {
        console.log('switchToTrackPointsView')
    }
}

export default MapController

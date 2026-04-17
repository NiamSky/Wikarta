export const MAIN_SERVER_HUB = {
    lat: -7.330630283108386,
    lng: 112.69745023865187,
} as const;

export const DEFAULT_MAP_CENTER = MAIN_SERVER_HUB;

export const DEFAULT_MAP_CENTER_TUPLE: [number, number] = [
    DEFAULT_MAP_CENTER.lat,
    DEFAULT_MAP_CENTER.lng,
];

export const MAP_TILE_URL = 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png';

export const MAP_TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';
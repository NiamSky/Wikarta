import { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DEFAULT_MAP_CENTER, MAP_TILE_ATTRIBUTION, MAP_TILE_URL } from '@/lib/map-defaults';

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

type CoordinatePickerProps = {
    latitude: number | string | null;
    longitude: number | string | null;
    onChange: (lat: number, lng: number) => void;
    height?: string;
    readOnly?: boolean;
    parentPoint?: {
        latitude: number | string | null;
        longitude: number | string | null;
        label?: string;
        color?: string;
    } | null;
};

function toNumberOrNull(value: number | string | null | undefined): number | null {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    const parsed = typeof value === 'number' ? value : Number(value);

    return Number.isFinite(parsed) ? parsed : null;
}

function createParentIcon(color: string): L.DivIcon {
    return L.divIcon({
        html: `<div style="width:14px;height:14px;background:${color};border:2px solid white;border-radius:50%;box-shadow:0 1px 3px rgba(0,0,0,.35)"></div>`,
        className: '',
        iconSize: [14, 14],
        iconAnchor: [7, 7],
    });
}

export default function CoordinatePicker({
    latitude,
    longitude,
    onChange,
    height = '300px',
    readOnly = false,
    parentPoint = null,
}: CoordinatePickerProps) {
    const mapRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const parentMarkerRef = useRef<L.Marker | null>(null);
    const connectionLineRef = useRef<L.Polyline | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const previousParentKeyRef = useRef<string | null>(null);

    const selectedLat = useMemo(() => toNumberOrNull(latitude), [latitude]);
    const selectedLng = useMemo(() => toNumberOrNull(longitude), [longitude]);
    const parentLat = useMemo(() => toNumberOrNull(parentPoint?.latitude), [parentPoint?.latitude]);
    const parentLng = useMemo(() => toNumberOrNull(parentPoint?.longitude), [parentPoint?.longitude]);

    const initialLat = selectedLat ?? parentLat ?? DEFAULT_MAP_CENTER.lat;
    const initialLng = selectedLng ?? parentLng ?? DEFAULT_MAP_CENTER.lng;

    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        const map = L.map(containerRef.current).setView([initialLat, initialLng], 15);

        L.tileLayer(MAP_TILE_URL, {
            attribution: MAP_TILE_ATTRIBUTION,
        }).addTo(map);

        if (!readOnly) {
            map.on('click', (e: L.LeafletMouseEvent) => {
                const { lat, lng } = e.latlng;

                if (markerRef.current) {
                    markerRef.current.setLatLng([lat, lng]);
                } else {
                    markerRef.current = L.marker([lat, lng]).addTo(map);
                }

                if (parentMarkerRef.current) {
                    const parentLatLng = parentMarkerRef.current.getLatLng();

                    if (connectionLineRef.current) {
                        connectionLineRef.current.setLatLngs([parentLatLng, [lat, lng]]);
                    } else {
                        connectionLineRef.current = L.polyline([parentLatLng, [lat, lng]], {
                            color: '#22c55e',
                            weight: 2.5,
                            opacity: 0.85,
                            dashArray: '6 6',
                        }).addTo(map);
                    }
                }

                onChange(lat, lng);
            });
        }

        mapRef.current = map;

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    useEffect(() => {
        const map = mapRef.current;

        if (!map) {
            return;
        }

        if (parentLat !== null && parentLng !== null) {
            const parentColor = parentPoint?.color ?? '#2563eb';

            if (parentMarkerRef.current) {
                parentMarkerRef.current.setLatLng([parentLat, parentLng]);
                parentMarkerRef.current.setIcon(createParentIcon(parentColor));
            } else {
                parentMarkerRef.current = L.marker([parentLat, parentLng], {
                    icon: createParentIcon(parentColor),
                    zIndexOffset: 300,
                }).addTo(map);
            }

            const parentLabel = parentPoint?.label ?? 'Parent Device';
            parentMarkerRef.current.bindTooltip(parentLabel, {
                direction: 'top',
                offset: [0, -10],
            });

            const parentKey = `${parentLat},${parentLng}`;

            if (previousParentKeyRef.current !== parentKey && selectedLat === null && selectedLng === null) {
                map.setView([parentLat, parentLng], 16);
            }

            previousParentKeyRef.current = parentKey;
        } else {
            parentMarkerRef.current?.remove();
            parentMarkerRef.current = null;
            previousParentKeyRef.current = null;
        }

        if (selectedLat !== null && selectedLng !== null) {
            if (markerRef.current) {
                markerRef.current.setLatLng([selectedLat, selectedLng]);
            } else {
                markerRef.current = L.marker([selectedLat, selectedLng]).addTo(map);
            }
        } else {
            markerRef.current?.remove();
            markerRef.current = null;
        }

        if (parentLat !== null && parentLng !== null && selectedLat !== null && selectedLng !== null) {
            if (connectionLineRef.current) {
                connectionLineRef.current.setLatLngs([
                    [parentLat, parentLng],
                    [selectedLat, selectedLng],
                ]);
            } else {
                connectionLineRef.current = L.polyline([
                    [parentLat, parentLng],
                    [selectedLat, selectedLng],
                ], {
                    color: '#22c55e',
                    weight: 2.5,
                    opacity: 0.85,
                    dashArray: '6 6',
                }).addTo(map);
            }
        } else {
            connectionLineRef.current?.remove();
            connectionLineRef.current = null;
        }
    }, [parentLat, parentLng, parentPoint?.color, parentPoint?.label, selectedLat, selectedLng]);

    return (
        <div>
            <div ref={containerRef} style={{ height }} className="rounded-md border" />
            <p className="mt-1 text-xs text-muted-foreground">
                {readOnly
                    ? 'Peta dalam mode baca saja. Parent akan ditampilkan jika tersedia.'
                    : 'Klik pada peta untuk memilih koordinat lokasi. Parent akan ditampilkan jika tersedia.'}
            </p>
        </div>
    );
}

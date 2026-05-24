import { Head, Link } from '@inertiajs/react';
import L from 'leaflet';
import { useCallback, useEffect, useState } from 'react';
import { MapContainer, Polyline, TileLayer, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import { X, ExternalLink } from 'lucide-react';
import { CapacityBar } from '@/components/capacity-bar';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { DEFAULT_MAP_CENTER_TUPLE, MAIN_SERVER_HUB, MAP_TILE_ATTRIBUTION, MAP_TILE_URL } from '@/lib/map-defaults';
import type { BreadcrumbItem, DeviceConnection, Odc, Odp, Olt, Ont } from '@/types';

L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Peta Jaringan', href: '/map' },
];

const ODP_COLORS: Record<string, string> = {
    active: '#22c55e',
    full: '#f97316',
    maintenance: '#eab308',
    damaged: '#ef4444',
    inactive: '#9ca3af',
    decommissioned: '#6b7280',
};

const ODC_COLORS: Record<string, string> = {
    active: '#a855f7',
    maintenance: '#eab308',
    inactive: '#9ca3af',
    decommissioned: '#6b7280',
};

const OLT_COLORS: Record<string, string> = {
    active: '#3b82f6',
    maintenance: '#eab308',
    inactive: '#9ca3af',
    decommissioned: '#6b7280',
};

const ONT_COLORS: Record<string, string> = {
    active: '#06b6d4',
    maintenance: '#eab308',
    inactive: '#9ca3af',
    decommissioned: '#6b7280',
};

const CONNECTION_COLORS: Record<DeviceConnection['type'], string> = {
    olt_to_odc: '#a855f7',
    odc_to_odp: '#22c55e',
    odp_to_ont: '#06b6d4',
};

const CONNECTION_LABELS: Record<DeviceConnection['type'], string> = {
    olt_to_odc: 'OLT -> ODC',
    odc_to_odp: 'ODC -> ODP',
    odp_to_ont: 'ODP -> ONT',
};

const HUB_CONNECTION_COLOR = '#ef4444';

function createDotIcon(color: string, size: number = 12): L.DivIcon {
    return L.divIcon({
        html: `<div style="width:${size}px;height:${size}px;background:${color};border:2px solid white;border-radius:50%;box-shadow:0 1px 3px rgba(0,0,0,.3)"></div>`,
        className: '',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
    });
}

function createSquareIcon(color: string, size: number = 14): L.DivIcon {
    return L.divIcon({
        html: `<div style="width:${size}px;height:${size}px;background:${color};border:2px solid white;border-radius:3px;box-shadow:0 1px 3px rgba(0,0,0,.3)"></div>`,
        className: '',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
    });
}

function createDiamondIcon(color: string, size: number = 16): L.DivIcon {
    return L.divIcon({
        html: `<div style="width:${size}px;height:${size}px;background:${color};border:2px solid white;transform:rotate(45deg);box-shadow:0 1px 3px rgba(0,0,0,.3)"></div>`,
        className: '',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
    });
}

function createHubIcon(): L.DivIcon {
    return L.divIcon({
        html: '<div style="width:18px;height:18px;border-radius:50%;background:#ef4444;border:3px solid #ffffff;box-shadow:0 0 0 5px rgba(239,68,68,.25),0 1px 4px rgba(0,0,0,.35)"></div>',
        className: '',
        iconSize: [18, 18],
        iconAnchor: [9, 9],
    });
}

type SelectedNode =
    | { type: 'odp'; data: Odp }
    | { type: 'odc'; data: Odc }
    | { type: 'olt'; data: Olt }
    | { type: 'ont'; data: Ont };

type MapData = {
    odps?: Odp[];
    odcs?: Odc[];
    olts?: Olt[];
    onts?: Ont[];
    connections?: DeviceConnection[];
};

type Layers = {
    odps: boolean;
    odcs: boolean;
    olts: boolean;
    onts: boolean;
    connections: boolean;
};

function MarkersLayer({
    data,
    layers,
    onSelect,
}: {
    data: MapData;
    layers: Layers;
    onSelect: (node: SelectedNode | null) => void;
}) {
    const map = useMap();

    useEffect(() => {
        const layerGroup = L.layerGroup().addTo(map);

        if (layers.olts && data.olts) {
            data.olts.forEach((olt) => {
                if (olt.latitude == null || olt.longitude == null) return;

                const marker = L.marker(
                    [olt.latitude, olt.longitude],
                    { icon: createDiamondIcon(OLT_COLORS[olt.status] ?? '#3b82f6', 20), zIndexOffset: 200 }
                );

                marker.bindTooltip(olt.name, { permanent: false, direction: 'top', offset: [0, -12] });
                marker.on('click', () => onSelect({ type: 'olt', data: olt }));
                layerGroup.addLayer(marker);
            });
        }

        if (layers.odcs && data.odcs) {
            data.odcs.forEach((odc) => {
                if (odc.latitude == null || odc.longitude == null) return;

                const marker = L.marker(
                    [odc.latitude, odc.longitude],
                    { icon: createSquareIcon(ODC_COLORS[odc.status] ?? '#a855f7', 16), zIndexOffset: 100 }
                );

                marker.bindTooltip(odc.name, { permanent: false, direction: 'top', offset: [0, -10] });
                marker.on('click', () => onSelect({ type: 'odc', data: odc }));
                layerGroup.addLayer(marker);
            });
        }

        return () => {
            layerGroup.remove();
        };
    }, [map, data, layers, onSelect]);

    return null;
}

function OdpMarkersLayer({ odps, onSelect }: { odps: Odp[]; onSelect: (node: SelectedNode) => void }) {
    return (
        <MarkerClusterGroup chunkedLoading>
            {odps.map((odp) => {
                const icon = createDotIcon(ODP_COLORS[odp.status] ?? '#22c55e', 10);
                return <DotMarker key={odp.id} odp={odp} icon={icon} onSelect={onSelect} />;
            })}
        </MarkerClusterGroup>
    );
}

function OntMarkersLayer({ onts, onSelect }: { onts: Ont[]; onSelect: (node: SelectedNode) => void }) {
    return (
        <MarkerClusterGroup chunkedLoading>
            {onts.map((ont) => {
                const icon = createDotIcon(ONT_COLORS[ont.status] ?? '#06b6d4', 8);
                return <OntDotMarker key={ont.id} ont={ont} icon={icon} onSelect={onSelect} />;
            })}
        </MarkerClusterGroup>
    );
}

function OntDotMarker({ ont, icon, onSelect }: { ont: Ont; icon: L.DivIcon; onSelect: (node: SelectedNode) => void }) {
    const map = useMap();

    useEffect(() => {
        if (ont.latitude == null || ont.longitude == null) return;

        const marker = L.marker([ont.latitude, ont.longitude], { icon, zIndexOffset: 50 });
        marker.bindTooltip(ont.name, { permanent: false, direction: 'top', offset: [0, -7] });
        marker.on('click', () => onSelect({ type: 'ont', data: ont }));
        marker.addTo(map);

        return () => {
            marker.remove();
        };
    }, [map, ont, icon, onSelect]);

    return null;
}

function DotMarker({ odp, icon, onSelect }: { odp: Odp; icon: L.DivIcon; onSelect: (node: SelectedNode) => void }) {
    const map = useMap();

    useEffect(() => {
        if (odp.latitude == null || odp.longitude == null) return;

        const marker = L.marker([odp.latitude, odp.longitude], { icon });
        marker.bindTooltip(odp.name, { permanent: false, direction: 'top', offset: [0, -7] });
        marker.on('click', () => onSelect({ type: 'odp', data: odp }));
        marker.addTo(map);

        return () => {
            marker.remove();
        };
    }, [map, odp, icon, onSelect]);

    return null;
}

function ServerHubMarker() {
    const map = useMap();

    useEffect(() => {
        const marker = L.marker([MAIN_SERVER_HUB.lat, MAIN_SERVER_HUB.lng], {
            icon: createHubIcon(),
            zIndexOffset: 500,
        });

        marker.bindTooltip('Pusat Server Utama', { direction: 'right', offset: [12, 0] });
        marker.addTo(map);

        return () => {
            marker.remove();
        };
    }, [map]);

    return null;
}

function NodeDetailPanel({ node, onClose }: { node: SelectedNode; onClose: () => void }) {
    const detailHref = node.type === 'odp'
        ? `/odps/${node.data.id}`
        : node.type === 'odc'
            ? `/odcs/${node.data.id}`
            : node.type === 'olt'
                ? `/olts/${node.data.id}`
                : `/onts/${node.data.id}`;

    return (
        <Card className="absolute bottom-4 left-4 z-1000 w-72 shadow-lg">
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-sm">{node.data.name}</CardTitle>
                        <p className="text-xs text-muted-foreground font-mono">{node.data.code}</p>
                        <p className="text-xs text-muted-foreground uppercase mt-0.5">{node.type}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
                        <X className="h-3 w-3" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
                <StatusBadge status={node.data.status} />
                <CapacityBar usedPorts={node.data.used_ports} totalPorts={node.data.total_ports} className="w-full" />
                {node.type === 'odp' && node.data.district && (
                    <p className="text-xs text-muted-foreground">{node.data.district.name}, {node.data.city?.name}</p>
                )}
                {node.type === 'odc' && node.data.olt && (
                    <p className="text-xs text-muted-foreground">Parent: {node.data.olt.name}</p>
                )}
                {node.type === 'ont' && node.data.odp && (
                    <p className="text-xs text-muted-foreground">Parent: {node.data.odp.name}</p>
                )}
                {detailHref && (
                    <Button asChild size="sm" className="w-full" variant="outline">
                        <Link href={detailHref}>
                            <ExternalLink className="mr-1 h-3 w-3" />
                            Lihat Detail
                        </Link>
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}

export default function MapIndex() {
    const [mapData, setMapData] = useState<MapData>({});
    const [loading, setLoading] = useState(true);
    const [layers, setLayers] = useState<Layers>({ odps: false, odcs: false, olts: false, onts: false, connections: false });
    const [selected, setSelected] = useState<SelectedNode | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);

        try {
            const params = new URLSearchParams({
                show_odps: String(layers.odps),
                show_odcs: String(layers.odcs),
                show_olts: String(layers.olts),
                show_onts: String(layers.onts),
                show_connections: String(layers.connections),
            });

            const response = await fetch(`/map/data?${params.toString()}`);
            setMapData(await response.json());
        } finally {
            setLoading(false);
        }
    }, [layers]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    function toggleLayer(key: keyof Layers) {
        setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
    }

    const handleSelect = useCallback((node: SelectedNode | null) => {
        setSelected(node);
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Peta Jaringan" />
            <div className="flex h-[calc(100vh-4rem)]">
                <div className="w-56 border-r bg-background p-4 space-y-4 overflow-y-auto shrink-0">
                    <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Layer</p>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm flex items-center gap-1.5">
                                    <span className="inline-block w-3 h-3 rounded-full" style={{ background: '#22c55e' }} />
                                    ODP
                                </Label>
                                <Switch checked={layers.odps} onCheckedChange={() => toggleLayer('odps')} />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label className="text-sm flex items-center gap-1.5">
                                    <span className="inline-block w-3 h-3 rounded" style={{ background: '#a855f7' }} />
                                    ODC
                                </Label>
                                <Switch checked={layers.odcs} onCheckedChange={() => toggleLayer('odcs')} />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label className="text-sm flex items-center gap-1.5">
                                    <span className="inline-block w-3 h-3" style={{ background: '#3b82f6', transform: 'rotate(45deg)' }} />
                                    OLT
                                </Label>
                                <Switch checked={layers.olts} onCheckedChange={() => toggleLayer('olts')} />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label className="text-sm flex items-center gap-1.5">
                                    <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: '#06b6d4' }} />
                                    ONT
                                </Label>
                                <Switch checked={layers.onts} onCheckedChange={() => toggleLayer('onts')} />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label className="text-sm flex items-center gap-1.5">
                                    <span className="inline-block w-4 h-0.5" style={{ background: '#3b82f6' }} />
                                    Sambungan Device
                                </Label>
                                <Switch checked={layers.connections} onCheckedChange={() => toggleLayer('connections')} />
                            </div>
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Legenda ODP</p>
                        <div className="space-y-1.5 text-xs">
                            {Object.entries(ODP_COLORS).map(([status, color]) => (
                                <div key={status} className="flex items-center gap-1.5">
                                    <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                                    <span className="capitalize">{status}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Legenda Sambungan</p>
                        <div className="space-y-1.5 text-xs">
                            <div className="flex items-center gap-1.5">
                                <span className="inline-block w-4 h-0.5" style={{ background: HUB_CONNECTION_COLOR }} />
                                <span>Pusat Server -&gt; OLT Utama</span>
                            </div>
                            {Object.entries(CONNECTION_LABELS).map(([type, label]) => (
                                <div key={type} className="flex items-center gap-1.5">
                                    <span className="inline-block w-4 h-0.5" style={{ background: CONNECTION_COLORS[type as DeviceConnection['type']] }} />
                                    <span>{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {loading && <p className="text-xs text-muted-foreground">Memuat data peta...</p>}
                </div>

                <div className="flex-1 relative">
                    {loading ? (
                        <Skeleton className="h-full w-full rounded-none" />
                    ) : (
                        <MapContainer center={DEFAULT_MAP_CENTER_TUPLE} zoom={13} style={{ height: '100%', width: '100%' }}>
                            <TileLayer attribution={MAP_TILE_ATTRIBUTION} url={MAP_TILE_URL} />

                            <ServerHubMarker />

                            {layers.connections && mapData.olts?.map((olt) => {
                                if (olt.latitude == null || olt.longitude == null) {
                                    return null;
                                }

                                return (
                                    <Polyline
                                        key={`hub-${olt.id}`}
                                        positions={[
                                            [MAIN_SERVER_HUB.lat, MAIN_SERVER_HUB.lng],
                                            [olt.latitude, olt.longitude],
                                        ]}
                                        pathOptions={{ color: HUB_CONNECTION_COLOR, weight: 2.5, opacity: 0.85, dashArray: '6 6' }}
                                    />
                                );
                            })}

                            {layers.connections && mapData.connections?.map((connection) => (
                                <Polyline
                                    key={connection.id}
                                    positions={connection.positions}
                                    pathOptions={{ color: connection.color, weight: 3, opacity: 0.9 }}
                                />
                            ))}

                            {layers.odps && mapData.odps && (
                                <OdpMarkersLayer odps={mapData.odps} onSelect={handleSelect} />
                            )}

                            {layers.onts && mapData.onts && (
                                <OntMarkersLayer onts={mapData.onts} onSelect={handleSelect} />
                            )}

                            <MarkersLayer data={mapData} layers={layers} onSelect={handleSelect} />
                        </MapContainer>
                    )}

                    {selected && (
                        <NodeDetailPanel node={selected} onClose={() => setSelected(null)} />
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

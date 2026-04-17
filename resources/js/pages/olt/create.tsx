import { Head, Link, useForm } from '@inertiajs/react';
import { lazy, Suspense, useState } from 'react';
import { useFlash } from '@/hooks/use-flash';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import { MAIN_SERVER_HUB } from '@/lib/map-defaults';
import type { BreadcrumbItem, GeoRef, District } from '@/types';

const CoordinatePicker = lazy(() => import('@/components/map/CoordinatePicker'));

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'OLT', href: '/olts' },
    { title: 'Tambah', href: '/olts/create' },
];

type Props = {
    cities: GeoRef[];
};

export default function OltCreate({ cities }: Props) {
    useFlash();

    const [districts, setDistricts] = useState<District[]>([]);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        code: '',
        brand: '',
        model: '',
        ip_address: '',
        city_id: '',
        district_id: '',
        village_id: '',
        latitude: '',
        longitude: '',
        location_description: '',
        total_ports: '16',
        status: 'active',
        notes: '',
    });

    async function handleCityChange(cityId: string) {
        setData('city_id', cityId);
        setData('district_id', '');
        const res = await fetch(`/api/districts/${cityId}`);
        setDistricts(await res.json());
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah OLT" />
            <div className="p-6 max-w-2xl space-y-6">
                <h1 className="text-2xl font-semibold">Tambah OLT</h1>
                <form onSubmit={(e) => { e.preventDefault(); post('/olts'); }} className="space-y-6">
                    {/* Identitas */}
                    <div className="space-y-4">
                        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Identitas Perangkat</h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama <span className="text-destructive">*</span></Label>
                                <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="OLT-WIKARTA-01" />
                                <InputError message={errors.name} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="code">Kode <span className="text-destructive">*</span></Label>
                                <Input id="code" value={data.code} onChange={(e) => setData('code', e.target.value)} placeholder="OLT-WKT-001" />
                                <InputError message={errors.code} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="brand">Brand</Label>
                                <Input id="brand" value={data.brand} onChange={(e) => setData('brand', e.target.value)} placeholder="Huawei, ZTE, Nokia..." />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="model">Model</Label>
                                <Input id="model" value={data.model} onChange={(e) => setData('model', e.target.value)} placeholder="MA5608T, C300..." />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ip_address">IP Address (Management)</Label>
                                <Input id="ip_address" value={data.ip_address} onChange={(e) => setData('ip_address', e.target.value)} placeholder="192.168.1.1" className="font-mono" />
                                <InputError message={errors.ip_address} />
                            </div>
                            <div className="space-y-2">
                                <Label>Status <span className="text-destructive">*</span></Label>
                                <Select value={data.status} onValueChange={(v) => setData('status', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Aktif</SelectItem>
                                        <SelectItem value="inactive">Tidak Aktif</SelectItem>
                                        <SelectItem value="maintenance">Maintenance</SelectItem>
                                        <SelectItem value="decommissioned">Decommissioned</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Total PON Port <span className="text-destructive">*</span></Label>
                                <Select value={data.total_ports} onValueChange={(v) => setData('total_ports', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="4">4 Port</SelectItem>
                                        <SelectItem value="8">8 Port</SelectItem>
                                        <SelectItem value="16">16 Port</SelectItem>
                                        <SelectItem value="32">32 Port</SelectItem>
                                        <SelectItem value="64">64 Port</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.total_ports} />
                            </div>
                        </div>
                    </div>

                    {/* Lokasi */}
                    <div className="space-y-4">
                        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Lokasi</h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Kota / Kabupaten</Label>
                                <Select value={data.city_id} onValueChange={handleCityChange}>
                                    <SelectTrigger><SelectValue placeholder="Pilih kota" /></SelectTrigger>
                                    <SelectContent>
                                        {cities.map((c) => (
                                            <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Kecamatan</Label>
                                <Select value={data.district_id} onValueChange={(v) => setData('district_id', v)} disabled={districts.length === 0}>
                                    <SelectTrigger><SelectValue placeholder="Pilih kecamatan" /></SelectTrigger>
                                    <SelectContent>
                                        {districts.map((d) => (
                                            <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="location_description">Keterangan Lokasi</Label>
                            <Input id="location_description" value={data.location_description} onChange={(e) => setData('location_description', e.target.value)} placeholder="Gedung NOC lantai 3, ..." />
                        </div>
                        <div className="space-y-2">
                            <Label>Koordinat</Label>
                            <div className="flex gap-2">
                                <Input placeholder="Latitude" value={data.latitude} onChange={(e) => setData('latitude', e.target.value)} className="font-mono" />
                                <Input placeholder="Longitude" value={data.longitude} onChange={(e) => setData('longitude', e.target.value)} className="font-mono" />
                            </div>
                            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                                <CoordinatePicker
                                    latitude={data.latitude ? parseFloat(data.latitude) : null}
                                    longitude={data.longitude ? parseFloat(data.longitude) : null}
                                    onChange={(lat, lng) => { setData('latitude', String(lat)); setData('longitude', String(lng)); }}
                                    height="256px"
                                    parentPoint={{
                                        latitude: MAIN_SERVER_HUB.lat,
                                        longitude: MAIN_SERVER_HUB.lng,
                                        label: 'Server Utama',
                                        color: '#ef4444',
                                    }}
                                />
                            </Suspense>
                        </div>
                    </div>

                    {/* Catatan */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Catatan</Label>
                        <Textarea id="notes" value={data.notes} onChange={(e) => setData('notes', e.target.value)} rows={3} />
                    </div>

                    <div className="flex gap-2">
                        <Button type="submit" disabled={processing}>Simpan</Button>
                        <Button variant="outline" asChild><Link href="/olts">Batal</Link></Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

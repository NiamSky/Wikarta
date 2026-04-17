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
import type { BreadcrumbItem, GeoRef, District, Odc, Olt, OdcStatus } from '@/types';

const CoordinatePicker = lazy(() => import('@/components/map/CoordinatePicker'));

type Props = {
    odc: Odc;
    olts: Pick<Olt, 'id' | 'name' | 'code'>[];
    cities: GeoRef[];
};

export default function OdcEdit({ odc, olts, cities }: Props) {
    useFlash();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'ODC', href: '/odcs' },
        { title: odc.name, href: `/odcs/${odc.id}` },
        { title: 'Edit', href: `/odcs/${odc.id}/edit` },
    ];

    const [districts, setDistricts] = useState<District[]>(
        odc.district ? [odc.district as District] : []
    );

    const { data, setData, put, processing, errors } = useForm({
        olt_id: String(odc.olt_id),
        name: odc.name,
        code: odc.code,
        brand: odc.brand ?? '',
        model: odc.model ?? '',
        city_id: odc.city ? String(odc.city.id) : '',
        district_id: odc.district ? String(odc.district.id) : '',
        village_id: odc.village ? String(odc.village.id) : '',
        latitude: odc.latitude ? String(odc.latitude) : '',
        longitude: odc.longitude ? String(odc.longitude) : '',
        location_description: odc.location_description ?? '',
        address: odc.address ?? '',
        total_ports: String(odc.total_ports),
        status: odc.status,
        installation_date: odc.installation_date ?? '',
        notes: odc.notes ?? '',
    });

    async function handleCityChange(cityId: string) {
        setData('city_id', cityId);
        setData('district_id', '');
        const res = await fetch(`/api/districts/${cityId}`);
        setDistricts(await res.json());
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit: ${odc.name}`} />
            <div className="p-6 max-w-2xl space-y-6">
                <h1 className="text-2xl font-semibold">Edit ODC</h1>
                <form onSubmit={(e) => { e.preventDefault(); put(`/odcs/${odc.id}`); }} className="space-y-6">
                    {/* Parent OLT */}
                    <div className="space-y-2">
                        <Label>OLT Parent <span className="text-destructive">*</span></Label>
                        <Select value={data.olt_id} onValueChange={(v) => setData('olt_id', v)}>
                            <SelectTrigger><SelectValue placeholder="Pilih OLT" /></SelectTrigger>
                            <SelectContent>
                                {olts.map((o) => (
                                    <SelectItem key={o.id} value={String(o.id)}>{o.name} ({o.code})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.olt_id} />
                    </div>

                    {/* Identitas */}
                    <div className="space-y-4">
                        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Identitas Perangkat</h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama <span className="text-destructive">*</span></Label>
                                <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                <InputError message={errors.name} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="code">Kode <span className="text-destructive">*</span></Label>
                                <Input id="code" value={data.code} onChange={(e) => setData('code', e.target.value)} />
                                <InputError message={errors.code} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="brand">Brand</Label>
                                <Input id="brand" value={data.brand} onChange={(e) => setData('brand', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="model">Model</Label>
                                <Input id="model" value={data.model} onChange={(e) => setData('model', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Status <span className="text-destructive">*</span></Label>
                                <Select value={data.status} onValueChange={(v) => setData('status', v as OdcStatus)}>
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
                                <Label>Total Port <span className="text-destructive">*</span></Label>
                                <Select value={data.total_ports} onValueChange={(v) => setData('total_ports', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="8">8 Port</SelectItem>
                                        <SelectItem value="16">16 Port</SelectItem>
                                        <SelectItem value="32">32 Port</SelectItem>
                                        <SelectItem value="64">64 Port</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.total_ports} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="installation_date">Tgl. Pasang</Label>
                                <Input id="installation_date" type="date" value={data.installation_date} onChange={(e) => setData('installation_date', e.target.value)} />
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
                            <Input id="location_description" value={data.location_description} onChange={(e) => setData('location_description', e.target.value)} />
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
                        <Button type="submit" disabled={processing}>Perbarui</Button>
                        <Button variant="outline" asChild><Link href={`/odcs/${odc.id}`}>Batal</Link></Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

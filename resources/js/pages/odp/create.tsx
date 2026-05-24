import { Head, Link, useForm } from '@inertiajs/react';
import { lazy, Suspense, useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useFlash } from '@/hooks/use-flash';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, City, District, Odc } from '@/types';

const CoordinatePicker = lazy(() => import('@/components/map/CoordinatePicker'));

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'ODP', href: '/odps' },
    { title: 'Tambah', href: '/odps/create' },
];

type Props = {
    odcs: Pick<Odc, 'id' | 'name' | 'code' | 'latitude' | 'longitude'>[];
    cities: Pick<City, 'id' | 'name'>[];
};

const statusOptions = [
    { value: 'active', label: 'Aktif' },
    { value: 'inactive', label: 'Tidak Aktif' },
    { value: 'full', label: 'Port Penuh' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'damaged', label: 'Rusak' },
    { value: 'decommissioned', label: 'Dinonaktifkan' },
];

export default function OdpCreate({ odcs, cities }: Props) {
    useFlash();

    const [districts, setDistricts] = useState<Pick<District, 'id' | 'name'>[]>([]);

    const { data, setData, post, processing, errors } = useForm({
        odc_id: '',
        name: '',
        code: '',
        brand: '',
        model: '',
        city_id: '',
        district_id: '',
        village_id: '',
        latitude: '',
        longitude: '',
        location_description: '',
        address: '',
        total_ports: '8',
        used_ports: '0',
        status: 'active',
        installation_date: '',
        pole_number: '',
        notes: '',
    });

    async function handleCityChange(cityId: string) {
        setData('city_id', cityId);
        setData('district_id', '');
        const res = await fetch(`/api/districts/${cityId}`);
        setDistricts(await res.json());
    }

    function handleCoordinateChange(lat: number, lng: number) {
        setData((prev) => ({ ...prev, latitude: String(lat), longitude: String(lng) }));
    }

    const selectedParentPoint = (() => {
        const selectedOdc = odcs.find((odc) => String(odc.id) === data.odc_id);

        if (selectedOdc && selectedOdc.latitude != null && selectedOdc.longitude != null) {
            return {
                latitude: selectedOdc.latitude,
                longitude: selectedOdc.longitude,
                label: `Parent ODC: ${selectedOdc.code}`,
            };
        }

        return null;
    })();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah ODP" />
            <div className="p-6 max-w-4xl space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold">Tambah ODP</h1>
                    <p className="text-sm text-muted-foreground">Tambah Optical Distribution Point baru ke jaringan</p>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); post('/odps'); }} className="space-y-8">
                    {/* Identitas */}
                    <div className="space-y-4">
                        <h2 className="text-base font-semibold">Identitas ODP</h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama ODP <span className="text-destructive">*</span></Label>
                                <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="Contoh: ODP-DAG-001" />
                                <InputError message={errors.name} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="code">Kode ODP <span className="text-destructive">*</span></Label>
                                <Input id="code" value={data.code} onChange={(e) => setData('code', e.target.value)} placeholder="Contoh: ODP-WIKARTA-001" />
                                <InputError message={errors.code} />
                            </div>
                            <div className="space-y-2">
                                <Label>Parent ODC <span className="text-destructive">*</span></Label>
                                <Select value={data.odc_id} onValueChange={(value) => setData('odc_id', value)}>
                                    <SelectTrigger><SelectValue placeholder="Pilih ODC" /></SelectTrigger>
                                    <SelectContent>
                                        {odcs.map((odc) => (
                                            <SelectItem key={odc.id} value={String(odc.id)}>
                                                {odc.code} — {odc.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.odc_id} />
                            </div>
                            <div className="space-y-2">
                                <Label>Status <span className="text-destructive">*</span></Label>
                                <Select value={data.status} onValueChange={(v) => setData('status', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {statusOptions.map((s) => (
                                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.status} />
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Kapasitas */}
                    <div className="space-y-4">
                        <h2 className="text-base font-semibold">Kapasitas Port</h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div className="space-y-2">
                                <Label>Total Port <span className="text-destructive">*</span></Label>
                                <Select value={data.total_ports} onValueChange={(v) => setData('total_ports', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="8">8 port</SelectItem>
                                        <SelectItem value="16">16 port</SelectItem>
                                        <SelectItem value="32">32 port</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.total_ports} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="used_ports">Port Terpakai</Label>
                                <Input id="used_ports" type="number" min="0" value={data.used_ports} onChange={(e) => setData('used_ports', e.target.value)} />
                                <InputError message={errors.used_ports} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="installation_date">Tanggal Pasang</Label>
                                <Input id="installation_date" type="date" value={data.installation_date} onChange={(e) => setData('installation_date', e.target.value)} />
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Lokasi */}
                    <div className="space-y-4">
                        <h2 className="text-base font-semibold">Lokasi</h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Kota</Label>
                                <Select value={data.city_id} onValueChange={handleCityChange}>
                                    <SelectTrigger><SelectValue placeholder="Pilih kota" /></SelectTrigger>
                                    <SelectContent>
                                        {cities.map((c) => (
                                            <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.city_id} />
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
                                <InputError message={errors.district_id} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="pole_number">Nomor Tiang</Label>
                                <Input id="pole_number" value={data.pole_number} onChange={(e) => setData('pole_number', e.target.value)} placeholder="Contoh: T-045" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="location_description">Keterangan Lokasi</Label>
                                <Input id="location_description" value={data.location_description} onChange={(e) => setData('location_description', e.target.value)} placeholder="Contoh: Depan warung Bu Sari" />
                            </div>
                        </div>

                        {/* Coordinate display */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="latitude">Latitude <span className="text-destructive">*</span></Label>
                                <Input id="latitude" value={data.latitude} onChange={(e) => setData('latitude', e.target.value)} placeholder="-7.330628" />
                                <InputError message={errors.latitude} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="longitude">Longitude <span className="text-destructive">*</span></Label>
                                <Input id="longitude" value={data.longitude} onChange={(e) => setData('longitude', e.target.value)} placeholder="112.697454" />
                                <InputError message={errors.longitude} />
                            </div>
                        </div>

                        <Suspense fallback={<Skeleton className="h-72 w-full" />}>
                            <CoordinatePicker
                                latitude={data.latitude}
                                longitude={data.longitude}
                                onChange={handleCoordinateChange}
                                height="280px"
                                parentPoint={selectedParentPoint}
                            />
                        </Suspense>
                    </div>

                    <Separator />

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Catatan</Label>
                        <Textarea id="notes" value={data.notes} onChange={(e) => setData('notes', e.target.value)} rows={3} placeholder="Catatan tambahan tentang ODP ini..." />
                    </div>

                    <div className="flex gap-2">
                        <Button type="submit" disabled={processing}>Simpan ODP</Button>
                        <Button variant="outline" asChild><Link href="/odps">Batal</Link></Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

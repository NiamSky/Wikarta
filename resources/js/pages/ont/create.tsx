import { Head, Link, useForm } from '@inertiajs/react';
import { lazy, Suspense } from 'react';
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
import type { BreadcrumbItem, Odp } from '@/types';

const CoordinatePicker = lazy(() => import('@/components/map/CoordinatePicker'));

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'ONT', href: '/onts' },
    { title: 'Tambah', href: '/onts/create' },
];

type OdpOption = Pick<Odp, 'id' | 'name' | 'code'> & {
    latitude?: number | null;
    longitude?: number | null;
};

type Props = {
    odps: OdpOption[];
};

const statusOptions = [
    { value: 'active', label: 'Aktif' },
    { value: 'inactive', label: 'Tidak Aktif' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'decommissioned', label: 'Dinonaktifkan' },
];

export default function OntCreate({ odps }: Props) {
    useFlash();

    const { data, setData, post, processing, errors } = useForm({
        odp_id: '',
        name: '',
        code: '',
        serial_number: '',
        customer_name: '',
        latitude: '',
        longitude: '',
        status: 'active',
        installed_at: '',
        notes: '',
    });

    function applyParentCoordinates() {
        const selectedOdp = odps.find((odp) => String(odp.id) === data.odp_id);

        if (!selectedOdp || selectedOdp.latitude == null || selectedOdp.longitude == null) {
            return;
        }

        setData((prev) => ({
            ...prev,
            latitude: String(selectedOdp.latitude),
            longitude: String(selectedOdp.longitude),
        }));
    }

    function handleCoordinateChange(lat: number, lng: number) {
        setData((prev) => ({ ...prev, latitude: String(lat), longitude: String(lng) }));
    }

    const selectedParentOdp = data.odp_id
        ? odps.find((odp) => String(odp.id) === data.odp_id)
        : null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah ONT" />
            <div className="p-6 max-w-4xl space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold">Tambah ONT</h1>
                    <p className="text-sm text-muted-foreground">Tambah Optical Network Terminal baru ke jaringan</p>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); post('/onts'); }} className="space-y-8">
                    <div className="space-y-4">
                        <h2 className="text-base font-semibold">Identitas ONT</h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Parent ODP <span className="text-destructive">*</span></Label>
                                <Select value={data.odp_id} onValueChange={(v) => setData('odp_id', v)}>
                                    <SelectTrigger><SelectValue placeholder="Pilih ODP" /></SelectTrigger>
                                    <SelectContent>
                                        {odps.map((odp) => (
                                            <SelectItem key={odp.id} value={String(odp.id)}>
                                                {odp.code} — {odp.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.odp_id} />
                            </div>
                            <div className="space-y-2">
                                <Label>Status <span className="text-destructive">*</span></Label>
                                <Select value={data.status} onValueChange={(v) => setData('status', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {statusOptions.map((status) => (
                                            <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.status} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama ONT <span className="text-destructive">*</span></Label>
                                <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="Contoh: ONT-RMH-001" />
                                <InputError message={errors.name} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="code">Kode ONT <span className="text-destructive">*</span></Label>
                                <Input id="code" value={data.code} onChange={(e) => setData('code', e.target.value)} placeholder="Contoh: ONT-WIKARTA-001" />
                                <InputError message={errors.code} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="serial_number">Serial Number</Label>
                                <Input id="serial_number" value={data.serial_number} onChange={(e) => setData('serial_number', e.target.value)} placeholder="Contoh: ZTEGC12345" />
                                <InputError message={errors.serial_number} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="customer_name">Nama Pelanggan</Label>
                                <Input id="customer_name" value={data.customer_name} onChange={(e) => setData('customer_name', e.target.value)} placeholder="Contoh: Budi Santoso" />
                                <InputError message={errors.customer_name} />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="installed_at">Tanggal Pasang</Label>
                                <Input id="installed_at" type="date" value={data.installed_at} onChange={(e) => setData('installed_at', e.target.value)} />
                                <InputError message={errors.installed_at} />
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-semibold">Koordinat (Opsional)</h2>
                            <Button type="button" variant="outline" size="sm" onClick={applyParentCoordinates}>
                                Salin dari ODP
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="latitude">Latitude</Label>
                                <Input id="latitude" value={data.latitude} onChange={(e) => setData('latitude', e.target.value)} placeholder="-7.330628" />
                                <InputError message={errors.latitude} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="longitude">Longitude</Label>
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
                                parentPoint={selectedParentOdp && selectedParentOdp.latitude != null && selectedParentOdp.longitude != null
                                    ? {
                                        latitude: selectedParentOdp.latitude,
                                        longitude: selectedParentOdp.longitude,
                                        label: `Parent ODP: ${selectedParentOdp.code}`,
                                    }
                                    : null}
                            />
                        </Suspense>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <Label htmlFor="notes">Catatan</Label>
                        <Textarea id="notes" value={data.notes} onChange={(e) => setData('notes', e.target.value)} rows={3} placeholder="Catatan tambahan untuk ONT ini..." />
                        <InputError message={errors.notes} />
                    </div>

                    <div className="flex gap-2">
                        <Button type="submit" disabled={processing}>Simpan ONT</Button>
                        <Button variant="outline" asChild><Link href="/onts">Batal</Link></Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

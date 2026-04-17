import { Head, Link, useForm } from '@inertiajs/react';
import { lazy, Suspense } from 'react';
import { Pencil, ArrowLeft, MapPin, Wrench, Calendar } from 'lucide-react';
import { useFlash } from '@/hooks/use-flash';
import { StatusBadge } from '@/components/status-badge';
import { CapacityBar } from '@/components/capacity-bar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, MaintenanceLog, Ont } from '@/types';

const CoordinatePicker = lazy(() => import('@/components/map/CoordinatePicker'));

type Props = {
    ont: Ont;
    maintenanceLogs: MaintenanceLog[];
};

export default function OntShow({ ont, maintenanceLogs }: Props) {
    useFlash();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'ONT', href: '/onts' },
        { title: ont.name, href: `/onts/${ont.id}` },
    ];

    const maintenanceForm = useForm({
        type: 'routine',
        description: '',
        findings: '',
        resolution: '',
        performed_at: new Date().toISOString().slice(0, 16),
        next_maintenance_at: '',
    });

    const parentPoint = ont.odp && ont.odp.latitude != null && ont.odp.longitude != null
        ? {
            latitude: ont.odp.latitude,
            longitude: ont.odp.longitude,
            label: `Parent ODP: ${ont.odp.code}`,
        }
        : null;

    const hasMapContext = (ont.latitude != null && ont.longitude != null) || parentPoint !== null;

    function submitMaintenance(e: React.FormEvent) {
        e.preventDefault();
        maintenanceForm.post(`/onts/${ont.id}/maintenance-logs`, {
            preserveScroll: true,
            onSuccess: () => maintenanceForm.reset(),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={ont.name} />
            <div className="p-6 space-y-6">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/onts"><ArrowLeft className="h-4 w-4" /></Link>
                            </Button>
                            <h1 className="text-2xl font-semibold">{ont.name}</h1>
                            <StatusBadge status={ont.status} />
                        </div>
                        <p className="text-sm text-muted-foreground font-mono ml-8">{ont.code}</p>
                    </div>
                    <Button asChild>
                        <Link href={`/onts/${ont.id}/edit`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{ont.total_ports}</div>
                            <p className="text-xs text-muted-foreground">Total Port</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-green-600">{ont.used_ports}</div>
                            <p className="text-xs text-muted-foreground">Port Terpakai</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-blue-600">{ont.available_ports}</div>
                            <p className="text-xs text-muted-foreground">Port Tersedia</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{ont.capacity_percentage}%</div>
                            <p className="text-xs text-muted-foreground">Utilisasi</p>
                            <CapacityBar usedPorts={ont.used_ports} totalPorts={ont.total_ports} showLabel={false} className="mt-2" />
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="info">
                    <TabsList>
                        <TabsTrigger value="info">Informasi</TabsTrigger>
                        <TabsTrigger value="location">Lokasi</TabsTrigger>
                        <TabsTrigger value="maintenance">
                            Maintenance
                            {maintenanceLogs.length > 0 && (
                                <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-full px-1.5">
                                    {maintenanceLogs.length}
                                </span>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="info" className="mt-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground mb-3">Detail Perangkat</h3>
                                        <dl className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <dt className="text-muted-foreground">Kode</dt>
                                                <dd className="font-mono font-medium">{ont.code}</dd>
                                            </div>
                                            <div className="flex justify-between">
                                                <dt className="text-muted-foreground">Serial Number</dt>
                                                <dd className="font-mono">{ont.serial_number ?? '—'}</dd>
                                            </div>
                                            <div className="flex justify-between">
                                                <dt className="text-muted-foreground">Pelanggan</dt>
                                                <dd>{ont.customer_name ?? '—'}</dd>
                                            </div>
                                            <div className="flex justify-between">
                                                <dt className="text-muted-foreground">Parent ODP</dt>
                                                <dd>
                                                    {ont.odp ? (
                                                        <Link href={`/odps/${ont.odp.id}`} className="hover:underline text-primary">
                                                            {ont.odp.code}
                                                        </Link>
                                                    ) : '—'}
                                                </dd>
                                            </div>
                                            <div className="flex justify-between">
                                                <dt className="text-muted-foreground">Tgl. Pasang</dt>
                                                <dd>{ont.installed_at ?? '—'}</dd>
                                            </div>
                                        </dl>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground mb-3">Koordinat</h3>
                                        <dl className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <dt className="text-muted-foreground">Latitude</dt>
                                                <dd className="font-mono text-xs">{ont.latitude ?? '—'}</dd>
                                            </div>
                                            <div className="flex justify-between">
                                                <dt className="text-muted-foreground">Longitude</dt>
                                                <dd className="font-mono text-xs">{ont.longitude ?? '—'}</dd>
                                            </div>
                                        </dl>
                                        {ont.latitude != null && ont.longitude != null && (
                                            <div className="mt-4 p-3 bg-muted rounded text-sm">
                                                <MapPin className="h-3 w-3 inline mr-1" />
                                                {ont.latitude}, {ont.longitude}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {ont.notes && (
                                    <>
                                        <Separator className="my-4" />
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground mb-1">Catatan</p>
                                            <p className="text-sm whitespace-pre-wrap">{ont.notes}</p>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="location" className="mt-4">
                        <Card>
                            <CardContent className="pt-6">
                                {hasMapContext ? (
                                    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                                        <CoordinatePicker
                                            latitude={ont.latitude}
                                            longitude={ont.longitude}
                                            onChange={() => {}}
                                            height="400px"
                                            readOnly
                                            parentPoint={parentPoint}
                                        />
                                    </Suspense>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-8">Koordinat ONT maupun parent ODP belum diset.</p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="maintenance" className="mt-4 space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Tambah Catatan Maintenance</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={submitMaintenance} className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Tipe</Label>
                                            <Select value={maintenanceForm.data.type} onValueChange={(v) => maintenanceForm.setData('type', v)}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="routine">Rutin</SelectItem>
                                                    <SelectItem value="corrective">Korektif</SelectItem>
                                                    <SelectItem value="emergency">Darurat</SelectItem>
                                                    <SelectItem value="upgrade">Upgrade</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Waktu Pelaksanaan</Label>
                                            <Input type="datetime-local" value={maintenanceForm.data.performed_at} onChange={(e) => maintenanceForm.setData('performed_at', e.target.value)} />
                                            <InputError message={maintenanceForm.errors.performed_at} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Deskripsi Pekerjaan <span className="text-destructive">*</span></Label>
                                        <Textarea value={maintenanceForm.data.description} onChange={(e) => maintenanceForm.setData('description', e.target.value)} rows={2} />
                                        <InputError message={maintenanceForm.errors.description} />
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Temuan</Label>
                                            <Textarea value={maintenanceForm.data.findings} onChange={(e) => maintenanceForm.setData('findings', e.target.value)} rows={2} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Resolusi</Label>
                                            <Textarea value={maintenanceForm.data.resolution} onChange={(e) => maintenanceForm.setData('resolution', e.target.value)} rows={2} />
                                        </div>
                                    </div>
                                    <Button type="submit" disabled={maintenanceForm.processing} size="sm">
                                        <Wrench className="mr-2 h-4 w-4" />
                                        Simpan Catatan
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        <div className="space-y-3">
                            {maintenanceLogs.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">Belum ada catatan maintenance.</p>
                            ) : (
                                maintenanceLogs.map((log) => (
                                    <Card key={log.id}>
                                        <CardContent className="pt-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                            {log.type}
                                                        </span>
                                                        <Calendar className="h-3 w-3 text-muted-foreground" />
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(log.performed_at).toLocaleString('id-ID')}
                                                        </span>
                                                        {log.technician && (
                                                            <span className="text-xs text-muted-foreground">
                                                                oleh {log.technician.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm">{log.description}</p>
                                                    {log.findings && (
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            <span className="font-medium">Temuan:</span> {log.findings}
                                                        </p>
                                                    )}
                                                    {log.resolution && (
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            <span className="font-medium">Resolusi:</span> {log.resolution}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}

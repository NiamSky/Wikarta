import { Head, Link, useForm } from '@inertiajs/react';
import { Pencil, ArrowLeft, MapPin, Wrench, Calendar, Network } from 'lucide-react';
import { lazy, Suspense } from 'react';
import { CapacityBar } from '@/components/capacity-bar';
import InputError from '@/components/input-error';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useFlash } from '@/hooks/use-flash';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, MaintenanceLog, Olt } from '@/types';

const CoordinatePicker = lazy(() => import('@/components/map/CoordinatePicker'));

type Props = {
    olt: Olt;
    maintenanceLogs: MaintenanceLog[];
};

export default function OltShow({ olt, maintenanceLogs }: Props) {
    useFlash();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'OLT', href: '/olts' },
        { title: olt.name, href: `/olts/${olt.id}` },
    ];

    const maintenanceForm = useForm({
        type: 'routine',
        description: '',
        findings: '',
        resolution: '',
        performed_at: new Date().toISOString().slice(0, 16),
        next_maintenance_at: '',
    });

    const hasMapContext = olt.latitude != null && olt.longitude != null;

    function submitMaintenance(e: React.FormEvent) {
        e.preventDefault();
        maintenanceForm.post(`/olts/${olt.id}/maintenance-logs`, {
            preserveScroll: true,
            onSuccess: () => maintenanceForm.reset(),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={olt.name} />
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/olts"><ArrowLeft className="h-4 w-4" /></Link>
                            </Button>
                            <h1 className="text-2xl font-semibold">{olt.name}</h1>
                            <StatusBadge status={olt.status} />
                        </div>
                        <p className="text-sm text-muted-foreground font-mono ml-8">{olt.code}</p>
                        {olt.ip_address && (
                            <p className="text-sm text-muted-foreground font-mono ml-8">{olt.ip_address}</p>
                        )}
                    </div>
                    <Button asChild>
                        <Link href={`/olts/${olt.id}/edit`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                        </Link>
                    </Button>
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{olt.total_ports}</div>
                            <p className="text-xs text-muted-foreground">Total PON Port</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-green-600">{olt.used_ports}</div>
                            <p className="text-xs text-muted-foreground">Port Terpakai</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-blue-600">{olt.available_ports}</div>
                            <p className="text-xs text-muted-foreground">Port Tersedia</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{olt.capacity_percentage}%</div>
                            <p className="text-xs text-muted-foreground">Utilisasi</p>
                            <CapacityBar usedPorts={olt.used_ports} totalPorts={olt.total_ports} showLabel={false} className="mt-2" />
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="info">
                    <TabsList>
                        <TabsTrigger value="info">Informasi</TabsTrigger>
                        <TabsTrigger value="odcs">
                            ODC
                            {olt.odcs && olt.odcs.length > 0 && (
                                <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-full px-1.5">
                                    {olt.odcs.length}
                                </span>
                            )}
                        </TabsTrigger>
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

                    {/* Info Tab */}
                    <TabsContent value="info" className="mt-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground mb-3">Detail Perangkat</h3>
                                        <dl className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <dt className="text-muted-foreground">Kode</dt>
                                                <dd className="font-mono font-medium">{olt.code}</dd>
                                            </div>
                                            <div className="flex justify-between">
                                                <dt className="text-muted-foreground">Brand</dt>
                                                <dd>{olt.brand ?? '—'}</dd>
                                            </div>
                                            <div className="flex justify-between">
                                                <dt className="text-muted-foreground">Model</dt>
                                                <dd>{olt.model ?? '—'}</dd>
                                            </div>
                                            <div className="flex justify-between">
                                                <dt className="text-muted-foreground">IP Address</dt>
                                                <dd className="font-mono">{olt.ip_address ?? '—'}</dd>
                                            </div>
                                        </dl>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground mb-3">Lokasi</h3>
                                        <dl className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <dt className="text-muted-foreground">Kota</dt>
                                                <dd>{olt.city?.name ?? '—'}</dd>
                                            </div>
                                            <div className="flex justify-between">
                                                <dt className="text-muted-foreground">Kecamatan</dt>
                                                <dd>{olt.district?.name ?? '—'}</dd>
                                            </div>
                                            <div className="flex justify-between">
                                                <dt className="text-muted-foreground">Kelurahan</dt>
                                                <dd>{olt.village?.name ?? '—'}</dd>
                                            </div>
                                            <div className="flex justify-between">
                                                <dt className="text-muted-foreground">Koordinat</dt>
                                                <dd className="font-mono text-xs">
                                                    {olt.latitude != null ? `${olt.latitude}, ${olt.longitude}` : '—'}
                                                </dd>
                                            </div>
                                        </dl>
                                        {olt.location_description && (
                                            <div className="mt-4 p-3 bg-muted rounded text-sm">
                                                <MapPin className="h-3 w-3 inline mr-1" />
                                                {olt.location_description}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {olt.notes && (
                                    <>
                                        <Separator className="my-4" />
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground mb-1">Catatan</p>
                                            <p className="text-sm whitespace-pre-wrap">{olt.notes}</p>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ODCs Tab */}
                    <TabsContent value="odcs" className="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Network className="h-4 w-4" />
                                    Daftar ODC
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {!olt.odcs || olt.odcs.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-8">Belum ada ODC terdaftar.</p>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Nama / Kode</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>ODP</TableHead>
                                                <TableHead>Kapasitas</TableHead>
                                                <TableHead></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {olt.odcs.map((odc) => (
                                                <TableRow key={odc.id}>
                                                    <TableCell>
                                                        <div className="font-medium">{odc.name}</div>
                                                        <div className="text-xs text-muted-foreground font-mono">{odc.code}</div>
                                                    </TableCell>
                                                    <TableCell><StatusBadge status={odc.status} /></TableCell>
                                                    <TableCell className="text-sm">{odc.odps_count} ODP</TableCell>
                                                    <TableCell>
                                                        <CapacityBar usedPorts={odc.used_ports} totalPorts={odc.total_ports} className="w-24" />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={`/odcs/${odc.id}`}>Detail</Link>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Location Tab */}
                    <TabsContent value="location" className="mt-4">
                        <Card>
                            <CardContent className="pt-6">
                                {hasMapContext ? (
                                    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                                        <CoordinatePicker
                                            latitude={olt.latitude}
                                            longitude={olt.longitude}
                                            onChange={() => {}}
                                            height="400px"
                                            readOnly
                                        />
                                    </Suspense>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-8">Koordinat belum diset.</p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Maintenance Tab */}
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
                                            <div className="flex items-start gap-4">
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

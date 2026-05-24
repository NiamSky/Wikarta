import { Head, Link } from '@inertiajs/react';
import { Signal, Box, Radio, Network, AlertTriangle, Wrench, ArrowRight } from 'lucide-react';
import { CapacityBar } from '@/components/capacity-bar';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFlash } from '@/hooks/use-flash';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem, MaintenanceLog } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard() },
];

type OdpSummary = {
    id: number;
    name: string;
    code: string;
    status: string;
    total_ports: number;
    used_ports: number;
    district?: { id: number; name: string } | null;
};

type Stats = {
    odp: { total: number; near_capacity: number; by_status: Record<string, number> };
    odc: { total: number; active: number };
    olt: { total: number; active: number };
    connections: {
        total: number;
        olt_to_odc: number;
        odc_to_odp: number;
        odp_to_ont: number;
    };
};

type Props = {
    stats: Stats;
    recentMaintenance: MaintenanceLog[];
    nearCapacityOdps: OdpSummary[];
};

export default function Dashboard({ stats, recentMaintenance, nearCapacityOdps }: Props) {
    useFlash();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="p-6 space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold">Dashboard</h1>
                    <p className="text-sm text-muted-foreground">Ringkasan infrastruktur jaringan Wikarta</p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground">Total ODP</p>
                                    <div className="text-3xl font-bold">{stats.odp.total}</div>
                                </div>
                                <Signal className="h-8 w-8 text-muted-foreground/30" />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{stats.odp.by_status['active'] ?? 0} aktif</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground">Total ODC</p>
                                    <div className="text-3xl font-bold">{stats.odc.total}</div>
                                </div>
                                <Box className="h-8 w-8 text-muted-foreground/30" />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{stats.odc.active} aktif</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground">Total OLT</p>
                                    <div className="text-3xl font-bold">{stats.olt.total}</div>
                                </div>
                                <Radio className="h-8 w-8 text-muted-foreground/30" />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{stats.olt.active} aktif</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground">Sambungan Device</p>
                                    <div className="text-3xl font-bold">{stats.connections.total}</div>
                                </div>
                                <Network className="h-8 w-8 text-muted-foreground/30" />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                OLT→ODC {stats.connections.olt_to_odc} | ODC→ODP {stats.connections.odc_to_odp} | ODP→ONT {stats.connections.odp_to_ont}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Alert: Near Capacity */}
                {stats.odp.near_capacity > 0 && (
                    <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-900">
                        <CardContent className="pt-4 pb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                                    <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
                                        {stats.odp.near_capacity} ODP mencapai kapasitas ≥ 80%
                                    </p>
                                </div>
                                <Button variant="outline" size="sm" asChild className="border-orange-300">
                                    <Link href="/odps">
                                        Lihat Semua <ArrowRight className="ml-1 h-3 w-3" />
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* ODP Status Distribution */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Distribusi Status ODP</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {Object.entries(stats.odp.by_status).map(([status, count]) => (
                                    <div key={status} className="flex items-center justify-between text-sm">
                                        <StatusBadge status={status} />
                                        <span className="font-medium">{count}</span>
                                    </div>
                                ))}
                                {Object.keys(stats.odp.by_status).length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-4">Belum ada data ODP.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Near Capacity ODPs */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base">ODP Hampir Penuh</CardTitle>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href="/odps">Lihat Semua <ArrowRight className="ml-1 h-3 w-3" /></Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {nearCapacityOdps.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">Semua ODP masih memiliki kapasitas cukup.</p>
                            ) : (
                                <div className="space-y-3">
                                    {nearCapacityOdps.map((odp) => (
                                        <div key={odp.id} className="flex items-center justify-between gap-2">
                                            <div className="min-w-0 flex-1">
                                                <Link href={`/odps/${odp.id}`} className="text-sm font-medium hover:underline truncate block">
                                                    {odp.name}
                                                </Link>
                                                <p className="text-xs text-muted-foreground">{odp.district?.name ?? '—'}</p>
                                            </div>
                                            <CapacityBar usedPorts={odp.used_ports} totalPorts={odp.total_ports} className="w-28 shrink-0" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Maintenance */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Wrench className="h-4 w-4" />
                                    Maintenance Terbaru
                                </CardTitle>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href="/maintenance-logs">Semua Log <ArrowRight className="ml-1 h-3 w-3" /></Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {recentMaintenance.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">Belum ada catatan maintenance.</p>
                            ) : (
                                <div className="space-y-3">
                                    {recentMaintenance.map((log) => (
                                        <div key={log.id} className="flex items-start justify-between gap-2 text-sm border-b last:border-0 pb-2 last:pb-0">
                                            <div>
                                                <span className="font-medium capitalize">{log.type}</span>
                                                <p className="text-muted-foreground text-xs mt-0.5 line-clamp-1">{log.description}</p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(log.performed_at).toLocaleDateString('id-ID')}
                                                </p>
                                                {log.technician && (
                                                    <p className="text-xs text-muted-foreground">{log.technician.name}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

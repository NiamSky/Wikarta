import { Head, router } from '@inertiajs/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useFlash } from '@/hooks/use-flash';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Laporan', href: '/reports/capacity' },
    { title: 'Kapasitas', href: '/reports/capacity' },
];

type CapacityRow = {
    name: string;
    total_odp: number;
    total_ports: number;
    used_ports: number;
    available_ports: number;
    utilization_pct: number;
};

type Props = {
    data: CapacityRow[];
    group_by: 'city' | 'district';
};

function utilizationColor(pct: number): string {
    if (pct >= 90) return '#ef4444';
    if (pct >= 80) return '#f97316';
    if (pct >= 60) return '#eab308';
    return '#22c55e';
}

export default function ReportsCapacity({ data, group_by }: Props) {
    useFlash();

    function switchGroup(value: 'city' | 'district') {
        router.get('/reports/capacity', { group_by: value }, { preserveState: false });
    }

    const topItems = data.slice(0, 20);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan Kapasitas" />
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">Laporan Kapasitas ODP</h1>
                        <p className="text-sm text-muted-foreground">Utilisasi port ODP per area</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Kelompokkan per:</span>
                        <Button
                            variant={group_by === 'district' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => switchGroup('district')}
                        >
                            Kecamatan
                        </Button>
                        <Button
                            variant={group_by === 'city' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => switchGroup('city')}
                        >
                            Kota/Kabupaten
                        </Button>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                        <div className="h-3 w-3 rounded-sm bg-green-500" />
                        <span>Normal (&lt;60%)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="h-3 w-3 rounded-sm bg-yellow-500" />
                        <span>Menengah (60–79%)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="h-3 w-3 rounded-sm bg-orange-500" />
                        <span>Tinggi (80–89%)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="h-3 w-3 rounded-sm bg-red-500" />
                        <span>Kritis (≥90%)</span>
                    </div>
                </div>

                {/* Bar Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Utilisasi Kapasitas per {group_by === 'city' ? 'Kota/Kabupaten' : 'Kecamatan'}
                            {data.length > 20 && (
                                <span className="text-sm font-normal text-muted-foreground ml-2">
                                    (Menampilkan 20 teratas dari {data.length})
                                </span>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {topItems.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">Belum ada data ODP.</p>
                        ) : (
                            <ResponsiveContainer width="100%" height={320}>
                                <BarChart data={topItems} margin={{ top: 4, right: 16, left: 0, bottom: 60 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 11 }}
                                        angle={-40}
                                        textAnchor="end"
                                        interval={0}
                                    />
                                    <YAxis
                                        domain={[0, 100]}
                                        tickFormatter={(v) => `${v}%`}
                                        tick={{ fontSize: 11 }}
                                        width={40}
                                    />
                                    <Tooltip
                                        formatter={(value) => [`${value ?? 0}%`, 'Utilisasi']}
                                        labelFormatter={(label) => `Area: ${label}`}
                                    />
                                    <Bar dataKey="utilization_pct" radius={[3, 3, 0, 0]} maxBarSize={40}>
                                        {topItems.map((row, i) => (
                                            <Cell key={i} fill={utilizationColor(row.utilization_pct)} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Data Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Detail Data Kapasitas</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="rounded-md border-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{group_by === 'city' ? 'Kota/Kabupaten' : 'Kecamatan'}</TableHead>
                                        <TableHead className="text-right">Jumlah ODP</TableHead>
                                        <TableHead className="text-right">Total Port</TableHead>
                                        <TableHead className="text-right">Terpakai</TableHead>
                                        <TableHead className="text-right">Tersedia</TableHead>
                                        <TableHead className="text-right">Utilisasi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                                Belum ada data ODP.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        data.map((row, i) => (
                                            <TableRow key={i}>
                                                <TableCell className="font-medium">{row.name}</TableCell>
                                                <TableCell className="text-right">{row.total_odp}</TableCell>
                                                <TableCell className="text-right">{row.total_ports}</TableCell>
                                                <TableCell className="text-right">{row.used_ports}</TableCell>
                                                <TableCell className="text-right">{row.available_ports}</TableCell>
                                                <TableCell className="text-right">
                                                    <span
                                                        className="font-medium"
                                                        style={{ color: utilizationColor(row.utilization_pct) }}
                                                    >
                                                        {row.utilization_pct}%
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

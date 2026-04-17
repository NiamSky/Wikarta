import { Head } from '@inertiajs/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useFlash } from '@/hooks/use-flash';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Laporan', href: '/reports/capacity' },
    { title: 'Coverage', href: '/reports/coverage' },
];

type CoverageRow = {
    district: string;
    city: string;
    odp_count: number;
    total_ports: number;
    used_ports: number;
    utilization_pct: number;
};

type Props = {
    coverage: CoverageRow[];
};

function utilizationColor(pct: number): string {
    if (pct >= 90) return '#ef4444';
    if (pct >= 80) return '#f97316';
    if (pct >= 60) return '#eab308';
    return '#22c55e';
}

export default function ReportsCoverage({ coverage }: Props) {
    useFlash();

    const totalOdp = coverage.reduce((s, r) => s + r.odp_count, 0);
    const totalPorts = coverage.reduce((s, r) => s + r.total_ports, 0);
    const totalUsed = coverage.reduce((s, r) => s + r.used_ports, 0);
    const avgUtilization = totalPorts > 0 ? Math.round((totalUsed / totalPorts) * 100 * 10) / 10 : 0;

    const chartData = coverage.slice(0, 15).map((r) => ({
        name: r.district,
        odp_count: r.odp_count,
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan Coverage" />
            <div className="p-6 space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold">Laporan Coverage Jaringan</h1>
                    <p className="text-sm text-muted-foreground">Distribusi ODP per kecamatan</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-xs text-muted-foreground">Kecamatan Tercakup</p>
                            <div className="text-3xl font-bold mt-1">{coverage.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-xs text-muted-foreground">Total ODP</p>
                            <div className="text-3xl font-bold mt-1">{totalOdp}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-xs text-muted-foreground">Total Port</p>
                            <div className="text-3xl font-bold mt-1">{totalPorts.toLocaleString()}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-xs text-muted-foreground">Rata-rata Utilisasi</p>
                            <div
                                className="text-3xl font-bold mt-1"
                                style={{ color: utilizationColor(avgUtilization) }}
                            >
                                {avgUtilization}%
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Bar Chart — ODP Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Distribusi ODP per Kecamatan
                            {coverage.length > 15 && (
                                <span className="text-sm font-normal text-muted-foreground ml-2">
                                    (15 teratas dari {coverage.length})
                                </span>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {chartData.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">Belum ada data ODP.</p>
                        ) : (
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 60 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 11 }}
                                        angle={-40}
                                        textAnchor="end"
                                        interval={0}
                                    />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={36} />
                                    <Tooltip
                                        formatter={(value) => [value, 'Jumlah ODP']}
                                        labelFormatter={(label) => `Kecamatan: ${label}`}
                                    />
                                    <Bar dataKey="odp_count" fill="#3b82f6" radius={[3, 3, 0, 0]} maxBarSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Full Coverage Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Detail Coverage per Kecamatan</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Kecamatan</TableHead>
                                    <TableHead>Kota/Kabupaten</TableHead>
                                    <TableHead className="text-right">Jumlah ODP</TableHead>
                                    <TableHead className="text-right">Total Port</TableHead>
                                    <TableHead className="text-right">Terpakai</TableHead>
                                    <TableHead className="text-right">Utilisasi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {coverage.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                            Belum ada data ODP.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    coverage.map((row, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="font-medium">{row.district}</TableCell>
                                            <TableCell className="text-muted-foreground">{row.city}</TableCell>
                                            <TableCell className="text-right">{row.odp_count}</TableCell>
                                            <TableCell className="text-right">{row.total_ports}</TableCell>
                                            <TableCell className="text-right">{row.used_ports}</TableCell>
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
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

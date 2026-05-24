import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useFlash } from '@/hooks/use-flash';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, MaintenanceLog } from '@/types';
import type { PaginatedData } from '@/types/pagination';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Maintenance Log', href: '/maintenance-logs' },
];

const typeColors: Record<string, string> = {
    routine: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200',
    corrective: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200',
    emergency: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
    upgrade: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200',
};

const typeLabels: Record<string, string> = {
    routine: 'Rutin',
    corrective: 'Korektif',
    emergency: 'Darurat',
    upgrade: 'Upgrade',
};

const entityLabels: Record<string, string> = {
    odp: 'ODP',
    odc: 'ODC',
    olt: 'OLT',
    ont: 'ONT',
};

type Props = {
    logs: PaginatedData<MaintenanceLog>;
    filters: { type?: string; loggable_type?: string };
};

export default function MaintenanceLogsIndex({ logs, filters }: Props) {
    useFlash();

    function applyFilter(params: Record<string, string>) {
        router.get('/maintenance-logs', { ...filters, ...params }, { preserveState: true, replace: true });
    }

    function resetFilters() {
        router.get('/maintenance-logs', {}, { preserveState: false });
    }

    const hasFilters = !!(filters.type || filters.loggable_type);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Maintenance Log" />
            <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Maintenance Log</h1>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                    <Select value={filters.type ?? ''} onValueChange={(v) => applyFilter({ type: v === 'all' ? '' : v })}>
                        <SelectTrigger className="w-40"><SelectValue placeholder="Semua Tipe" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Tipe</SelectItem>
                            <SelectItem value="routine">Rutin</SelectItem>
                            <SelectItem value="corrective">Korektif</SelectItem>
                            <SelectItem value="emergency">Darurat</SelectItem>
                            <SelectItem value="upgrade">Upgrade</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={filters.loggable_type ?? ''} onValueChange={(v) => applyFilter({ loggable_type: v === 'all' ? '' : v })}>
                        <SelectTrigger className="w-36"><SelectValue placeholder="Semua Entitas" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Entitas</SelectItem>
                            <SelectItem value="odp">ODP</SelectItem>
                            <SelectItem value="odc">ODC</SelectItem>
                            <SelectItem value="olt">OLT</SelectItem>
                            <SelectItem value="ont">ONT</SelectItem>
                        </SelectContent>
                    </Select>
                    {hasFilters && (
                        <Button variant="ghost" size="sm" onClick={resetFilters}>Reset</Button>
                    )}
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tipe</TableHead>
                                <TableHead>Entitas</TableHead>
                                <TableHead>Deskripsi</TableHead>
                                <TableHead>Teknisi</TableHead>
                                <TableHead>Waktu</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                        Belum ada catatan maintenance.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs.data.map((log) => {
                                    const entityType = log.loggable_type.split('\\').pop()?.toLowerCase() ?? '';
                                    return (
                                        <TableRow key={log.id}>
                                            <TableCell>
                                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${typeColors[log.type] ?? ''}`}>
                                                    {typeLabels[log.type] ?? log.type}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">
                                                    {entityLabels[entityType] ?? entityType} #{log.loggable_id}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="max-w-xs">
                                                <p className="text-sm truncate">{log.description}</p>
                                                {log.findings && (
                                                    <p className="text-xs text-muted-foreground truncate">Temuan: {log.findings}</p>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-sm">{log.technician?.name ?? '—'}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                                {new Date(log.performed_at).toLocaleString('id-ID')}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {logs.last_page > 1 && (
                    <div className="flex justify-center gap-1">
                        {logs.links.map((link, i) => (
                            <Button
                                key={i}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

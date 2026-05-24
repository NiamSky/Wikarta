import { Head, router } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useFlash } from '@/hooks/use-flash';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, ActivityLog } from '@/types';
import type { PaginatedData } from '@/types/pagination';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Activity Log', href: '/activity-logs' },
];

const eventColors: Record<string, string> = {
    created: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200',
    updated: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200',
    deleted: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
    restored: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200',
};

type Props = {
    logs: PaginatedData<ActivityLog>;
    filters: { event?: string; subject_type?: string };
};

export default function ActivityLogsIndex({ logs, filters }: Props) {
    useFlash();

    function applyFilter(params: Record<string, string>) {
        router.get('/activity-logs', { ...filters, ...params }, { preserveState: true, replace: true });
    }

    function resetFilters() {
        router.get('/activity-logs', {}, { preserveState: false });
    }

    const hasFilters = !!(filters.event || filters.subject_type);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Activity Log" />
            <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Activity Log</h1>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                    <Select value={filters.event ?? ''} onValueChange={(v) => applyFilter({ event: v === 'all' ? '' : v })}>
                        <SelectTrigger className="w-36"><SelectValue placeholder="Semua Event" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Event</SelectItem>
                            <SelectItem value="created">Created</SelectItem>
                            <SelectItem value="updated">Updated</SelectItem>
                            <SelectItem value="deleted">Deleted</SelectItem>
                            <SelectItem value="restored">Restored</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={filters.subject_type ?? ''} onValueChange={(v) => applyFilter({ subject_type: v === 'all' ? '' : v })}>
                        <SelectTrigger className="w-36"><SelectValue placeholder="Semua Entitas" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Entitas</SelectItem>
                            <SelectItem value="Odp">ODP</SelectItem>
                            <SelectItem value="Odc">ODC</SelectItem>
                            <SelectItem value="Olt">OLT</SelectItem>
                            <SelectItem value="Ont">ONT</SelectItem>
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
                                <TableHead>Event</TableHead>
                                <TableHead>Entitas</TableHead>
                                <TableHead>Pengguna</TableHead>
                                <TableHead>IP Address</TableHead>
                                <TableHead>Waktu</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                        Belum ada aktivitas tercatat.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs.data.map((log) => {
                                    const entityName = log.subject_type.split('\\').pop() ?? log.subject_type;
                                    return (
                                        <TableRow key={log.id}>
                                            <TableCell>
                                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${eventColors[log.event] ?? ''}`}>
                                                    {log.event}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{entityName} #{log.subject_id}</Badge>
                                            </TableCell>
                                            <TableCell className="text-sm">{log.user?.name ?? 'System'}</TableCell>
                                            <TableCell className="text-sm font-mono text-muted-foreground">{log.ip_address ?? '—'}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                                {new Date(log.created_at).toLocaleString('id-ID')}
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

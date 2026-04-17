import { Head, Link, router } from '@inertiajs/react';
import { PlusCircle, Trash2, Pencil, Eye } from 'lucide-react';
import { useFlash } from '@/hooks/use-flash';
import { StatusBadge } from '@/components/status-badge';
import { CapacityBar } from '@/components/capacity-bar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Odc, Olt, GeoRef } from '@/types';
import type { PaginatedData } from '@/types/pagination';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'ODC', href: '/odcs' },
];

type Props = {
    odcs: PaginatedData<Odc>;
    filters: { status?: string; olt_id?: string; city_id?: string; search?: string };
    olts: Pick<Olt, 'id' | 'name' | 'code'>[];
    cities: GeoRef[];
};

export default function OdcIndex({ odcs, filters, olts, cities }: Props) {
    useFlash();

    const [search, setSearch] = useState(filters.search ?? '');

    function applyFilter(params: Record<string, string>) {
        router.get('/odcs', { ...filters, ...params }, { preserveState: true, replace: true });
    }

    function resetFilters() {
        router.get('/odcs', {}, { preserveState: false });
    }

    const hasFilters = !!(filters.status || filters.olt_id || filters.city_id || filters.search);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="ODC" />
            <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">ODC (Optical Distribution Cabinet)</h1>
                    <Button asChild>
                        <Link href="/odcs/create">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Tambah ODC
                        </Link>
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                    <Input
                        placeholder="Cari nama atau kode..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && applyFilter({ search })}
                        className="w-56"
                    />
                    <Select value={filters.status ?? ''} onValueChange={(v) => applyFilter({ status: v === 'all' ? '' : v })}>
                        <SelectTrigger className="w-40"><SelectValue placeholder="Semua Status" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Status</SelectItem>
                            <SelectItem value="active">Aktif</SelectItem>
                            <SelectItem value="inactive">Tidak Aktif</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="decommissioned">Decommissioned</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={filters.olt_id ?? ''} onValueChange={(v) => applyFilter({ olt_id: v === 'all' ? '' : v })}>
                        <SelectTrigger className="w-48"><SelectValue placeholder="Semua OLT" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua OLT</SelectItem>
                            {olts.map((o) => (
                                <SelectItem key={o.id} value={String(o.id)}>{o.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={filters.city_id ?? ''} onValueChange={(v) => applyFilter({ city_id: v === 'all' ? '' : v })}>
                        <SelectTrigger className="w-40"><SelectValue placeholder="Semua Kota" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Kota</SelectItem>
                            {cities.map((c) => (
                                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                            ))}
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
                                <TableHead>Nama / Kode</TableHead>
                                <TableHead>OLT Parent</TableHead>
                                <TableHead>Lokasi</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Kapasitas</TableHead>
                                <TableHead className="w-24">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {odcs.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                        Belum ada data ODC.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                odcs.data.map((odc) => (
                                    <TableRow key={odc.id}>
                                        <TableCell>
                                            <div className="font-medium">{odc.name}</div>
                                            <div className="text-xs text-muted-foreground font-mono">{odc.code}</div>
                                        </TableCell>
                                        <TableCell>
                                            {odc.olt ? (
                                                <Link href={`/olts/${odc.olt_id}`} className="hover:underline text-primary text-sm">
                                                    {odc.olt.name}
                                                </Link>
                                            ) : '—'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">{odc.district?.name ?? '—'}</div>
                                            <div className="text-xs text-muted-foreground">{odc.city?.name ?? ''}</div>
                                        </TableCell>
                                        <TableCell><StatusBadge status={odc.status} /></TableCell>
                                        <TableCell>
                                            <CapacityBar usedPorts={odc.used_ports} totalPorts={odc.total_ports} className="w-28" />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={`/odcs/${odc.id}`}><Eye className="h-4 w-4" /></Link>
                                                </Button>
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={`/odcs/${odc.id}/edit`}><Pencil className="h-4 w-4" /></Link>
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Hapus {odc.name}?</AlertDialogTitle>
                                                            <AlertDialogDescription>Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Batal</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                className="bg-destructive text-white hover:bg-destructive/90"
                                                                onClick={() => router.delete(`/odcs/${odc.id}`)}
                                                            >
                                                                Hapus
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {odcs.last_page > 1 && (
                    <div className="flex justify-center gap-1">
                        {odcs.links.map((link, i) => (
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

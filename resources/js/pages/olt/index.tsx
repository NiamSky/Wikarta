import { Head, Link, router } from '@inertiajs/react';
import { PlusCircle, Trash2, Pencil, Eye } from 'lucide-react';
import { useState } from 'react';
import { useFlash } from '@/hooks/use-flash';
import { StatusBadge } from '@/components/status-badge';
import { CapacityBar } from '@/components/capacity-bar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Olt, GeoRef } from '@/types';
import type { PaginatedData } from '@/types/pagination';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'OLT', href: '/olts' },
];

type Props = {
    olts: PaginatedData<Olt>;
    filters: { status?: string; city_id?: string; search?: string };
    cities: GeoRef[];
};

export default function OltIndex({ olts, filters, cities }: Props) {
    useFlash();

    const [search, setSearch] = useState(filters.search ?? '');

    function applyFilter(params: Record<string, string>) {
        router.get('/olts', { ...filters, ...params }, { preserveState: true, replace: true });
    }

    function resetFilters() {
        router.get('/olts', {}, { preserveState: false });
    }

    const hasFilters = !!(filters.status || filters.city_id || filters.search);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="OLT" />
            <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">OLT (Optical Line Terminal)</h1>
                    <Button asChild>
                        <Link href="/olts/create">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Tambah OLT
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
                                <TableHead>IP Address</TableHead>
                                <TableHead>Lokasi</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Kapasitas PON</TableHead>
                                <TableHead className="w-24">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {olts.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                        Belum ada data OLT.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                olts.data.map((olt) => (
                                    <TableRow key={olt.id}>
                                        <TableCell>
                                            <div className="font-medium">{olt.name}</div>
                                            <div className="text-xs text-muted-foreground font-mono">{olt.code}</div>
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">{olt.ip_address ?? '—'}</TableCell>
                                        <TableCell>
                                            <div className="text-sm">{olt.district?.name ?? '—'}</div>
                                            <div className="text-xs text-muted-foreground">{olt.city?.name ?? ''}</div>
                                        </TableCell>
                                        <TableCell><StatusBadge status={olt.status} /></TableCell>
                                        <TableCell>
                                            <CapacityBar usedPorts={olt.used_ports} totalPorts={olt.total_ports} className="w-28" />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={`/olts/${olt.id}`}><Eye className="h-4 w-4" /></Link>
                                                </Button>
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={`/olts/${olt.id}/edit`}><Pencil className="h-4 w-4" /></Link>
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Hapus {olt.name}?</AlertDialogTitle>
                                                            <AlertDialogDescription>Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Batal</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                className="bg-destructive text-white hover:bg-destructive/90"
                                                                onClick={() => router.delete(`/olts/${olt.id}`)}
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

                {olts.last_page > 1 && (
                    <div className="flex justify-center gap-1">
                        {olts.links.map((link, i) => (
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

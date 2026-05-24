import { Head, Link, router } from '@inertiajs/react';
import { PlusCircle, Trash2, Pencil, Eye, RotateCcw } from 'lucide-react';
import { CapacityBar } from '@/components/capacity-bar';
import { StatusBadge } from '@/components/status-badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useFlash } from '@/hooks/use-flash';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, City, Odc, Odp } from '@/types';
import type { PaginatedData } from '@/types/pagination';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Jaringan', href: '/odps' },
    { title: 'ODP', href: '/odps' },
];

type Props = {
    odps: PaginatedData<Odp>;
    filters: { status?: string; city_id?: string; search?: string };
    cities: Pick<City, 'id' | 'name'>[];
    odcs: Pick<Odc, 'id' | 'name' | 'code'>[];
};

const statusOptions = [
    { value: 'active', label: 'Aktif' },
    { value: 'inactive', label: 'Tidak Aktif' },
    { value: 'full', label: 'Port Penuh' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'damaged', label: 'Rusak' },
    { value: 'decommissioned', label: 'Dinonaktifkan' },
];

export default function OdpIndex({ odps, filters, cities }: Props) {
    useFlash();

    function handleFilter(key: string, value: string) {
        router.get('/odps', { ...filters, [key]: value || undefined }, { preserveState: true, replace: true });
    }

    function handleSearch(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const search = (e.currentTarget.elements.namedItem('search') as HTMLInputElement).value;
        router.get('/odps', { ...filters, search: search || undefined }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data ODP" />
            <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">ODP</h1>
                        <p className="text-sm text-muted-foreground">
                            Optical Distribution Point — {odps.total} titik terdaftar
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/odps/create">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Tambah ODP
                        </Link>
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <Input
                            name="search"
                            defaultValue={filters.search}
                            placeholder="Cari nama, kode, tiang..."
                            className="w-64"
                        />
                        <Button type="submit" variant="outline">Cari</Button>
                    </form>

                    <Select
                        value={filters.status ?? 'all'}
                        onValueChange={(v) => handleFilter('status', v === 'all' ? '' : v)}
                    >
                        <SelectTrigger className="w-44">
                            <SelectValue placeholder="Semua status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua status</SelectItem>
                            {statusOptions.map((s) => (
                                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={filters.city_id ?? 'all'}
                        onValueChange={(v) => handleFilter('city_id', v === 'all' ? '' : v)}
                    >
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Semua kota" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua kota</SelectItem>
                            {cities.map((c) => (
                                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {(filters.status || filters.city_id || filters.search) && (
                        <Button variant="ghost" size="sm" onClick={() => router.get('/odps')}>
                            <RotateCcw className="mr-1 h-3 w-3" />
                            Reset
                        </Button>
                    )}
                </div>

                {/* Table */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama / Kode</TableHead>
                                <TableHead>ODC</TableHead>
                                <TableHead>Wilayah</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-48">Kapasitas</TableHead>
                                <TableHead>Tiang</TableHead>
                                <TableHead className="w-28">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {odps.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                                        Tidak ada ODP yang ditemukan.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                odps.data.map((odp) => (
                                    <TableRow key={odp.id}>
                                        <TableCell>
                                            <div className="font-medium">{odp.name}</div>
                                            <div className="text-xs text-muted-foreground font-mono">{odp.code}</div>
                                        </TableCell>
                                        <TableCell>
                                            {odp.odc ? (
                                                <Link href={`/odcs/${odp.odc.id}`} className="text-sm hover:underline">
                                                    {odp.odc.code}
                                                </Link>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">{odp.district?.name ?? '-'}</div>
                                            <div className="text-xs text-muted-foreground">{odp.city?.name ?? '-'}</div>
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge status={odp.status} />
                                        </TableCell>
                                        <TableCell>
                                            <CapacityBar
                                                usedPorts={odp.used_ports}
                                                totalPorts={odp.total_ports}
                                            />
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {odp.pole_number ?? '-'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={`/odps/${odp.id}`}><Eye className="h-4 w-4" /></Link>
                                                </Button>
                                                {!odp.deleted_at && (
                                                    <>
                                                        <Button variant="ghost" size="icon" asChild>
                                                            <Link href={`/odps/${odp.id}/edit`}><Pencil className="h-4 w-4" /></Link>
                                                        </Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Hapus ODP?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        ODP <strong>{odp.name}</strong> akan dipindahkan ke arsip.
                                                                        Data dapat dipulihkan oleh Super Admin.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        className="bg-destructive text-white hover:bg-destructive/90"
                                                                        onClick={() => router.delete(`/odps/${odp.id}`)}
                                                                    >
                                                                        Hapus
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {odps.last_page > 1 && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                            Menampilkan {odps.from}–{odps.to} dari {odps.total} ODP
                        </span>
                        <div className="flex gap-1">
                            {odps.links.map((link, i) => (
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
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

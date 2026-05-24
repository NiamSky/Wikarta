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
import type { BreadcrumbItem, Odp, Ont } from '@/types';
import type { PaginatedData } from '@/types/pagination';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Jaringan', href: '/onts' },
    { title: 'ONT', href: '/onts' },
];

type Props = {
    onts: PaginatedData<Ont>;
    filters: { status?: string; odp_id?: string; search?: string };
    odps: Pick<Odp, 'id' | 'name' | 'code'>[];
};

const statusOptions = [
    { value: 'active', label: 'Aktif' },
    { value: 'inactive', label: 'Tidak Aktif' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'decommissioned', label: 'Dinonaktifkan' },
];

export default function OntIndex({ onts, filters, odps }: Props) {
    useFlash();

    function handleFilter(key: string, value: string) {
        router.get('/onts', { ...filters, [key]: value || undefined }, { preserveState: true, replace: true });
    }

    function handleSearch(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const search = (e.currentTarget.elements.namedItem('search') as HTMLInputElement).value;
        router.get('/onts', { ...filters, search: search || undefined }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data ONT" />
            <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">ONT</h1>
                        <p className="text-sm text-muted-foreground">
                            Optical Network Terminal — {onts.total} perangkat terdaftar
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/onts/create">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Tambah ONT
                        </Link>
                    </Button>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <Input
                            name="search"
                            defaultValue={filters.search}
                            placeholder="Cari nama, kode, serial, pelanggan..."
                            className="w-72"
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
                        value={filters.odp_id ?? 'all'}
                        onValueChange={(v) => handleFilter('odp_id', v === 'all' ? '' : v)}
                    >
                        <SelectTrigger className="w-56">
                            <SelectValue placeholder="Semua ODP" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua ODP</SelectItem>
                            {odps.map((odp) => (
                                <SelectItem key={odp.id} value={String(odp.id)}>{odp.code} — {odp.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {(filters.status || filters.odp_id || filters.search) && (
                        <Button variant="ghost" size="sm" onClick={() => router.get('/onts')}>
                            <RotateCcw className="mr-1 h-3 w-3" />
                            Reset
                        </Button>
                    )}
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama / Kode</TableHead>
                                <TableHead>Parent ODP</TableHead>
                                <TableHead>Pelanggan</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-36">Kapasitas</TableHead>
                                <TableHead>Koordinat</TableHead>
                                <TableHead className="w-28">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {onts.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                                        Tidak ada ONT yang ditemukan.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                onts.data.map((ont) => (
                                    <TableRow key={ont.id}>
                                        <TableCell>
                                            <div className="font-medium">{ont.name}</div>
                                            <div className="text-xs text-muted-foreground font-mono">{ont.code}</div>
                                            {ont.serial_number && (
                                                <div className="text-xs text-muted-foreground font-mono">SN: {ont.serial_number}</div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {ont.odp ? (
                                                <Link href={`/odps/${ont.odp.id}`} className="text-sm hover:underline">
                                                    {ont.odp.code}
                                                </Link>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {ont.customer_name ?? '—'}
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge status={ont.status} />
                                        </TableCell>
                                        <TableCell>
                                            <CapacityBar usedPorts={ont.used_ports} totalPorts={ont.total_ports} />
                                        </TableCell>
                                        <TableCell className="text-xs font-mono text-muted-foreground">
                                            {ont.latitude != null && ont.longitude != null
                                                ? `${ont.latitude}, ${ont.longitude}`
                                                : '—'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={`/onts/${ont.id}`}><Eye className="h-4 w-4" /></Link>
                                                </Button>
                                                {!ont.deleted_at && (
                                                    <>
                                                        <Button variant="ghost" size="icon" asChild>
                                                            <Link href={`/onts/${ont.id}/edit`}><Pencil className="h-4 w-4" /></Link>
                                                        </Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Hapus ONT?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        ONT <strong>{ont.name}</strong> akan dipindahkan ke arsip.
                                                                        Data dapat dipulihkan oleh Super Admin.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        className="bg-destructive text-white hover:bg-destructive/90"
                                                                        onClick={() => router.delete(`/onts/${ont.id}`)}
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

                {onts.last_page > 1 && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                            Menampilkan {onts.from}–{onts.to} dari {onts.total} ONT
                        </span>
                        <div className="flex gap-1">
                            {onts.links.map((link, i) => (
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

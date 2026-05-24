import { Head, Link, router } from '@inertiajs/react';
import { PlusCircle, Trash2, Pencil } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useFlash } from '@/hooks/use-flash';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, District } from '@/types';
import type { PaginatedData } from '@/types/pagination';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Area Geografis', href: '/geography/provinces' },
    { title: 'Kecamatan', href: '/geography/districts' },
];

export default function DistrictsIndex({ districts }: { districts: PaginatedData<District> }) {
    useFlash();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Kecamatan" />
            <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Kecamatan</h1>
                        <p className="text-sm text-muted-foreground">Kelola data kecamatan</p>
                    </div>
                    <Button asChild>
                        <Link href="/geography/districts/create">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Tambah
                        </Link>
                    </Button>
                </div>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama</TableHead>
                                <TableHead>Kota/Kab</TableHead>
                                <TableHead>Provinsi</TableHead>
                                <TableHead>Kode BPS</TableHead>
                                <TableHead className="text-right">Kelurahan</TableHead>
                                <TableHead className="w-24">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {districts.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                        Belum ada data kecamatan.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                districts.data.map((district) => (
                                    <TableRow key={district.id}>
                                        <TableCell className="font-medium">{district.name}</TableCell>
                                        <TableCell>{district.city?.name ?? '-'}</TableCell>
                                        <TableCell>{district.city?.province?.name ?? '-'}</TableCell>
                                        <TableCell className="font-mono text-sm">{district.code}</TableCell>
                                        <TableCell className="text-right">{district.villages_count ?? 0}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={`/geography/districts/${district.id}/edit`}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Hapus {district.name}?</AlertDialogTitle>
                                                            <AlertDialogDescription>Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Batal</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                className="bg-destructive text-white hover:bg-destructive/90"
                                                                onClick={() => router.delete(`/geography/districts/${district.id}`)}
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
            </div>
        </AppLayout>
    );
}

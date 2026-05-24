import { Head, Link, router } from '@inertiajs/react';
import { PlusCircle, Trash2, Pencil } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useFlash } from '@/hooks/use-flash';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, City } from '@/types';
import type { PaginatedData } from '@/types/pagination';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Area Geografis', href: '/geography/provinces' },
    { title: 'Kota/Kabupaten', href: '/geography/cities' },
];

export default function CitiesIndex({ cities }: { cities: PaginatedData<City> }) {
    useFlash();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Kota/Kabupaten" />
            <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Kota / Kabupaten</h1>
                        <p className="text-sm text-muted-foreground">Kelola data kota dan kabupaten</p>
                    </div>
                    <Button asChild>
                        <Link href="/geography/cities/create">
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
                                <TableHead>Tipe</TableHead>
                                <TableHead>Provinsi</TableHead>
                                <TableHead>Kode BPS</TableHead>
                                <TableHead className="text-right">Kecamatan</TableHead>
                                <TableHead className="w-24">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {cities.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                        Belum ada data kota/kabupaten.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                cities.data.map((city) => (
                                    <TableRow key={city.id}>
                                        <TableCell className="font-medium">{city.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize">{city.type}</Badge>
                                        </TableCell>
                                        <TableCell>{city.province?.name ?? '-'}</TableCell>
                                        <TableCell className="font-mono text-sm">{city.code}</TableCell>
                                        <TableCell className="text-right">{city.districts_count ?? 0}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={`/geography/cities/${city.id}/edit`}>
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
                                                            <AlertDialogTitle>Hapus {city.name}?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Tindakan ini tidak dapat dibatalkan.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Batal</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                className="bg-destructive text-white hover:bg-destructive/90"
                                                                onClick={() => router.delete(`/geography/cities/${city.id}`)}
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

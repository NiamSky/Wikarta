import { Head, Link, router } from '@inertiajs/react';
import { PlusCircle, Trash2, Pencil } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useFlash } from '@/hooks/use-flash';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Village } from '@/types';
import type { PaginatedData } from '@/types/pagination';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Area Geografis', href: '/geography/provinces' },
    { title: 'Kelurahan/Desa', href: '/geography/villages' },
];

export default function VillagesIndex({ villages }: { villages: PaginatedData<Village> }) {
    useFlash();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Kelurahan/Desa" />
            <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Kelurahan / Desa</h1>
                    </div>
                    <Button asChild>
                        <Link href="/geography/villages/create">
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
                                <TableHead>Kecamatan</TableHead>
                                <TableHead>Kode BPS</TableHead>
                                <TableHead>Kode Pos</TableHead>
                                <TableHead className="w-24">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {villages.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                        Belum ada data kelurahan/desa.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                villages.data.map((v) => (
                                    <TableRow key={v.id}>
                                        <TableCell className="font-medium">{v.name}</TableCell>
                                        <TableCell><Badge variant="outline" className="capitalize">{v.type}</Badge></TableCell>
                                        <TableCell>{v.district?.name ?? '-'}</TableCell>
                                        <TableCell className="font-mono text-sm">{v.code}</TableCell>
                                        <TableCell>{v.postal_code ?? '-'}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={`/geography/villages/${v.id}/edit`}><Pencil className="h-4 w-4" /></Link>
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Hapus {v.name}?</AlertDialogTitle>
                                                            <AlertDialogDescription>Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Batal</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                className="bg-destructive text-white hover:bg-destructive/90"
                                                                onClick={() => router.delete(`/geography/villages/${v.id}`)}
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

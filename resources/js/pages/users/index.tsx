import { Head, Link, router } from '@inertiajs/react';
import { PlusCircle, Trash2, Pencil, UserCheck, UserX } from 'lucide-react';
import { useState } from 'react';
import { useFlash } from '@/hooks/use-flash';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, User, Role } from '@/types';
import type { PaginatedData } from '@/types/pagination';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Pengguna', href: '/users' },
];

const roleColors: Record<string, string> = {
    super_admin: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
    admin: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200',
    teknisi: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200',
};

type Props = {
    users: PaginatedData<User>;
    roles: Role[];
    filters: { role_id?: string; search?: string };
};

export default function UsersIndex({ users, roles, filters }: Props) {
    useFlash();

    const [search, setSearch] = useState(filters.search ?? '');

    function applyFilter(params: Record<string, string>) {
        router.get('/users', { ...filters, ...params }, { preserveState: true, replace: true });
    }

    function resetFilters() {
        router.get('/users', {}, { preserveState: false });
    }

    const hasFilters = !!(filters.role_id || filters.search);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengguna" />
            <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Manajemen Pengguna</h1>
                    <Button asChild>
                        <Link href="/users/create">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Tambah Pengguna
                        </Link>
                    </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Input
                        placeholder="Cari nama atau email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && applyFilter({ search })}
                        className="w-56"
                    />
                    <Select value={filters.role_id ?? ''} onValueChange={(v) => applyFilter({ role_id: v === 'all' ? '' : v })}>
                        <SelectTrigger className="w-40"><SelectValue placeholder="Semua Peran" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Peran</SelectItem>
                            {roles.map((r) => (
                                <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>
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
                                <TableHead>Nama</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>No. HP</TableHead>
                                <TableHead>Peran</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-32">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                        Belum ada pengguna.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.data.map((user) => (
                                    <TableRow key={user.id} className={user.deleted_at ? 'opacity-50' : ''}>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                                        <TableCell className="text-sm font-mono">{user.phone ?? '—'}</TableCell>
                                        <TableCell>
                                            {user.role ? (
                                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${roleColors[user.role.slug] ?? ''}`}>
                                                    {user.role.name}
                                                </span>
                                            ) : (
                                                <Badge variant="outline">—</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {user.deleted_at ? (
                                                <Badge variant="outline" className="text-muted-foreground">Dihapus</Badge>
                                            ) : user.is_active ? (
                                                <Badge className="bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200 border-0">Aktif</Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-destructive">Nonaktif</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                {!user.deleted_at && (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            title={user.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                                            onClick={() => router.post(`/users/${user.id}/toggle-active`)}
                                                        >
                                                            {user.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                                        </Button>
                                                        <Button variant="ghost" size="icon" asChild>
                                                            <Link href={`/users/${user.id}/edit`}><Pencil className="h-4 w-4" /></Link>
                                                        </Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Hapus {user.name}?</AlertDialogTitle>
                                                                    <AlertDialogDescription>Pengguna akan dinonaktifkan (soft delete).</AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        className="bg-destructive text-white hover:bg-destructive/90"
                                                                        onClick={() => router.delete(`/users/${user.id}`)}
                                                                    >
                                                                        Hapus
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </>
                                                )}
                                                {user.deleted_at && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => router.post(`/users/${user.id}/restore`)}
                                                    >
                                                        Pulihkan
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {users.last_page > 1 && (
                    <div className="flex justify-center gap-1">
                        {users.links.map((link, i) => (
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

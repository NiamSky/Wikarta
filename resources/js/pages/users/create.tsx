import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useFlash } from '@/hooks/use-flash';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Role } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Pengguna', href: '/users' },
    { title: 'Tambah', href: '/users/create' },
];

type Props = { roles: Role[] };

export default function UsersCreate({ roles }: Props) {
    useFlash();

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role_id: '',
        phone: '',
        is_active: true,
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Pengguna" />
            <div className="p-6 max-w-md space-y-6">
                <h1 className="text-2xl font-semibold">Tambah Pengguna</h1>
                <form onSubmit={(e) => { e.preventDefault(); post('/users'); }} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nama <span className="text-destructive">*</span></Label>
                        <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                        <InputError message={errors.name} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
                        <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                        <InputError message={errors.email} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">No. HP</Label>
                        <Input id="phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} placeholder="08xxxxxxxxxx" />
                    </div>
                    <div className="space-y-2">
                        <Label>Peran</Label>
                        <Select value={data.role_id} onValueChange={(v) => setData('role_id', v)}>
                            <SelectTrigger><SelectValue placeholder="Pilih peran" /></SelectTrigger>
                            <SelectContent>
                                {roles.map((r) => (
                                    <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.role_id} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">Password <span className="text-destructive">*</span></Label>
                            <Input id="password" type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} />
                            <InputError message={errors.password} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
                            <Input id="password_confirmation" type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Switch
                            id="is_active"
                            checked={data.is_active}
                            onCheckedChange={(v) => setData('is_active', v)}
                        />
                        <Label htmlFor="is_active">Akun Aktif</Label>
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" disabled={processing}>Simpan</Button>
                        <Button variant="outline" asChild><Link href="/users">Batal</Link></Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

import { Head, Link, useForm } from '@inertiajs/react';
import { useFlash } from '@/hooks/use-flash';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Province } from '@/types';

type Props = { provinces: Province[] };

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Kota/Kab', href: '/geography/cities' },
    { title: 'Tambah', href: '/geography/cities/create' },
];

export default function CitiesCreate({ provinces }: Props) {
    useFlash();

    const { data, setData, post, processing, errors } = useForm({
        province_id: '',
        name: '',
        type: 'kota' as 'kota' | 'kabupaten',
        code: '',
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Kota/Kabupaten" />
            <div className="p-6 max-w-md space-y-6">
                <h1 className="text-2xl font-semibold">Tambah Kota / Kabupaten</h1>
                <form onSubmit={(e) => { e.preventDefault(); post('/geography/cities'); }} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Provinsi</Label>
                        <Select value={data.province_id} onValueChange={(v) => setData('province_id', v)}>
                            <SelectTrigger><SelectValue placeholder="Pilih provinsi" /></SelectTrigger>
                            <SelectContent>
                                {provinces.map((p) => (
                                    <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.province_id} />
                    </div>
                    <div className="space-y-2">
                        <Label>Tipe</Label>
                        <Select value={data.type} onValueChange={(v) => setData('type', v as 'kota' | 'kabupaten')}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="kota">Kota</SelectItem>
                                <SelectItem value="kabupaten">Kabupaten</SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={errors.type} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="name">Nama</Label>
                        <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="Contoh: Kota Bandung" />
                        <InputError message={errors.name} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="code">Kode BPS</Label>
                        <Input id="code" value={data.code} onChange={(e) => setData('code', e.target.value)} placeholder="Contoh: 3273" maxLength={10} />
                        <InputError message={errors.code} />
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" disabled={processing}>Simpan</Button>
                        <Button variant="outline" asChild><Link href="/geography/cities">Batal</Link></Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

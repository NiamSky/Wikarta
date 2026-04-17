import { Head, Link, useForm, router } from '@inertiajs/react';
import { useFlash } from '@/hooks/use-flash';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, City, Province } from '@/types';
import { useState } from 'react';

type Props = { provinces: Province[] };

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Kecamatan', href: '/geography/districts' },
    { title: 'Tambah', href: '/geography/districts/create' },
];

export default function DistrictsCreate({ provinces }: Props) {
    useFlash();

    const [cities, setCities] = useState<City[]>([]);

    const { data, setData, post, processing, errors } = useForm({
        city_id: '',
        name: '',
        code: '',
    });

    async function handleProvinceChange(provinceId: string) {
        const res = await fetch(`/api/cities/${provinceId}`);
        const data = await res.json();
        setCities(data);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Kecamatan" />
            <div className="p-6 max-w-md space-y-6">
                <h1 className="text-2xl font-semibold">Tambah Kecamatan</h1>
                <form onSubmit={(e) => { e.preventDefault(); post('/geography/districts'); }} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Provinsi</Label>
                        <Select onValueChange={handleProvinceChange}>
                            <SelectTrigger><SelectValue placeholder="Pilih provinsi" /></SelectTrigger>
                            <SelectContent>
                                {provinces.map((p) => (
                                    <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Kota / Kabupaten</Label>
                        <Select value={data.city_id} onValueChange={(v) => setData('city_id', v)}>
                            <SelectTrigger><SelectValue placeholder="Pilih kota/kabupaten" /></SelectTrigger>
                            <SelectContent>
                                {cities.map((c) => (
                                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.city_id} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="name">Nama Kecamatan</Label>
                        <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="Contoh: Coblong" />
                        <InputError message={errors.name} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="code">Kode BPS</Label>
                        <Input id="code" value={data.code} onChange={(e) => setData('code', e.target.value)} placeholder="Contoh: 3273060" maxLength={15} />
                        <InputError message={errors.code} />
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" disabled={processing}>Simpan</Button>
                        <Button variant="outline" asChild><Link href="/geography/districts">Batal</Link></Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

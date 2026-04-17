import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { useFlash } from '@/hooks/use-flash';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, City, District, Province } from '@/types';

type Props = { district: District; provinces: Province[] };

export default function DistrictsEdit({ district, provinces }: Props) {
    useFlash();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Kecamatan', href: '/geography/districts' },
        { title: `Edit: ${district.name}`, href: `/geography/districts/${district.id}/edit` },
    ];

    const [cities, setCities] = useState<City[]>(
        district.city ? [district.city as City] : []
    );

    const { data, setData, put, processing, errors } = useForm({
        city_id: String(district.city_id),
        name: district.name,
        code: district.code,
    });

    async function handleProvinceChange(provinceId: string) {
        const res = await fetch(`/api/cities/${provinceId}`);
        setCities(await res.json());
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit: ${district.name}`} />
            <div className="p-6 max-w-md space-y-6">
                <h1 className="text-2xl font-semibold">Edit Kecamatan</h1>
                <form onSubmit={(e) => { e.preventDefault(); put(`/geography/districts/${district.id}`); }} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Provinsi (untuk filter kota)</Label>
                        <Select defaultValue={String(district.city?.province?.id ?? '')} onValueChange={handleProvinceChange}>
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
                            <SelectTrigger><SelectValue placeholder="Pilih kota" /></SelectTrigger>
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
                        <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                        <InputError message={errors.name} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="code">Kode BPS</Label>
                        <Input id="code" value={data.code} onChange={(e) => setData('code', e.target.value)} maxLength={15} />
                        <InputError message={errors.code} />
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" disabled={processing}>Perbarui</Button>
                        <Button variant="outline" asChild><Link href="/geography/districts">Batal</Link></Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

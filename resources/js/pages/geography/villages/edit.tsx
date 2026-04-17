import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { useFlash } from '@/hooks/use-flash';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, City, District, Province, Village } from '@/types';

type Props = { village: Village; provinces: Province[] };

export default function VillagesEdit({ village, provinces }: Props) {
    useFlash();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Kelurahan/Desa', href: '/geography/villages' },
        { title: `Edit: ${village.name}`, href: `/geography/villages/${village.id}/edit` },
    ];

    const [cities, setCities] = useState<City[]>([]);
    const [districts, setDistricts] = useState<District[]>(
        village.district ? [village.district as District] : []
    );

    const { data, setData, put, processing, errors } = useForm({
        district_id: String(village.district_id),
        name: village.name,
        type: village.type,
        postal_code: village.postal_code ?? '',
        code: village.code,
    });

    async function handleProvinceChange(provinceId: string) {
        const res = await fetch(`/api/cities/${provinceId}`);
        setCities(await res.json());
    }

    async function handleCityChange(cityId: string) {
        const res = await fetch(`/api/districts/${cityId}`);
        setDistricts(await res.json());
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit: ${village.name}`} />
            <div className="p-6 max-w-md space-y-6">
                <h1 className="text-2xl font-semibold">Edit Kelurahan / Desa</h1>
                <form onSubmit={(e) => { e.preventDefault(); put(`/geography/villages/${village.id}`); }} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Provinsi</Label>
                        <Select onValueChange={handleProvinceChange}>
                            <SelectTrigger><SelectValue placeholder="Pilih provinsi untuk filter" /></SelectTrigger>
                            <SelectContent>
                                {provinces.map((p) => (
                                    <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Kota / Kabupaten</Label>
                        <Select onValueChange={handleCityChange} disabled={cities.length === 0}>
                            <SelectTrigger><SelectValue placeholder="Pilih kota" /></SelectTrigger>
                            <SelectContent>
                                {cities.map((c) => (
                                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Kecamatan</Label>
                        <Select value={data.district_id} onValueChange={(v) => setData('district_id', v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {districts.map((d) => (
                                    <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.district_id} />
                    </div>
                    <div className="space-y-2">
                        <Label>Tipe</Label>
                        <Select value={data.type} onValueChange={(v) => setData('type', v as 'kelurahan' | 'desa')}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="kelurahan">Kelurahan</SelectItem>
                                <SelectItem value="desa">Desa</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="name">Nama</Label>
                        <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                        <InputError message={errors.name} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="code">Kode BPS</Label>
                            <Input id="code" value={data.code} onChange={(e) => setData('code', e.target.value)} maxLength={20} />
                            <InputError message={errors.code} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="postal_code">Kode Pos</Label>
                            <Input id="postal_code" value={data.postal_code} onChange={(e) => setData('postal_code', e.target.value)} maxLength={10} />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" disabled={processing}>Perbarui</Button>
                        <Button variant="outline" asChild><Link href="/geography/villages">Batal</Link></Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

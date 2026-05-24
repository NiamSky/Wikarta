import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFlash } from '@/hooks/use-flash';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, City, Province } from '@/types';

type Props = { city: City; provinces: Province[] };

export default function CitiesEdit({ city, provinces }: Props) {
    useFlash();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Kota/Kab', href: '/geography/cities' },
        { title: `Edit: ${city.name}`, href: `/geography/cities/${city.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        province_id: String(city.province_id),
        name: city.name,
        type: city.type,
        code: city.code,
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit: ${city.name}`} />
            <div className="p-6 max-w-md space-y-6">
                <h1 className="text-2xl font-semibold">Edit Kota / Kabupaten</h1>
                <form onSubmit={(e) => { e.preventDefault(); put(`/geography/cities/${city.id}`); }} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Provinsi</Label>
                        <Select value={data.province_id} onValueChange={(v) => setData('province_id', v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
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
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="name">Nama</Label>
                        <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                        <InputError message={errors.name} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="code">Kode BPS</Label>
                        <Input id="code" value={data.code} onChange={(e) => setData('code', e.target.value)} maxLength={10} />
                        <InputError message={errors.code} />
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" disabled={processing}>Perbarui</Button>
                        <Button variant="outline" asChild><Link href="/geography/cities">Batal</Link></Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

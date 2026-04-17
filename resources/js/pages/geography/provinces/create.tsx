import { Head, Link, useForm } from '@inertiajs/react';
import { useFlash } from '@/hooks/use-flash';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Provinsi', href: '/geography/provinces' },
    { title: 'Tambah', href: '/geography/provinces/create' },
];

export default function ProvincesCreate() {
    useFlash();

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        code: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/geography/provinces');
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Provinsi" />
            <div className="p-6 max-w-md space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold">Tambah Provinsi</h1>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nama Provinsi</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Contoh: Jawa Barat"
                        />
                        <InputError message={errors.name} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="code">Kode BPS</Label>
                        <Input
                            id="code"
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value)}
                            placeholder="Contoh: 32"
                            maxLength={10}
                        />
                        <InputError message={errors.code} />
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" disabled={processing}>Simpan</Button>
                        <Button variant="outline" asChild>
                            <Link href="/geography/provinces">Batal</Link>
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

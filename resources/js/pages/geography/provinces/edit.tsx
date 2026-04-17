import { Head, Link, useForm } from '@inertiajs/react';
import { useFlash } from '@/hooks/use-flash';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Province } from '@/types';

type Props = { province: Province };

export default function ProvincesEdit({ province }: Props) {
    useFlash();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Provinsi', href: '/geography/provinces' },
        { title: `Edit: ${province.name}`, href: `/geography/provinces/${province.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: province.name,
        code: province.code,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put(`/geography/provinces/${province.id}`);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit: ${province.name}`} />
            <div className="p-6 max-w-md space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold">Edit Provinsi</h1>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nama Provinsi</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        <InputError message={errors.name} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="code">Kode BPS</Label>
                        <Input
                            id="code"
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value)}
                            maxLength={10}
                        />
                        <InputError message={errors.code} />
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" disabled={processing}>Perbarui</Button>
                        <Button variant="outline" asChild>
                            <Link href="/geography/provinces">Batal</Link>
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

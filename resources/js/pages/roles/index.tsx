import { Head } from '@inertiajs/react';
import { useFlash } from '@/hooks/use-flash';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Peran & Akses', href: '/roles' },
];

type Permission = {
    id: number;
    name: string;
    slug: string;
    module: string;
};

type RoleWithPermissions = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    users_count: number;
    permissions: Permission[];
};

type Props = {
    roles: RoleWithPermissions[];
};

const moduleLabels: Record<string, string> = {
    odp: 'ODP',
    odc: 'ODC',
    olt: 'OLT',
    'fiber-routes': 'Sambungan Device (Legacy)',
    user: 'Pengguna',
    report: 'Laporan',
    maintenance: 'Maintenance',
    geography: 'Geografi',
};

const roleColors: Record<string, string> = {
    super_admin: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200 border-red-200',
    admin: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200 border-blue-200',
    teknisi: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200 border-green-200',
};

export default function RolesIndex({ roles }: Props) {
    useFlash();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Peran & Akses" />
            <div className="p-6 space-y-6">
                <h1 className="text-2xl font-semibold">Peran & Hak Akses</h1>
                <div className="grid gap-6 md:grid-cols-3">
                    {roles.map((role) => {
                        const moduleGroups = role.permissions.reduce<Record<string, Permission[]>>(
                            (acc, perm) => {
                                if (!acc[perm.module]) acc[perm.module] = [];
                                acc[perm.module].push(perm);
                                return acc;
                            },
                            {}
                        );

                        return (
                            <Card key={role.id}>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${roleColors[role.slug] ?? ''}`}>
                                            {role.name}
                                        </span>
                                        <Badge variant="outline">{role.users_count} pengguna</Badge>
                                    </CardTitle>
                                    {role.description && (
                                        <p className="text-sm text-muted-foreground">{role.description}</p>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    {Object.keys(moduleGroups).length === 0 ? (
                                        <p className="text-sm text-muted-foreground">Semua akses</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {Object.entries(moduleGroups).map(([module, perms]) => (
                                                <div key={module}>
                                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                                                        {moduleLabels[module] ?? module}
                                                    </p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {perms.map((perm) => (
                                                            <Badge key={perm.id} variant="secondary" className="text-xs">
                                                                {perm.slug.split('.')[1] ?? perm.slug}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </AppLayout>
    );
}

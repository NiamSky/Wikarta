import { Head, Link, usePage } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import {
    ArrowRight,
    BarChart3,
    Box,
    Building2,
    CheckCircle2,
    Globe,
    History,
    Landmark,
    LayoutGrid,
    Map,
    PieChart,
    Radio,
    ShieldCheck,
    Signal,
    Users,
    Wrench,
} from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { dashboard, login, register } from '@/routes';

type AuthUser = {
    name: string;
    role?: {
        name: string;
    } | null;
};

type PageProps = {
    auth: {
        user: AuthUser | null;
    };
};

type ModuleItem = {
    title: string;
    description: string;
    href: string;
    icon: LucideIcon;
    requiresAuth?: boolean;
    badge?: string;
};

type ModuleGroup = {
    value: string;
    label: string;
    description: string;
    items: ModuleItem[];
};

const moduleGroups: ModuleGroup[] = [
    {
        value: 'network',
        label: 'Jaringan',
        description: 'Inventaris dan topologi infrastruktur fiber.',
        items: [
            {
                title: 'ODP',
                description: 'Kelola titik distribusi dan kapasitas port lapangan.',
                href: '/odps',
                icon: Signal,
                requiresAuth: true,
            },
            {
                title: 'ODC',
                description: 'Pantau kabinet distribusi dan relasi ke ODP.',
                href: '/odcs',
                icon: Box,
                requiresAuth: true,
            },
            {
                title: 'OLT',
                description: 'Kontrol node inti akses dan utilisasi uplink.',
                href: '/olts',
                icon: Radio,
                requiresAuth: true,
            },
            {
                title: 'Peta Jaringan',
                description: 'Visualisasi node dan rute secara geospasial.',
                href: '/map',
                icon: Map,
                requiresAuth: true,
            },
        ],
    },
    {
        value: 'operations',
        label: 'Operasional',
        description: 'Aktivitas teknis harian dan observabilitas lapangan.',
        items: [
            {
                title: 'Dashboard',
                description: 'Ringkasan KPI kapasitas, status, dan maintenance terbaru.',
                href: '/dashboard',
                icon: LayoutGrid,
                requiresAuth: true,
            },
            {
                title: 'Maintenance Log',
                description: 'Catat tindakan preventif, korektif, dan emergency.',
                href: '/maintenance-logs',
                icon: Wrench,
                requiresAuth: true,
            },
            {
                title: 'Activity Log',
                description: 'Lacak perubahan data penting untuk audit internal.',
                href: '/activity-logs',
                icon: History,
                requiresAuth: true,
                badge: 'Admin',
            },
        ],
    },
    {
        value: 'governance',
        label: 'Tata Kelola',
        description: 'Master data wilayah, akses pengguna, dan pelaporan.',
        items: [
            {
                title: 'Provinsi & Kota',
                description: 'Master data geografis untuk konsistensi wilayah jaringan.',
                href: '/geography/provinces',
                icon: Globe,
                requiresAuth: true,
                badge: 'Admin',
            },
            {
                title: 'Kecamatan & Desa',
                description: 'Granularitas area layanan hingga tingkat desa.',
                href: '/geography/districts',
                icon: Landmark,
                requiresAuth: true,
                badge: 'Admin',
            },
            {
                title: 'Pengguna',
                description: 'Manajemen akun operator, admin, dan teknisi.',
                href: '/users',
                icon: Users,
                requiresAuth: true,
                badge: 'Admin',
            },
            {
                title: 'Peran & Akses',
                description: 'Definisikan kontrol akses berbasis role.',
                href: '/roles',
                icon: ShieldCheck,
                requiresAuth: true,
                badge: 'Admin',
            },
            {
                title: 'Laporan Kapasitas',
                description: 'Analisis utilisasi port per wilayah.',
                href: '/reports/capacity',
                icon: BarChart3,
                requiresAuth: true,
                badge: 'Admin',
            },
            {
                title: 'Laporan Coverage',
                description: 'Pantau distribusi ODP terhadap cakupan area.',
                href: '/reports/coverage',
                icon: PieChart,
                requiresAuth: true,
                badge: 'Admin',
            },
            {
                title: 'Data Wilayah',
                description: 'Kelengkapan struktur area layanan berbasis hierarki.',
                href: '/geography/cities',
                icon: Building2,
                requiresAuth: true,
                badge: 'Admin',
            },
        ],
    },
];

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage<PageProps>().props;
    const isAuthenticated = Boolean(auth.user);

    const resolveHref = (module: ModuleItem) => {
        if (module.requiresAuth && !isAuthenticated) {
            return login();
        }

        return module.href;
    };

    return (
        <>
            <Head title="Wikarta" />

            <div className="min-h-screen bg-background text-foreground">
                <header className="border-b">
                    <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-lg border bg-card text-foreground">
                                <AppLogoIcon className="size-5 fill-current" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold">Wikarta</p>
                                <p className="text-xs text-muted-foreground">Network Operations Platform</p>
                            </div>
                        </Link>

                        <nav className="flex items-center gap-2">
                            {isAuthenticated ? (
                                <Button asChild>
                                    <Link href={dashboard()}>
                                        Masuk Dashboard
                                        <ArrowRight className="ml-1 h-4 w-4" />
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button variant="ghost" asChild>
                                        <Link href={login()}>Masuk</Link>
                                    </Button>
                                    {canRegister && (
                                        <Button asChild>
                                            <Link href={register()}>Daftar</Link>
                                        </Button>
                                    )}
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                <main>
                    <section className="relative overflow-hidden border-b">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,oklch(0.95_0.02_255)_0,transparent_42%)] dark:bg-[radial-gradient(circle_at_top_right,oklch(0.24_0.03_255)_0,transparent_42%)]" />
                        <div className="relative mx-auto w-full max-w-7xl px-6 py-14 lg:px-8 lg:py-20">
                            <div className="max-w-3xl space-y-6">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant="outline">Fiber Infrastructure</Badge>
                                    <Badge variant="outline">Operation Visibility</Badge>
                                    <Badge variant="outline">Role-based Access</Badge>
                                </div>

                                <div className="space-y-3">
                                    <h1 className="text-balance text-3xl leading-tight font-semibold tracking-tight sm:text-5xl">
                                        Satu pusat kendali untuk ODP, ODC, OLT, sambungan antar device, dan operasional lapangan.
                                    </h1>
                                    <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                                        Wikarta dirancang untuk tim NOC dan field operation agar data jaringan selalu sinkron,
                                        keputusan kapasitas lebih cepat, dan jejak aktivitas lebih terukur.
                                    </p>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-3">
                                    {[
                                        'Monitoring status node real-time',
                                        'Pemetaan topologi berbasis wilayah',
                                        'Audit trail perubahan data',
                                    ].map((highlight) => (
                                        <div key={highlight} className="rounded-lg border bg-card px-3 py-2 text-sm">
                                            <p className="flex items-start gap-2">
                                                <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                                                <span>{highlight}</span>
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-wrap gap-2 pt-1">
                                    <Button asChild>
                                        <Link href={isAuthenticated ? dashboard() : login()}>
                                            {isAuthenticated ? 'Buka Dashboard' : 'Mulai dari Login'}
                                            <ArrowRight className="ml-1 h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <Button variant="outline" asChild>
                                        <Link href={isAuthenticated ? '/map' : login()}>Lihat Peta Jaringan</Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-8 lg:py-12">
                        <div className="mb-6 flex flex-col gap-2">
                            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Jelajahi Modul Wikarta</h2>
                            <p className="text-sm text-muted-foreground">
                                Struktur modul disusun mengikuti alur kerja tim jaringan dari inventaris hingga pelaporan.
                            </p>
                        </div>

                        <Tabs defaultValue="network" className="gap-4">
                            <TabsList variant="line" className="w-full justify-start overflow-x-auto">
                                {moduleGroups.map((group) => (
                                    <TabsTrigger key={group.value} value={group.value}>
                                        {group.label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            {moduleGroups.map((group) => (
                                <TabsContent key={group.value} value={group.value}>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>{group.label}</CardTitle>
                                            <CardDescription>{group.description}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                                {group.items.map((module) => (
                                                    <Link
                                                        key={module.title}
                                                        href={resolveHref(module)}
                                                        className="group rounded-lg border bg-background p-4 transition-colors hover:bg-muted/50"
                                                    >
                                                        <div className="mb-3 flex items-start justify-between gap-2">
                                                            <div className="flex size-9 items-center justify-center rounded-md border bg-card">
                                                                <module.icon className="h-4 w-4" />
                                                            </div>
                                                            {module.badge && (
                                                                <Badge variant="outline">{module.badge}</Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-sm font-medium group-hover:text-primary">{module.title}</p>
                                                        <p className="mt-1 text-xs text-muted-foreground">{module.description}</p>
                                                    </Link>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            ))}
                        </Tabs>
                    </section>

                    <section className="mx-auto w-full max-w-7xl px-6 pb-12 lg:px-8 lg:pb-16">
                        <Card>
                            <CardHeader>
                                <CardTitle>Workflow Ringkas Tim Operasional</CardTitle>
                                <CardDescription>
                                    Alur umum pemanfaatan platform dari pemetaan hingga tindakan maintenance.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="space-y-1 rounded-lg border p-4">
                                        <p className="text-xs font-medium text-muted-foreground">01. Inventaris</p>
                                        <p className="text-sm font-medium">Input OLT, ODC, ODP, dan parent sambungannya.</p>
                                        <p className="text-xs text-muted-foreground">Pastikan relasi node dan data geografis valid.</p>
                                    </div>
                                    <div className="space-y-1 rounded-lg border p-4">
                                        <p className="text-xs font-medium text-muted-foreground">02. Monitoring</p>
                                        <p className="text-sm font-medium">Pantau status, kapasitas, dan coverage area.</p>
                                        <p className="text-xs text-muted-foreground">Gunakan dashboard dan laporan untuk prioritas tindakan.</p>
                                    </div>
                                    <div className="space-y-1 rounded-lg border p-4">
                                        <p className="text-xs font-medium text-muted-foreground">03. Operasional</p>
                                        <p className="text-sm font-medium">Catat maintenance dan telusuri audit log.</p>
                                        <p className="text-xs text-muted-foreground">Seluruh perubahan tercatat untuk kebutuhan kontrol internal.</p>
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <p className="text-sm text-muted-foreground">
                                        {isAuthenticated
                                            ? `Selamat datang kembali${auth.user?.name ? `, ${auth.user.name}` : ''}. Lanjutkan operasional dari dashboard.`
                                            : 'Masuk untuk mulai kelola data jaringan dan operasional tim Anda.'}
                                    </p>
                                    <Button asChild>
                                        <Link href={isAuthenticated ? dashboard() : login()}>
                                            {isAuthenticated ? 'Lanjut ke Dashboard' : 'Masuk Sekarang'}
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </section>
                </main>
            </div>
        </>
    );
}

import { Link, usePage } from '@inertiajs/react';
import {
    LayoutGrid, Map, Radio, Box, Signal, Router,
    Wrench, History, Globe, Building2, Landmark, Home,
    Users, ShieldCheck, BarChart3, PieChart,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroup,
    SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { dashboard } from '@/routes';
import type { Auth, NavItem } from '@/types';

type RoleSlug = 'super_admin' | 'admin' | 'teknisi';

type NavItemWithRoles = NavItem & {
    /** Roles that can see this item. Undefined = all roles. */
    roles?: RoleSlug[];
};

type NavGroup = {
    label: string;
    items: NavItemWithRoles[];
    /** Roles that can see this entire group. Undefined = all roles. */
    roles?: RoleSlug[];
};

// Items/groups without `roles` are visible to all authenticated users.
// Items/groups with `roles` are only visible to the specified roles.
const navGroups: NavGroup[] = [
    {
        label: 'Utama',
        items: [
            { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
            { title: 'Peta Jaringan', href: '/map', icon: Map },
        ],
    },
    {
        label: 'Jaringan',
        items: [
            { title: 'ODP', href: '/odps', icon: Signal },
            { title: 'ONT', href: '/onts', icon: Router },
            { title: 'ODC', href: '/odcs', icon: Box },
            { title: 'OLT', href: '/olts', icon: Radio },
        ],
    },
    {
        label: 'Operasional',
        items: [
            { title: 'Maintenance Log', href: '/maintenance-logs', icon: Wrench },
            {
                title: 'Activity Log',
                href: '/activity-logs',
                icon: History,
                roles: ['super_admin', 'admin'],
            },
        ],
    },
    {
        label: 'Area Geografis',
        roles: ['super_admin', 'admin'],
        items: [
            { title: 'Provinsi', href: '/geography/provinces', icon: Globe },
            { title: 'Kota / Kabupaten', href: '/geography/cities', icon: Building2 },
            { title: 'Kecamatan', href: '/geography/districts', icon: Landmark },
            { title: 'Kelurahan / Desa', href: '/geography/villages', icon: Home },
        ],
    },
    {
        label: 'Administrasi',
        roles: ['super_admin', 'admin'],
        items: [
            { title: 'Pengguna', href: '/users', icon: Users },
            { title: 'Peran & Akses', href: '/roles', icon: ShieldCheck },
        ],
    },
    {
        label: 'Laporan',
        roles: ['super_admin', 'admin'],
        items: [
            { title: 'Kapasitas', href: '/reports/capacity', icon: BarChart3 },
            { title: 'Coverage', href: '/reports/coverage', icon: PieChart },
        ],
    },
];

function canAccess(roles: RoleSlug[] | undefined, userRole: RoleSlug | null): boolean {
    if (!roles) return true;
    if (!userRole) return false;
    return roles.includes(userRole);
}

function NavGroupSection({ group, userRole }: { group: NavGroup; userRole: RoleSlug | null }) {
    const { isCurrentUrl } = useCurrentUrl();

    const visibleItems = group.items.filter((item) => canAccess(item.roles, userRole));
    if (visibleItems.length === 0) return null;

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarMenu>
                {visibleItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild
                            isActive={isCurrentUrl(item.href)}
                            tooltip={{ children: item.title }}
                        >
                            <Link href={item.href} prefetch>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}

export function AppSidebar() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const userRole = (auth.user?.role?.slug ?? null) as RoleSlug | null;

    const visibleGroups = navGroups.filter((group) => canAccess(group.roles, userRole));

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {visibleGroups.map((group) => (
                    <NavGroupSection key={group.label} group={group} userRole={userRole} />
                ))}
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

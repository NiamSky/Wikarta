import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatusBadgeProps = {
    status: string;
    className?: string;
};

const statusConfig: Record<string, { label: string; className: string }> = {
    active: { label: 'Aktif', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    inactive: { label: 'Tidak Aktif', className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
    full: { label: 'Port Penuh', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
    maintenance: { label: 'Maintenance', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
    damaged: { label: 'Rusak', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
    decommissioned: { label: 'Dinonaktifkan', className: 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400' },
    feeder: { label: 'Feeder', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
    distribution: { label: 'Distribusi', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
    drop: { label: 'Drop', className: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const config = statusConfig[status];

    return (
        <Badge
            variant="outline"
            className={cn('border-0 font-medium', config?.className, className)}
        >
            {config?.label ?? status}
        </Badge>
    );
}

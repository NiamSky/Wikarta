import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

type CapacityBarProps = {
    usedPorts: number;
    totalPorts: number;
    showLabel?: boolean;
    className?: string;
};

export function CapacityBar({ usedPorts, totalPorts, showLabel = true, className }: CapacityBarProps) {
    const percentage = totalPorts > 0 ? Math.round((usedPorts / totalPorts) * 100) : 0;

    const colorClass =
        percentage >= 100
            ? 'text-red-600'
            : percentage >= 80
              ? 'text-orange-600'
              : 'text-green-600';

    const progressColor =
        percentage >= 100
            ? '[&>div]:bg-red-500'
            : percentage >= 80
              ? '[&>div]:bg-orange-500'
              : '[&>div]:bg-green-500';

    return (
        <div className={cn('space-y-1', className)}>
            {showLabel && (
                <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                        {usedPorts}/{totalPorts} port
                    </span>
                    <span className={cn('font-medium', colorClass)}>
                        {percentage}%
                    </span>
                </div>
            )}
            <Progress value={percentage} className={cn('h-2', progressColor)} />
        </div>
    );
}

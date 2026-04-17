<?php

namespace App\Observers;

use App\Models\ActivityLog;
use App\Models\Odp;

class OdpObserver
{
    public function created(Odp $odp): void
    {
        ActivityLog::record(
            user: auth()->user(),
            subjectType: Odp::class,
            subjectId: $odp->id,
            event: 'created',
            newValues: $odp->toArray(),
        );
    }

    public function updated(Odp $odp): void
    {
        ActivityLog::record(
            user: auth()->user(),
            subjectType: Odp::class,
            subjectId: $odp->id,
            event: 'updated',
            oldValues: $odp->getOriginal(),
            newValues: $odp->getChanges(),
        );
    }

    public function deleted(Odp $odp): void
    {
        ActivityLog::record(
            user: auth()->user(),
            subjectType: Odp::class,
            subjectId: $odp->id,
            event: 'deleted',
        );
    }

    public function restored(Odp $odp): void
    {
        ActivityLog::record(
            user: auth()->user(),
            subjectType: Odp::class,
            subjectId: $odp->id,
            event: 'restored',
        );
    }
}

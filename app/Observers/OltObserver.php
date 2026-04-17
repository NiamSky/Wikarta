<?php

namespace App\Observers;

use App\Models\ActivityLog;
use App\Models\Olt;

class OltObserver
{
    public function created(Olt $olt): void
    {
        ActivityLog::record(auth()->user(), Olt::class, $olt->id, 'created', null, $olt->toArray());
    }

    public function updated(Olt $olt): void
    {
        ActivityLog::record(auth()->user(), Olt::class, $olt->id, 'updated', $olt->getOriginal(), $olt->getChanges());
    }

    public function deleted(Olt $olt): void
    {
        ActivityLog::record(auth()->user(), Olt::class, $olt->id, 'deleted');
    }

    public function restored(Olt $olt): void
    {
        ActivityLog::record(auth()->user(), Olt::class, $olt->id, 'restored');
    }
}

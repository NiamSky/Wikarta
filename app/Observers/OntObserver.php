<?php

namespace App\Observers;

use App\Models\ActivityLog;
use App\Models\Ont;

class OntObserver
{
    public function created(Ont $ont): void
    {
        ActivityLog::record(auth()->user(), Ont::class, $ont->id, 'created', null, $ont->toArray());
    }

    public function updated(Ont $ont): void
    {
        ActivityLog::record(auth()->user(), Ont::class, $ont->id, 'updated', $ont->getOriginal(), $ont->getChanges());
    }

    public function deleted(Ont $ont): void
    {
        ActivityLog::record(auth()->user(), Ont::class, $ont->id, 'deleted');
    }

    public function restored(Ont $ont): void
    {
        ActivityLog::record(auth()->user(), Ont::class, $ont->id, 'restored');
    }
}

<?php

namespace App\Observers;

use App\Models\ActivityLog;
use App\Models\Odc;

class OdcObserver
{
    public function created(Odc $odc): void
    {
        ActivityLog::record(auth()->user(), Odc::class, $odc->id, 'created', null, $odc->toArray());
    }

    public function updated(Odc $odc): void
    {
        ActivityLog::record(auth()->user(), Odc::class, $odc->id, 'updated', $odc->getOriginal(), $odc->getChanges());
    }

    public function deleted(Odc $odc): void
    {
        ActivityLog::record(auth()->user(), Odc::class, $odc->id, 'deleted');
    }

    public function restored(Odc $odc): void
    {
        ActivityLog::record(auth()->user(), Odc::class, $odc->id, 'restored');
    }
}

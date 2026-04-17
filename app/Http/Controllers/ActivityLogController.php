<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    public function index(Request $request): Response
    {
        $logs = ActivityLog::query()
            ->with('user:id,name')
            ->when($request->event, fn ($q, $v) => $q->where('event', $v))
            ->when($request->subject_type, fn ($q, $v) => $q->where('subject_type', 'like', "%{$v}"))
            ->latest()
            ->paginate(30)
            ->withQueryString();

        return Inertia::render('activity-logs/index', [
            'logs' => $logs,
            'filters' => $request->only(['event', 'subject_type']),
        ]);
    }
}

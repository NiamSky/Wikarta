<?php

namespace App\Http\Controllers;

use App\Models\MaintenanceLog;
use App\Models\Odc;
use App\Models\Odp;
use App\Models\Olt;
use App\Models\Ont;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MaintenanceLogController extends Controller
{
    public function index(Request $request): Response
    {
        $logs = MaintenanceLog::query()
            ->with(['technician:id,name'])
            ->when($request->type, fn ($q, $v) => $q->where('type', $v))
            ->when($request->loggable_type, fn ($q, $v) => $q->where(
                'loggable_type',
                match ($v) {
                    'odp' => Odp::class,
                    'odc' => Odc::class,
                    'olt' => Olt::class,
                    'ont' => Ont::class,
                    default => $v,
                }
            ))
            ->latest('performed_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('maintenance-logs/index', [
            'logs' => $logs,
            'filters' => $request->only(['type', 'loggable_type']),
        ]);
    }

    public function store(Request $request, string $loggableType, int $loggableId): RedirectResponse
    {
        $request->validate([
            'type' => ['required', 'in:routine,corrective,emergency,upgrade'],
            'description' => ['required', 'string', 'max:2000'],
            'findings' => ['nullable', 'string', 'max:2000'],
            'resolution' => ['nullable', 'string', 'max:2000'],
            'performed_at' => ['required', 'date'],
            'next_maintenance_at' => ['nullable', 'date', 'after:performed_at'],
        ]);

        $modelClass = match ($loggableType) {
            'odps' => Odp::class,
            'odcs' => Odc::class,
            'olts' => Olt::class,
            'onts' => Ont::class,
            default => abort(404),
        };

        $model = $modelClass::findOrFail($loggableId);

        $model->maintenanceLogs()->create([
            ...$request->only(['type', 'description', 'findings', 'resolution', 'performed_at', 'next_maintenance_at']),
            'performed_by' => auth()->id(),
        ]);

        return back()->with('success', 'Catatan maintenance berhasil disimpan.');
    }
}

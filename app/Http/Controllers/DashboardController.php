<?php

namespace App\Http\Controllers;

use App\Models\MaintenanceLog;
use App\Models\Odc;
use App\Models\Odp;
use App\Models\Olt;
use App\Models\Ont;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        // ODP stats
        $odpStats = Odp::selectRaw('status, count(*) as count')->groupBy('status')->pluck('count', 'status');
        $odpTotal = $odpStats->sum();
        $odpNearCapacity = Odp::nearCapacity(80)->count();

        // ODC stats
        $odcTotal = Odc::count();
        $odcActive = Odc::active()->count();

        // OLT stats
        $oltTotal = Olt::count();
        $oltActive = Olt::where('status', 'active')->count();

        // Device connections
        $oltToOdc = Odc::whereNotNull('olt_id')->count();
        $odcToOdp = Odp::whereNotNull('odc_id')->count();
        $odpToOnt = Ont::whereNotNull('odp_id')->count();

        $connectionTotal = $oltToOdc + $odcToOdp + $odpToOnt;

        // Recent maintenance logs
        $recentMaintenance = MaintenanceLog::query()
            ->with('technician:id,name')
            ->latest('performed_at')
            ->limit(5)
            ->get();

        // Near-capacity ODPs (top 5)
        $nearCapacityOdps = Odp::nearCapacity(80)
            ->with('district:id,name')
            ->orderByRaw('used_ports / total_ports DESC')
            ->limit(5)
            ->get(['id', 'name', 'code', 'status', 'total_ports', 'used_ports', 'district_id']);

        return Inertia::render('dashboard', [
            'stats' => [
                'odp' => [
                    'total' => $odpTotal,
                    'near_capacity' => $odpNearCapacity,
                    'by_status' => $odpStats,
                ],
                'odc' => ['total' => $odcTotal, 'active' => $odcActive],
                'olt' => ['total' => $oltTotal, 'active' => $oltActive],
                'connections' => [
                    'total' => $connectionTotal,
                    'olt_to_odc' => $oltToOdc,
                    'odc_to_odp' => $odcToOdp,
                    'odp_to_ont' => $odpToOnt,
                ],
            ],
            'recentMaintenance' => $recentMaintenance,
            'nearCapacityOdps' => $nearCapacityOdps,
        ]);
    }
}

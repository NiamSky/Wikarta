<?php

namespace App\Http\Controllers;

use App\Models\City;
use App\Models\District;
use App\Models\Odp;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function capacity(Request $request): Response
    {
        $groupBy = $request->input('group_by', 'district');

        if ($groupBy === 'city') {
            $data = Odp::query()
                ->select('city_id', DB::raw('count(*) as total_odp'), DB::raw('sum(total_ports) as total_ports'), DB::raw('sum(used_ports) as used_ports'))
                ->with('city:id,name')
                ->groupBy('city_id')
                ->orderByDesc('used_ports')
                ->get()
                ->map(fn ($row) => [
                    'name' => $row->city?->name ?? 'Tidak diketahui',
                    'total_odp' => $row->total_odp,
                    'total_ports' => $row->total_ports,
                    'used_ports' => $row->used_ports,
                    'available_ports' => $row->total_ports - $row->used_ports,
                    'utilization_pct' => $row->total_ports > 0 ? round($row->used_ports / $row->total_ports * 100, 1) : 0,
                ]);
        } else {
            $data = Odp::query()
                ->select('district_id', DB::raw('count(*) as total_odp'), DB::raw('sum(total_ports) as total_ports'), DB::raw('sum(used_ports) as used_ports'))
                ->with('district:id,name')
                ->groupBy('district_id')
                ->orderByDesc('used_ports')
                ->get()
                ->map(fn ($row) => [
                    'name' => $row->district?->name ?? 'Tidak diketahui',
                    'total_odp' => $row->total_odp,
                    'total_ports' => $row->total_ports,
                    'used_ports' => $row->used_ports,
                    'available_ports' => $row->total_ports - $row->used_ports,
                    'utilization_pct' => $row->total_ports > 0 ? round($row->used_ports / $row->total_ports * 100, 1) : 0,
                ]);
        }

        return Inertia::render('reports/capacity', [
            'data' => $data,
            'group_by' => $groupBy,
        ]);
    }

    public function coverage(Request $request): Response
    {
        $coverageByDistrict = Odp::query()
            ->select('district_id', DB::raw('count(*) as odp_count'), DB::raw('sum(total_ports) as total_ports'), DB::raw('sum(used_ports) as used_ports'))
            ->with('district.city:id,name')
            ->groupBy('district_id')
            ->orderByDesc('odp_count')
            ->get()
            ->map(fn ($row) => [
                'district' => $row->district?->name ?? '—',
                'city' => $row->district?->city?->name ?? '—',
                'odp_count' => $row->odp_count,
                'total_ports' => $row->total_ports,
                'used_ports' => $row->used_ports,
                'utilization_pct' => $row->total_ports > 0 ? round($row->used_ports / $row->total_ports * 100, 1) : 0,
            ]);

        return Inertia::render('reports/coverage', [
            'coverage' => $coverageByDistrict,
        ]);
    }
}

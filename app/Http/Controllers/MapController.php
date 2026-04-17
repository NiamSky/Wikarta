<?php

namespace App\Http\Controllers;

use App\Http\Resources\OdcResource;
use App\Http\Resources\OdpResource;
use App\Http\Resources\OltResource;
use App\Http\Resources\OntResource;
use App\Models\Odc;
use App\Models\Odp;
use App\Models\Olt;
use App\Models\Ont;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MapController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('map/index');
    }

    public function data(Request $request): JsonResponse
    {
        $showOlts = $request->boolean('show_olts', true);
        $showOdcs = $request->boolean('show_odcs', true);
        $showOdps = $request->boolean('show_odps', true);
        $showOnts = $request->boolean('show_onts', true);
        $showConnections = $request->boolean('show_connections', true);
        $statusFilter = $request->input('status');
        $cityId = $request->input('city_id');

        $data = [];

        if ($showOlts) {
            $data['olts'] = OltResource::collection(
                Olt::query()
                    ->whereNotNull('latitude')
                    ->whereNotNull('longitude')
                    ->when($statusFilter, fn ($q, $v) => $q->where('status', $v))
                    ->when($cityId, fn ($q, $v) => $q->where('city_id', $v))
                    ->with('city')
                    ->withCount(['odcs as connected_odcs_count'])
                    ->get()
            );
        }

        if ($showOdcs) {
            $data['odcs'] = OdcResource::collection(
                Odc::query()
                    ->whereNotNull('latitude')
                    ->whereNotNull('longitude')
                    ->when($statusFilter, fn ($q, $v) => $q->where('status', $v))
                    ->when($cityId, fn ($q, $v) => $q->where('city_id', $v))
                    ->with(['olt', 'city'])
                    ->withCount(['odps as connected_odps_count'])
                    ->get()
            );
        }

        if ($showOdps) {
            $data['odps'] = OdpResource::collection(
                Odp::query()
                    ->whereNotNull('latitude')
                    ->whereNotNull('longitude')
                    ->when($statusFilter, fn ($q, $v) => $q->where('status', $v))
                    ->when($cityId, fn ($q, $v) => $q->where('city_id', $v))
                    ->with(['odc', 'city', 'district'])
                    ->get()
            );
        }

        if ($showOnts) {
            $data['onts'] = OntResource::collection(
                Ont::query()
                    ->whereNotNull('latitude')
                    ->whereNotNull('longitude')
                    ->when($statusFilter, fn ($q, $v) => $q->where('status', $v))
                    ->when($cityId, fn ($q, $v) => $q->whereHas('odp', fn ($query) => $query->where('city_id', $v)))
                    ->with(['odp:id,name,code'])
                    ->get()
            );
        }

        if ($showConnections) {
            $data['connections'] = $this->buildConnections();
        }

        return response()->json($data);
    }

    private function buildConnections(): array
    {
        $connections = [];

        $odcs = Odc::query()
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->with(['olt:id,name,latitude,longitude'])
            ->get(['id', 'name', 'olt_id', 'latitude', 'longitude']);

        foreach ($odcs as $odc) {
            if (! $odc->olt || ! $this->hasCoordinates($odc->olt->latitude, $odc->olt->longitude)) {
                continue;
            }

            $connections[] = [
                'id' => "olt-odc-{$odc->olt->id}-{$odc->id}",
                'type' => 'olt_to_odc',
                'color' => '#a855f7',
                'from' => ['type' => 'olt', 'id' => $odc->olt->id, 'name' => $odc->olt->name],
                'to' => ['type' => 'odc', 'id' => $odc->id, 'name' => $odc->name],
                'positions' => [
                    [(float) $odc->olt->latitude, (float) $odc->olt->longitude],
                    [(float) $odc->latitude, (float) $odc->longitude],
                ],
            ];
        }

        $odps = Odp::query()
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->with(['odc:id,name,latitude,longitude'])
            ->get(['id', 'name', 'odc_id', 'latitude', 'longitude']);

        foreach ($odps as $odp) {
            if (! $odp->odc || ! $this->hasCoordinates($odp->odc->latitude, $odp->odc->longitude)) {
                continue;
            }

            $connections[] = [
                'id' => "odc-odp-{$odp->odc->id}-{$odp->id}",
                'type' => 'odc_to_odp',
                'color' => '#22c55e',
                'from' => ['type' => 'odc', 'id' => $odp->odc->id, 'name' => $odp->odc->name],
                'to' => ['type' => 'odp', 'id' => $odp->id, 'name' => $odp->name],
                'positions' => [
                    [(float) $odp->odc->latitude, (float) $odp->odc->longitude],
                    [(float) $odp->latitude, (float) $odp->longitude],
                ],
            ];
        }

        $onts = Ont::query()
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->with(['odp:id,name,latitude,longitude'])
            ->get(['id', 'name', 'odp_id', 'latitude', 'longitude']);

        foreach ($onts as $ont) {
            if (! $ont->odp || ! $this->hasCoordinates($ont->odp->latitude, $ont->odp->longitude)) {
                continue;
            }

            $connections[] = [
                'id' => "odp-ont-{$ont->odp->id}-{$ont->id}",
                'type' => 'odp_to_ont',
                'color' => '#06b6d4',
                'from' => ['type' => 'odp', 'id' => $ont->odp->id, 'name' => $ont->odp->name],
                'to' => ['type' => 'ont', 'id' => $ont->id, 'name' => $ont->name],
                'positions' => [
                    [(float) $ont->odp->latitude, (float) $ont->odp->longitude],
                    [(float) $ont->latitude, (float) $ont->longitude],
                ],
            ];
        }

        return $connections;
    }

    private function hasCoordinates(mixed $latitude, mixed $longitude): bool
    {
        return $latitude !== null && $longitude !== null;
    }
}

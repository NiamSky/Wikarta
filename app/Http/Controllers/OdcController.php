<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOdcRequest;
use App\Http\Requests\UpdateOdcRequest;
use App\Http\Resources\OdcResource;
use App\Models\City;
use App\Models\Odc;
use App\Models\Olt;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OdcController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Odc::class);

        $odcs = Odc::query()
            ->with(['olt', 'city', 'district'])
            ->withCount(['odps as connected_odps_count'])
            ->when($request->status, fn ($q, $v) => $q->where('status', $v))
            ->when($request->olt_id, fn ($q, $v) => $q->where('olt_id', $v))
            ->when($request->city_id, fn ($q, $v) => $q->where('city_id', $v))
            ->when($request->search, fn ($q, $v) => $q->where(function ($q) use ($v) {
                $q->where('name', 'like', "%{$v}%")->orWhere('code', 'like', "%{$v}%");
            }))
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('odc/index', [
            'odcs' => OdcResource::collection($odcs),
            'filters' => $request->only(['status', 'olt_id', 'city_id', 'search']),
            'olts' => Olt::orderBy('name')->get(['id', 'name', 'code']),
            'cities' => City::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Odc::class);

        return Inertia::render('odc/create', [
            'olts' => Olt::orderBy('name')->get(['id', 'name', 'code', 'latitude', 'longitude']),
            'cities' => City::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(StoreOdcRequest $request): RedirectResponse
    {
        $odc = Odc::create([
            ...$request->validated(),
            'created_by' => auth()->id(),
            'updated_by' => auth()->id(),
        ]);

        return to_route('odcs.show', $odc)->with('success', 'ODC berhasil ditambahkan.');
    }

    public function show(Odc $odc): Response
    {
        $this->authorize('view', $odc);

        $odc->load(['olt', 'city', 'district', 'village', 'odps']);

        return Inertia::render('odc/show', [
            'odc' => (new OdcResource($odc))->resolve(),
            'maintenanceLogs' => $odc->maintenanceLogs()
                ->with('technician:id,name')
                ->latest('performed_at')
                ->limit(10)
                ->get(),
        ]);
    }

    public function edit(Odc $odc): Response
    {
        $this->authorize('update', $odc);

        return Inertia::render('odc/edit', [
            'odc' => (new OdcResource($odc->load(['olt', 'city', 'district', 'village'])))->resolve(),
            'olts' => Olt::orderBy('name')->get(['id', 'name', 'code', 'latitude', 'longitude']),
            'cities' => City::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(UpdateOdcRequest $request, Odc $odc): RedirectResponse
    {
        $odc->update([
            ...$request->validated(),
            'updated_by' => auth()->id(),
        ]);

        return to_route('odcs.show', $odc)->with('success', 'ODC berhasil diperbarui.');
    }

    public function destroy(Odc $odc): RedirectResponse
    {
        $this->authorize('delete', $odc);

        $odc->delete();

        return to_route('odcs.index')->with('success', 'ODC berhasil dihapus.');
    }

    public function restore(int $id): RedirectResponse
    {
        $odc = Odc::withTrashed()->findOrFail($id);
        $this->authorize('restore', $odc);

        $odc->restore();

        return to_route('odcs.index')->with('success', 'ODC berhasil dipulihkan.');
    }
}

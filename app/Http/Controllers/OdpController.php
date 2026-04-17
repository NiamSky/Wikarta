<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOdpRequest;
use App\Http\Requests\UpdateOdpRequest;
use App\Http\Resources\OdpResource;
use App\Models\City;
use App\Models\District;
use App\Models\Odc;
use App\Models\Odp;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OdpController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Odp::class);

        $odps = Odp::query()
            ->with(['odc', 'city', 'district', 'village'])
            ->when($request->status, fn ($q, $v) => $q->where('status', $v))
            ->when($request->odc_id, fn ($q, $v) => $q->where('odc_id', $v))
            ->when($request->city_id, fn ($q, $v) => $q->where('city_id', $v))
            ->when($request->district_id, fn ($q, $v) => $q->where('district_id', $v))
            ->when($request->search, fn ($q, $v) => $q->where(function ($q) use ($v) {
                $q->where('name', 'like', "%{$v}%")
                    ->orWhere('code', 'like', "%{$v}%")
                    ->orWhere('pole_number', 'like', "%{$v}%");
            }))
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('odp/index', [
            'odps' => OdpResource::collection($odps),
            'filters' => $request->only(['status', 'odc_id', 'city_id', 'district_id', 'search']),
            'cities' => City::orderBy('name')->get(['id', 'name']),
            'districts' => $request->city_id
                ? District::where('city_id', $request->city_id)->orderBy('name')->get(['id', 'name'])
                : [],
            'odcs' => Odc::orderBy('name')->get(['id', 'name', 'code']),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Odp::class);

        return Inertia::render('odp/create', [
            'odcs' => Odc::orderBy('name')->get(['id', 'name', 'code', 'latitude', 'longitude']),
            'cities' => City::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(StoreOdpRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $validated['olt_id'] = Odc::query()->whereKey($validated['odc_id'])->value('olt_id');

        $odp = Odp::create([
            ...$validated,
            'created_by' => auth()->id(),
            'updated_by' => auth()->id(),
        ]);

        return to_route('odps.show', $odp)->with('success', 'ODP berhasil ditambahkan.');
    }

    public function show(Odp $odp): Response
    {
        $this->authorize('view', $odp);

        $odp->load([
            'odc.olt',
            'city',
            'district',
            'village',
            'createdBy',
            'onts' => fn ($q) => $q->orderBy('name'),
        ]);

        return Inertia::render('odp/show', [
            'odp' => (new OdpResource($odp))->resolve(),
            'maintenanceLogs' => $odp->maintenanceLogs()
                ->with('technician:id,name')
                ->latest('performed_at')
                ->limit(10)
                ->get(),
        ]);
    }

    public function edit(Odp $odp): Response
    {
        $this->authorize('update', $odp);

        return Inertia::render('odp/edit', [
            'odp' => (new OdpResource($odp->load(['odc', 'city', 'district', 'village'])))->resolve(),
            'odcs' => Odc::orderBy('name')->get(['id', 'name', 'code', 'latitude', 'longitude']),
            'cities' => City::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(UpdateOdpRequest $request, Odp $odp): RedirectResponse
    {
        $validated = $request->validated();
        $validated['olt_id'] = Odc::query()->whereKey($validated['odc_id'])->value('olt_id');

        $odp->update([
            ...$validated,
            'updated_by' => auth()->id(),
        ]);

        return to_route('odps.show', $odp)->with('success', 'ODP berhasil diperbarui.');
    }

    public function destroy(Odp $odp): RedirectResponse
    {
        $this->authorize('delete', $odp);

        $odp->delete();

        return to_route('odps.index')->with('success', 'ODP berhasil dihapus.');
    }

    public function restore(int $id): RedirectResponse
    {
        $odp = Odp::withTrashed()->findOrFail($id);
        $this->authorize('restore', $odp);

        $odp->restore();

        return to_route('odps.index')->with('success', 'ODP berhasil dipulihkan.');
    }
}

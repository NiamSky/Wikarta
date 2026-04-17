<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOltRequest;
use App\Http\Requests\UpdateOltRequest;
use App\Http\Resources\OltResource;
use App\Models\City;
use App\Models\Olt;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OltController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Olt::class);

        $olts = Olt::query()
            ->with(['city', 'district'])
            ->withCount(['odcs as connected_odcs_count'])
            ->when($request->status, fn ($q, $v) => $q->where('status', $v))
            ->when($request->city_id, fn ($q, $v) => $q->where('city_id', $v))
            ->when($request->search, fn ($q, $v) => $q->where(function ($q) use ($v) {
                $q->where('name', 'like', "%{$v}%")->orWhere('code', 'like', "%{$v}%");
            }))
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('olt/index', [
            'olts' => OltResource::collection($olts),
            'filters' => $request->only(['status', 'city_id', 'search']),
            'cities' => City::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Olt::class);

        return Inertia::render('olt/create', [
            'cities' => City::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(StoreOltRequest $request): RedirectResponse
    {
        $olt = Olt::create([
            ...$request->validated(),
            'parent_olt_id' => null,
            'created_by' => auth()->id(),
            'updated_by' => auth()->id(),
        ]);

        return to_route('olts.show', $olt)->with('success', 'OLT berhasil ditambahkan.');
    }

    public function show(Olt $olt): Response
    {
        $this->authorize('view', $olt);

        $olt->load([
            'city',
            'district',
            'village',
            'odcs' => fn ($q) => $q->withCount('odps'),
        ]);

        $olt->loadCount(['odcs as connected_odcs_count']);

        return Inertia::render('olt/show', [
            'olt' => (new OltResource($olt))->resolve(),
            'maintenanceLogs' => $olt->maintenanceLogs()
                ->with('technician:id,name')
                ->latest('performed_at')
                ->limit(10)
                ->get(),
        ]);
    }

    public function edit(Olt $olt): Response
    {
        $this->authorize('update', $olt);

        return Inertia::render('olt/edit', [
            'olt' => (new OltResource(
                $olt
                    ->load(['city', 'district', 'village'])
                    ->loadCount(['odcs as connected_odcs_count'])
            ))->resolve(),
            'cities' => City::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(UpdateOltRequest $request, Olt $olt): RedirectResponse
    {
        $olt->update([
            ...$request->validated(),
            'parent_olt_id' => null,
            'updated_by' => auth()->id(),
        ]);

        return to_route('olts.show', $olt)->with('success', 'OLT berhasil diperbarui.');
    }

    public function destroy(Olt $olt): RedirectResponse
    {
        $this->authorize('delete', $olt);

        $olt->delete();

        return to_route('olts.index')->with('success', 'OLT berhasil dihapus.');
    }

    public function restore(int $id): RedirectResponse
    {
        $olt = Olt::withTrashed()->findOrFail($id);
        $this->authorize('restore', $olt);

        $olt->restore();

        return to_route('olts.index')->with('success', 'OLT berhasil dipulihkan.');
    }
}

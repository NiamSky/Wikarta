<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOntRequest;
use App\Http\Requests\UpdateOntRequest;
use App\Http\Resources\OntResource;
use App\Models\Odp;
use App\Models\Ont;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OntController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Ont::class);

        $onts = Ont::query()
            ->with('odp')
            ->when($request->status, fn ($q, $v) => $q->where('status', $v))
            ->when($request->odp_id, fn ($q, $v) => $q->where('odp_id', $v))
            ->when($request->search, fn ($q, $v) => $q->where(function ($q) use ($v) {
                $q->where('name', 'like', "%{$v}%")
                    ->orWhere('code', 'like', "%{$v}%")
                    ->orWhere('serial_number', 'like', "%{$v}%")
                    ->orWhere('customer_name', 'like', "%{$v}%");
            }))
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('ont/index', [
            'onts' => OntResource::collection($onts),
            'filters' => $request->only(['status', 'odp_id', 'search']),
            'odps' => Odp::orderBy('name')->get(['id', 'name', 'code', 'latitude', 'longitude']),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Ont::class);

        return Inertia::render('ont/create', [
            'odps' => Odp::orderBy('name')->get(['id', 'name', 'code', 'latitude', 'longitude']),
        ]);
    }

    public function store(StoreOntRequest $request): RedirectResponse
    {
        $ont = Ont::create([
            ...$request->validated(),
            'created_by' => auth()->id(),
            'updated_by' => auth()->id(),
        ]);

        return to_route('onts.show', $ont)->with('success', 'ONT berhasil ditambahkan.');
    }

    public function show(Ont $ont): Response
    {
        $this->authorize('view', $ont);

        $ont->load(['odp']);

        return Inertia::render('ont/show', [
            'ont' => (new OntResource($ont))->resolve(),
            'maintenanceLogs' => $ont->maintenanceLogs()
                ->with('technician:id,name')
                ->latest('performed_at')
                ->limit(10)
                ->get(),
        ]);
    }

    public function edit(Ont $ont): Response
    {
        $this->authorize('update', $ont);

        return Inertia::render('ont/edit', [
            'ont' => (new OntResource($ont->load(['odp'])))->resolve(),
            'odps' => Odp::orderBy('name')->get(['id', 'name', 'code', 'latitude', 'longitude']),
        ]);
    }

    public function update(UpdateOntRequest $request, Ont $ont): RedirectResponse
    {
        $ont->update([
            ...$request->validated(),
            'updated_by' => auth()->id(),
        ]);

        return to_route('onts.show', $ont)->with('success', 'ONT berhasil diperbarui.');
    }

    public function destroy(Ont $ont): RedirectResponse
    {
        $this->authorize('delete', $ont);

        $ont->delete();

        return to_route('onts.index')->with('success', 'ONT berhasil dihapus.');
    }

    public function restore(int $id): RedirectResponse
    {
        $ont = Ont::withTrashed()->findOrFail($id);
        $this->authorize('restore', $ont);

        $ont->restore();

        return to_route('onts.index')->with('success', 'ONT berhasil dipulihkan.');
    }
}

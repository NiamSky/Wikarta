<?php

namespace App\Http\Controllers\Geography;

use App\Http\Controllers\Controller;
use App\Http\Requests\Geography\StoreVillageRequest;
use App\Http\Requests\Geography\UpdateVillageRequest;
use App\Models\District;
use App\Models\Province;
use App\Models\Village;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class VillageController extends Controller
{
    public function index(): Response
    {
        $villages = Village::with('district.city.province')
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('geography/villages/index', [
            'villages' => $villages,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('geography/villages/create', [
            'provinces' => Province::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(StoreVillageRequest $request): RedirectResponse
    {
        Village::create($request->validated());

        return to_route('villages.index')->with('success', 'Kelurahan/Desa berhasil ditambahkan.');
    }

    public function edit(Village $village): Response
    {
        return Inertia::render('geography/villages/edit', [
            'village' => $village->load('district.city.province'),
            'provinces' => Province::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(UpdateVillageRequest $request, Village $village): RedirectResponse
    {
        $village->update($request->validated());

        return to_route('villages.index')->with('success', 'Kelurahan/Desa berhasil diperbarui.');
    }

    public function destroy(Village $village): RedirectResponse
    {
        $village->delete();

        return to_route('villages.index')->with('success', 'Kelurahan/Desa berhasil dihapus.');
    }

    public function byDistrict(District $district): JsonResponse
    {
        return response()->json(
            $district->villages()->orderBy('name')->get(['id', 'name', 'type'])
        );
    }
}

<?php

namespace App\Http\Controllers\Geography;

use App\Http\Controllers\Controller;
use App\Http\Requests\Geography\StoreDistrictRequest;
use App\Http\Requests\Geography\UpdateDistrictRequest;
use App\Models\City;
use App\Models\District;
use App\Models\Province;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class DistrictController extends Controller
{
    public function index(): Response
    {
        $districts = District::with('city.province')
            ->orderBy('name')
            ->withCount('villages')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('geography/districts/index', [
            'districts' => $districts,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('geography/districts/create', [
            'provinces' => Province::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(StoreDistrictRequest $request): RedirectResponse
    {
        District::create($request->validated());

        return to_route('districts.index')->with('success', 'Kecamatan berhasil ditambahkan.');
    }

    public function edit(District $district): Response
    {
        return Inertia::render('geography/districts/edit', [
            'district' => $district->load('city.province'),
            'provinces' => Province::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(UpdateDistrictRequest $request, District $district): RedirectResponse
    {
        $district->update($request->validated());

        return to_route('districts.index')->with('success', 'Kecamatan berhasil diperbarui.');
    }

    public function destroy(District $district): RedirectResponse
    {
        $district->delete();

        return to_route('districts.index')->with('success', 'Kecamatan berhasil dihapus.');
    }

    public function byCity(City $city): JsonResponse
    {
        return response()->json(
            $city->districts()->orderBy('name')->get(['id', 'name'])
        );
    }
}

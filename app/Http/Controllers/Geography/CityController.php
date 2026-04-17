<?php

namespace App\Http\Controllers\Geography;

use App\Http\Controllers\Controller;
use App\Http\Requests\Geography\StoreCityRequest;
use App\Http\Requests\Geography\UpdateCityRequest;
use App\Models\City;
use App\Models\Province;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CityController extends Controller
{
    public function index(): Response
    {
        $cities = City::with('province')
            ->orderBy('name')
            ->withCount('districts')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('geography/cities/index', [
            'cities' => $cities,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('geography/cities/create', [
            'provinces' => Province::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(StoreCityRequest $request): RedirectResponse
    {
        City::create($request->validated());

        return to_route('cities.index')->with('success', 'Kota/Kabupaten berhasil ditambahkan.');
    }

    public function edit(City $city): Response
    {
        return Inertia::render('geography/cities/edit', [
            'city' => $city->load('province'),
            'provinces' => Province::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(UpdateCityRequest $request, City $city): RedirectResponse
    {
        $city->update($request->validated());

        return to_route('cities.index')->with('success', 'Kota/Kabupaten berhasil diperbarui.');
    }

    public function destroy(City $city): RedirectResponse
    {
        $city->delete();

        return to_route('cities.index')->with('success', 'Kota/Kabupaten berhasil dihapus.');
    }

    public function byProvince(Province $province): JsonResponse
    {
        return response()->json(
            $province->cities()->orderBy('name')->get(['id', 'name', 'type'])
        );
    }
}

<?php

namespace App\Http\Controllers\Geography;

use App\Http\Controllers\Controller;
use App\Http\Requests\Geography\StoreProvinceRequest;
use App\Http\Requests\Geography\UpdateProvinceRequest;
use App\Models\Province;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ProvinceController extends Controller
{
    public function index(): Response
    {
        $provinces = Province::orderBy('name')
            ->withCount('cities')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('geography/provinces/index', [
            'provinces' => $provinces,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('geography/provinces/create');
    }

    public function store(StoreProvinceRequest $request): RedirectResponse
    {
        Province::create($request->validated());

        return to_route('provinces.index')->with('success', 'Provinsi berhasil ditambahkan.');
    }

    public function edit(Province $province): Response
    {
        return Inertia::render('geography/provinces/edit', [
            'province' => $province,
        ]);
    }

    public function update(UpdateProvinceRequest $request, Province $province): RedirectResponse
    {
        $province->update($request->validated());

        return to_route('provinces.index')->with('success', 'Provinsi berhasil diperbarui.');
    }

    public function destroy(Province $province): RedirectResponse
    {
        $province->delete();

        return to_route('provinces.index')->with('success', 'Provinsi berhasil dihapus.');
    }
}

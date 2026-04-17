<?php

use App\Http\Controllers\Geography\CityController;
use App\Http\Controllers\Geography\DistrictController;
use App\Http\Controllers\Geography\ProvinceController;
use App\Http\Controllers\Geography\VillageController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('geography/provinces', ProvinceController::class)
        ->names('provinces')
        ->except(['show']);

    Route::resource('geography/cities', CityController::class)
        ->names('cities')
        ->except(['show']);

    Route::resource('geography/districts', DistrictController::class)
        ->names('districts')
        ->except(['show']);

    Route::resource('geography/villages', VillageController::class)
        ->names('villages')
        ->except(['show']);

    // Cascading dropdown JSON endpoints
    Route::get('api/cities/{province}', [CityController::class, 'byProvince'])
        ->name('api.cities');
    Route::get('api/districts/{city}', [DistrictController::class, 'byCity'])
        ->name('api.districts');
    Route::get('api/villages/{district}', [VillageController::class, 'byDistrict'])
        ->name('api.villages');
});

<?php

use App\Http\Controllers\MaintenanceLogController;
use App\Http\Controllers\MapController;
use App\Http\Controllers\OdcController;
use App\Http\Controllers\OdpController;
use App\Http\Controllers\OltController;
use App\Http\Controllers\OntController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    // Interactive Map
    Route::get('map', [MapController::class, 'index'])->name('map.index');
    Route::get('map/data', [MapController::class, 'data'])->name('map.data');

    // OLT
    Route::resource('olts', OltController::class);
    Route::post('olts/{id}/restore', [OltController::class, 'restore'])
        ->name('olts.restore');

    // ODC
    Route::resource('odcs', OdcController::class);
    Route::post('odcs/{id}/restore', [OdcController::class, 'restore'])
        ->name('odcs.restore');

    // ODP
    Route::resource('odps', OdpController::class);
    Route::post('odps/{id}/restore', [OdpController::class, 'restore'])
        ->name('odps.restore');

    // ONT
    Route::resource('onts', OntController::class);
    Route::post('onts/{id}/restore', [OntController::class, 'restore'])
        ->name('onts.restore');

    // Maintenance Logs
    Route::get('maintenance-logs', [MaintenanceLogController::class, 'index'])
        ->name('maintenance-logs.index');
    Route::post('{loggableType}/{loggableId}/maintenance-logs', [MaintenanceLogController::class, 'store'])
        ->name('maintenance-logs.store')
        ->where('loggableType', 'odps|odcs|olts|onts');
});

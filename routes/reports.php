<?php

use App\Http\Controllers\ReportController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('reports/capacity', [ReportController::class, 'capacity'])->name('reports.capacity');
    Route::get('reports/coverage', [ReportController::class, 'coverage'])->name('reports.coverage');
});

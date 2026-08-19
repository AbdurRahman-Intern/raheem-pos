<?php

use App\Http\Controllers\BackupController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\SettingController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('products', ProductController::class);
    Route::resource('customers', CustomerController::class);
    Route::get('reports', [ReportController::class, 'index'])->name('reports.index');
    // Route::get('reports', [ReportController::class, 'print'])->name('reports.print');
    Route::get('/backup/desktop/download', [BackupController::class, 'exportToDesktop'])->name('backup.desktop');
    Route::post('/backup/import', [BackupController::class, 'importDatabase'])->name('backup.import');
    Route::resource('payments', PaymentController::class)->only(['index', 'create', 'show', 'store']);
    // Route::resource('purchases', PurchaseController::class)->only(['index', 'create', 'store']);
    Route::resource('sales', SaleController::class)->only(['index', 'create', 'store', 'show']);
    Route::resource('expenses', ExpenseController::class);
    Route::get('settings', [SettingController::class, 'index'])->name('settings.index');
    Route::put('settings', [SettingController::class, 'update'])->name('settings.update');
    Route::post('language', [SettingController::class, 'changeLanguage'])->name('language.change');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::get('lang/{locale}', function ($locale) {
    if (in_array($locale, ['en', 'ps', 'fa'])) {
        session()->put('locale', $locale);
    }

    return redirect()->back();
})->name('lang.switch');

require __DIR__.'/auth.php';
<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Expense;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\Sale;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    public function stats(): array
    {
        return [
            'products_count' => Product::query()->count(),
            'customers_count' => Customer::query()->count(),
            'sales_count' => Sale::query()->count(),
            'purchases_count' => Purchase::query()->count(),
            'expenses_total' => Expense::query()->sum('amount') ?? 0,
            'sales_total' => Sale::query()->sum('grand_total') ?? 0,
            'products_low_stock' => Product::query()->whereColumn('stock', '<=', 'minimum_stock')->count(),
            // NOTE: plain multiplication, not a DB-specific function — this
            // works identically on MySQL and SQLite, no branching needed.
            'inventory_value' => Product::query()->sum(DB::raw('stock * sell_price')) ?? 0,
        ];
    }

    /**
     * DIFFICULT: the only DB-specific SQL in this file. HOUR(created_at)
     * is MySQL-only — SQLite has no HOUR() function, it uses
     * strftime('%H', created_at) instead. Branch on the connection driver
     * so this works on both without touching anything else in the method.
     *
     * IMPORTANT: strftime('%H', ...) returns the hour as a zero-padded
     * STRING ("09"), while MySQL's HOUR() returns an INT (9). The
     * sprintf('%02d', ...) below normalizes both back to "09:00" either
     * way, so this difference is harmless here — but don't assume
     * $sale->hour is always numeric if you reuse this query elsewhere.
     */
    public function daily_report(?string $date = null): array
    {
        $hourExpr = $this->hourExpression();

        return Sale::query()
            ->selectRaw("$hourExpr as hour")
            ->selectRaw('SUM(grand_total) as total')
            ->whereDate('created_at', today())
            ->groupByRaw($hourExpr)
            ->orderBy('hour')
            ->get()
            ->map(fn ($sale) => [
                'label' => sprintf(
                    '%02d:00',
                    (int) $sale->hour
                ),
                'total' => (float) $sale->total,
            ])->values()->all();
    }

    private function hourExpression(): string
    {
        return DB::connection()->getDriverName() === 'sqlite'
            ? "strftime('%H', created_at)"
            : 'HOUR(created_at)';
    }

    public function getWeeklyReports()
    {
        $start = now()->startOfWeek();
        $end = now()->endOfWeek();

        // NOTE: DATE(created_at) works unchanged on both MySQL and
        // SQLite — no branching needed here.
        return Sale::query()
            ->selectRaw('DATE(created_at) as date')
            ->selectRaw('SUM(grand_total) as total')
            ->whereBetween('created_at', [$start, $end])
            ->groupByRaw('DATE(created_at)')
            ->orderBy('date')->get()
            ->map(fn ($sale) => [
                'label' => $this->formatDay($sale->date),
                'total' => $sale->total,
            ])->values()->all();

    }

    public function getMonthlyReports()
    {
        $start = now()->startOfMonth();
        $end = now()->endOfMonth();

        // NOTE: DATE(created_at) works unchanged on both MySQL and
        // SQLite — no branching needed here.
        return Sale::query()
            ->selectRaw('DATE(created_at) as date')
            ->selectRaw('SUM(grand_total) as total')
            ->whereBetween('created_at', [$start, $end])
            ->groupByRaw('DATE(created_at)')
            ->orderBy('date')
            ->get()->map(fn ($sale) => [
                'label' => date('d', strtotime($sale->date)),
                'total' => (float) $sale->total,
            ])->values()->all();
    }

    private function formatDay(string $date): string
    {
        return date('D', strtotime($date));
    }
}

<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Expense;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Profit;
use App\Models\Sale;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use InvalidArgumentException;

class ReportService
{
    private const PERIODS = ['daily', 'weekly', 'monthly'];

    /* =====================================================================
     * PUBLIC API — everything a controller should call lives here.
     * Anything below marked `private` is an implementation detail and
     * should never be called directly from a controller.
     * ===================================================================== */

    /**
     * Used by ReportController@index (the chart/table report page).
     *
     * Each category (sales/expenses/income) returns TWO things:
     *   - `chart`   : period-bucketed totals, unchanged shape from before —
     *                 [{ period_key, total, count }, ...] — feeds the bar chart.
     *   - `records` : the full underlying rows for the window, with their
     *                 relevant relations eager-loaded, for a detail/drill-down
     *                 table. This is the "all of its information" piece —
     *                 sales come with their line items + product + customer,
     *                 income comes with its customer, expenses come as-is
     *                 (they have no relations to load).
     *
     * Records are capped and ordered newest-first (see MAX_RECORDS below) —
     * a report window can span a month of high-volume POS activity, and
     * shipping every row to the browser on every period switch isn't free.
     * Raise the cap or add real pagination if you need the full list beyond
     * that on screen.
     */
    private const MAX_RECORDS = 200;

    public function summary(string $period, ?string $from = null, ?string $to = null): array
    {
        [$start, $end] = $this->resolveWindow($period, $from, $to);

        return [
            'period' => $period,
            'from' => $start->toDateString(),
            'to' => $end->toDateString(),
            'sales' => [
                'chart' => $this->aggregate(Sale::query(), $period, 'created_at', 'grand_total', $start, $end),
                'records' => $this->salesRecords($start, $end),
            ],
            'expenses' => [
                'chart' => $this->aggregate(Expense::query(), $period, 'date', 'amount', $start, $end),
                'records' => $this->expenseRecords($start, $end),
            ],
            'income' => [
                'chart' => $this->aggregate(Payment::query(), $period, 'payment_date', 'amount', $start, $end),
                'records' => $this->incomeRecords($start, $end),
            ],
        ];
    }

    /**
     * Used by ReportController@print (the executive PrintReport page).
     * Returns the flat totals + trend + inventory + debtors shape that
     * PrintReport.jsx expects, PLUS a `records` block containing the same
     * full sales/expenses/income rows summary() exposes — this is what
     * feeds the printable "Detailed Transaction Ledger" page (Page 4).
     * See PrintReport.jsx's docblock for the full prop contract.
     */
    public function executiveReport(string $scope, ?string $from = null, ?string $to = null): array
    {
        [$start, $end] = $this->resolveWindow($scope, $from, $to);

        return [
            'scope' => $scope,
            'range' => ['from' => $start->toDateString(), 'to' => $end->toDateString()],
            'financial' => $this->financialBreakdown($scope, $start, $end),
            'inventory' => ['products' => $this->inventorySnapshot()],
            'customers' => ['debtors' => $this->debtorsLedger()],
            'records' => [
                'sales' => $this->salesRecords($start, $end),
                'expenses' => $this->expenseRecords($start, $end),
                'income' => $this->incomeRecords($start, $end),
            ],
        ];
    }

    /**
     * Public date-window resolver. Both public report methods above route
     * through this, and a controller may also call it directly if it needs
     * the raw Carbon range for something not covered by summary()/
     * executiveReport() (e.g. a custom export).
     *
     * Returns [Carbon $start, Carbon $end].
     */
    public function resolveWindow(string $period, ?string $from = null, ?string $to = null): array
    {
        $this->assertValidPeriod($period);

        if ($from && $to) {
            return [Carbon::parse($from)->startOfDay(), Carbon::parse($to)->endOfDay()];
        }

        return match ($period) {
            'daily' => [now()->subDays(29)->startOfDay(), now()->endOfDay()],
            'weekly' => [now()->subWeeks(11)->startOfWeek(), now()->endOfWeek()],
            'monthly' => [now()->subMonths(11)->startOfMonth(), now()->endOfMonth()],
        };
    }

    /* =====================================================================
     * PRIVATE IMPLEMENTATION — not part of the public contract.
     * ===================================================================== */

    private function assertValidPeriod(string $period): void
    {
        if (! in_array($period, self::PERIODS, true)) {
            throw new InvalidArgumentException(
                "Invalid period [$period]. Expected one of: ".implode(', ', self::PERIODS)
            );
        }
    }

    /**
     * Groups $query by day/week/month and sums $amountColumn.
     *
     * DIFFICULT: this is the only raw-SQL chokepoint in the whole service.
     * MySQL and SQLite have different date functions, so we can't use one
     * expression for both — we branch on the connection driver in
     * groupExpression() below. Every other query in this class is plain
     * Eloquent and already portable across drivers; if you're porting this
     * to a NEW driver (Postgres etc.), this is the only method you need
     * to touch.
     */
    private function aggregate(Builder $query, string $period, string $dateColumn, string $amountColumn, Carbon $start, Carbon $end): Collection
    {
        $groupExpr = $this->groupExpression($query, $period, $dateColumn);

        return $query
            ->whereBetween($dateColumn, [$start, $end])
            ->selectRaw("$groupExpr as period_key, SUM($amountColumn) as total, COUNT(*) as count")
            ->groupBy('period_key')
            ->orderBy('period_key')
            ->get();
    }

    /**
     * Driver-specific date-bucketing expressions.
     *
     * IMPORTANT: both branches are written to emit the SAME key shape per
     * period ("YYYY-MM-DD" daily, "YYYY-WW" weekly, "YYYY-MM" monthly) so
     * that formatBucketLabel() and trendBuckets()'s keyBy('period_key')
     * merge work identically no matter which DB produced the rows. If you
     * add a driver, make sure its keys match this shape too.
     */
    private function groupExpression(Builder $query, string $period, string $dateColumn): string
    {
        $driver = $query->getConnection()->getDriverName();

        if ($driver === 'sqlite') {
            return match ($period) {
                'daily' => "DATE($dateColumn)",
                // IMPORTANT: strftime('%W', ...) is Monday-start week-of-year,
                // NOT a strict ISO-8601 week. It can disagree with MySQL's
                // '%v' by a day at year boundaries (late Dec / early Jan).
                // Accepted as a reporting bucket — don't reuse this key for
                // anything that needs exact ISO parity with the MySQL path.
                'weekly' => "strftime('%Y-%W', $dateColumn)",
                'monthly' => "strftime('%Y-%m', $dateColumn)",
            };
        }

        // mysql / mariadb
        return match ($period) {
            'daily' => "DATE($dateColumn)",
            // IMPORTANT: '%x-%v' (lowercase x, lowercase v) = ISO year + ISO
            // week, e.g. "2024-33". Using '%X-%V' (uppercase) instead is a
            // classic bug — uppercase uses the *non-ISO* week definition and
            // will silently disagree with '%x-%v' near year boundaries.
            'weekly' => "DATE_FORMAT($dateColumn, '%x-%v')",
            'monthly' => "DATE_FORMAT($dateColumn, '%Y-%m')",
        };
    }

    /**
     * Cash-basis financial breakdown for PrintReport.jsx's Page 1.
     *
     * DIFFICULT / IMPORTANT: this is cash-basis, not accrual.
     * totalBilledSales sums `paid_amount` (cash actually received),
     * NOT `grand_total` (which includes unpaid credit/baqaya). If this
     * is later "fixed" to use grand_total, totalRemainingBalance and
     * directBalanceCleared will start double-counting outstanding
     * credit — see baqayaCollected() below for why there's currently
     * no overlap between paid_amount and payments.amount.
     */
    private function financialBreakdown(string $scope, Carbon $start, Carbon $end): array
    {
        $sales = Sale::whereBetween('created_at', [$start, $end])->get();

        return [
            'totalBilledSales' => (float) $sales->sum('paid_amount'),
            'directBalanceCleared' => (float) $this->baqayaCollected($start, $end),
            'totalDiscount' => (float) $sales->sum('discount'),
            'totalExpenses' => (float) Expense::whereBetween('date', [$start, $end])->sum('amount'),
            'totalProfit' => (float) Profit::whereIn('sale_id', $sales->pluck('id'))->sum('amount'),
            'totalPaidAmount' => (float) $sales->sum('paid_amount'),
            'totalRemainingBalance' => (float) $sales->sum('remaining_balance'),
            'trend' => $this->trendBuckets($scope, $start, $end),
        ];
    }

    /**
     * Cash collected in this window against customer baqaya (outstanding
     * balance).
     *
     * IMPORTANT: the `payments` table has a required `customer_id` and no
     * `sale_id` — meaning, by construction, every row represents money
     * collected OUTSIDE of creating a new invoice. A fresh sale's cash
     * intake is already captured separately via sales.paid_amount at
     * creation time, so there's no overlap between the two sums. Don't
     * add a sale_id-based filter here thinking it's missing — the schema
     * already guarantees the split.
     */
    private function baqayaCollected(Carbon $start, Carbon $end): float
    {
        return (float) Payment::whereBetween('payment_date', [$start, $end])->sum('amount');
    }

    /**
     * Period-bucketed trend rows for the Page 1 chart:
     * [{ label: 'Aug 12', sales: 1200, expenses: 300, profit: 400 }, ...]
     *
     * DIFFICULT: relies on all three aggregate() calls producing
     * period_key values in the exact same format (see groupExpression()
     * above) so keyBy('period_key') lines sales/expenses/profit up into
     * the same bucket instead of silently producing three disjoint sets
     * of keys.
     */
    private function trendBuckets(string $scope, Carbon $start, Carbon $end): array
    {
        $salesByBucket = $this->aggregate(Sale::query(), $scope, 'created_at', 'grand_total', $start, $end)
            ->keyBy('period_key');
        $expensesByBucket = $this->aggregate(Expense::query(), $scope, 'date', 'amount', $start, $end)
            ->keyBy('period_key');
        $profitByBucket = $this->aggregate(
            Profit::query()->join('sales', 'sales.id', '=', 'profits.sale_id'),
            $scope,
            'sales.created_at',
            'profits.amount',
            $start,
            $end
        )->keyBy('period_key');

        $allKeys = collect()
            ->merge($salesByBucket->keys())
            ->merge($expensesByBucket->keys())
            ->merge($profitByBucket->keys())
            ->unique()
            ->sort()
            ->values();

        return $allKeys->map(fn ($key) => [
            'label' => $this->formatBucketLabel($key, $scope),
            'sales' => (float) ($salesByBucket[$key]->total ?? 0),
            'expenses' => (float) ($expensesByBucket[$key]->total ?? 0),
            'profit' => (float) ($profitByBucket[$key]->total ?? 0),
        ])->all();
    }

    /**
     * DIFFICULT: period_key format must match across BOTH drivers or this
     * breaks silently. Both drivers now emit weekly keys as "YYYY-WW" —
     * keep it that way if groupExpression() above ever changes.
     */
    private function formatBucketLabel(string $key, string $scope): string
    {
        return match ($scope) {
            'daily' => Carbon::parse($key)->format('M d'),
            'monthly' => Carbon::parse($key.'-01')->format('M Y'),
            'weekly' => $this->formatWeekLabel($key),
            default => $key,
        };
    }

    /**
     * DIFFICULT: SQLite's %W has no leading zero (e.g. "5"), MySQL's %v
     * does (e.g. "05"). Strip leading zeros here so the *label* is
     * identical regardless of which driver produced the key.
     */
    private function formatWeekLabel(string $key): string
    {
        [$year, $week] = explode('-', $key);
        $week = ltrim($week, '0');
        $week = $week === '' ? '0' : $week;

        return "W{$week} · {$year}";
    }

    /**
     * Full product listing for PrintReport.jsx's Page 2. Selecting only
     * the columns the frontend actually reads keeps this light even with
     * a large catalog.
     */
    private function inventorySnapshot(): Collection
    {
        return Product::query()
            ->select('id', 'name', 'stock', 'minimum_stock', 'buy_price', 'sell_price', 'status')
            ->orderBy('name')
            ->get();
    }

    /**
     * Customers with an outstanding balance, for PrintReport.jsx's Page 3.
     */
    private function debtorsLedger(): Collection
    {
        return Customer::query()
            ->where('baqaya', '>', 0)
            ->select('id', 'name', 'phone', 'address', 'baqaya')
            ->orderByDesc('baqaya')
            ->get();
    }

    /* -----------------------------------------------------------------
     * SHARED RECORD FETCHERS
     * Used by both summary() (screen detail tables) and executiveReport()
     * (printable Page 4 ledger) — one query per category, one place to
     * change eager-loading or ordering if the requirements shift.
     * ----------------------------------------------------------------- */

    /**
     * Full sale rows for the window, with line items + product + customer
     * eager-loaded so the frontend never has to make a follow-up request
     * to show "what was actually sold" per invoice.
     */
    private function salesRecords(Carbon $start, Carbon $end): Collection
    {
        return Sale::with(['items.product', 'customer'])
            ->whereBetween('created_at', [$start, $end])
            ->orderByDesc('created_at')
            ->limit(self::MAX_RECORDS)
            ->get();
    }

    /**
     * Full expense rows for the window. No relations to eager-load —
     * expenses are a flat table (amount, description/notes, date).
     */
    private function expenseRecords(Carbon $start, Carbon $end): Collection
    {
        return Expense::whereBetween('date', [$start, $end])
            ->orderByDesc('date')
            ->limit(self::MAX_RECORDS)
            ->get();
    }

    /**
     * Full payment (income) rows for the window, with customer
     * eager-loaded — every payment is tied to a customer per the
     * `payments` table schema (see baqayaCollected() above for why).
     */
    private function incomeRecords(Carbon $start, Carbon $end): Collection
    {
        return Payment::with('customer')
            ->whereBetween('payment_date', [$start, $end])
            ->orderByDesc('payment_date')
            ->limit(self::MAX_RECORDS)
            ->get();
    }
}

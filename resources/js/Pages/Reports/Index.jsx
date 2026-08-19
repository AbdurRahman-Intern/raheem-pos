import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useMemo } from 'react';

/**
 * =============================================================================
 * PrintReport.jsx
 * =============================================================================
 * Executive report dashboard for the POS/inventory system, built to be viewed
 * on screen and printed as a clean 3-page physical document:
 *
 *   PAGE 1 — Financial Performance Summary & Cash Flow Balance Analytics
 *   PAGE 2 — Warehouse Stock Inventory & Low-Stock Risk Assessment
 *   PAGE 3 — Customer History Matrix & Credit Debtors Ledger (Baqaya)
 *
 * -----------------------------------------------------------------------------
 * EXPECTED PROPS (from ReportController@print via Inertia::render)
 * -----------------------------------------------------------------------------
 *   scope:  'daily' | 'weekly' | 'monthly'   — current report window
 *   range:  { from: 'YYYY-MM-DD', to: 'YYYY-MM-DD' }
 *
 *   financial: {
 *     totalBilledSales:      number  // sum of sales.grand_total in range
 *     totalDiscount:         number  // sum of sales.discount in range
 *     directBalanceCleared:  number  // cash received against OLD baqaya
 *                                    // (previous_balance), not new-invoice
 *                                    // revenue — see cash-on-hand note below
 *     totalExpenses:         number  // sum of expenses.amount in range
 *     totalProfit:           number  // sum of profits.amount in range
 *                                    // (already isolated/snapshotted at
 *                                    // sale time using historical buy_price)
 *     totalPaidAmount:       number  // sum of sales.paid_amount in range
 *     totalRemainingBalance: number  // sum of sales.remaining_balance
 *     trend: Array<{                 // one row per day/week/month bucket
 *       label:    string             // pre-formatted by backend, e.g. "Aug 12"
 *       sales:    number
 *       expenses: number
 *       profit:   number
 *     }>
 *   }
 *
 *   inventory: {
 *     products: Array<{
 *       id, name, stock, minimum_stock, buy_price, sell_price, status
 *     }>
 *   }
 *
 *   customers: {
 *     debtors: Array<{ id, name, phone, address, baqaya }>
 *   }
 *
 *   records: {                       // NEW — feeds Page 4 (Detailed Ledger)
 *     sales:    Array<Sale>          // same shape as sale objects elsewhere
 *                                    // in the app (items, customer, etc.)
 *     expenses: Array<Expense>       // { id, date, amount, notes/description }
 *     income:   Array<Payment>       // { id, payment_date, amount, customer }
 *   }
 *
 * Every nested array/number above is read through the safe-access helpers
 * declared at the top of this file (asArray / asNumber), so missing or null
 * fields from the backend degrade to empty tables / zero totals instead of
 * throwing — this component will never hard-crash on incomplete data.
 * =============================================================================
 */

/* -----------------------------------------------------------------------
 * SAFE DATA ACCESS HELPERS
 * ---------------------------------------------------------------------
 * The backend contract above is the goal, but reports are exactly the
 * kind of feature where a null relation, an unset column, or a partially
 * migrated dataset can slip through. These two helpers are the ONLY way
 * this component reads array/number props — never destructure directly
 * off `financial`, `inventory`, or `customers` without passing through
 * one of these first.
 * --------------------------------------------------------------------- */

/** Coerces any value into a real array. Never throws, never returns undefined. */
function asArray(value) {
    return Array.isArray(value) ? value : [];
}

/** Coerces any value into a finite number, defaulting to 0. Never returns NaN. */
function asNumber(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
}

/** Currency formatter shared by every page. Adjust locale/currency to taste. */
function formatMoney(value) {
    return new Intl.NumberFormat(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(asNumber(value));
}

/** Stock-health classification used on Page 2. Pure function, no side effects. */
function getStockStatus(stock, minimumStock) {
    const currentStock = asNumber(stock);
    const minStock = asNumber(minimumStock);

    if (currentStock <= 0) {
        return { label: 'Out of Stock', tone: 'critical' };
    }
    if (currentStock <= minStock) {
        return { label: 'Critical', tone: 'critical' };
    }
    if (currentStock <= minStock * 1.5) {
        return { label: 'Low', tone: 'warning' };
    }
    return { label: 'Healthy', tone: 'healthy' };
}

const STOCK_TONE_CLASSES = {
    critical: 'bg-rose-50 text-rose-700 border-rose-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    healthy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

/* -----------------------------------------------------------------------
 * MiniBarChart
 * ---------------------------------------------------------------------
 * A deliberately dependency-free SVG bar chart. Charting libraries like
 * Recharts rely on ResponsiveContainer measuring the DOM at mount time —
 * this is unreliable in print media (the browser's print engine doesn't
 * fire the resize events these libraries listen for, so charts can
 * render at 0 width/height on the printed page). A plain SVG with a
 * fixed viewBox scales correctly in both screen and print contexts with
 * zero extra configuration, which is why this file draws its own.
 * --------------------------------------------------------------------- */
function MiniBarChart({ data, series, height = 180 }) {
    const rows = asArray(data);

    if (rows.length === 0) {
        return (
            <div
                className="flex items-center justify-center rounded-lg border border-dashed border-gray-200 text-xs text-gray-400"
                style={{ height }}
            >
                No trend data for this range
            </div>
        );
    }

    const width = 700; // fixed internal coordinate space; SVG scales via viewBox
    const paddingLeft = 40;
    const paddingBottom = 24;
    const paddingTop = 10;
    const chartWidth = width - paddingLeft - 16;
    const chartHeight = height - paddingTop - paddingBottom;

    // Highest single value across every series/row determines the y-axis scale.
    const maxValue = Math.max(
        1, // guard against an all-zero dataset producing division by zero
        ...rows.flatMap((row) => series.map((s) => asNumber(row[s.key])))
    );

    const groupWidth = chartWidth / rows.length;
    const barWidth = Math.max(4, groupWidth / (series.length + 1.5));

    const yTicks = 4;
    const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) => (maxValue / yTicks) * i);

    return (
        <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full"
            style={{ height }}
            role="img"
            aria-label="Sales, expenses, and profit trend chart"
        >
            {/* Horizontal gridlines + y-axis labels */}
            {yTickValues.map((tick, i) => {
                const y = paddingTop + chartHeight - (tick / maxValue) * chartHeight;
                return (
                    <g key={i}>
                        <line
                            x1={paddingLeft}
                            x2={width - 8}
                            y1={y}
                            y2={y}
                            stroke="#e5e7eb"
                            strokeWidth={1}
                        />
                        <text x={paddingLeft - 6} y={y + 3} textAnchor="end" fontSize="9" fill="#9ca3af">
                            {Math.round(tick)}
                        </text>
                    </g>
                );
            })}

            {/* Bars, grouped per row (day/week/month), one bar per series */}
            {rows.map((row, rowIndex) => {
                const groupX = paddingLeft + rowIndex * groupWidth;
                return (
                    <g key={rowIndex}>
                        {series.map((s, seriesIndex) => {
                            const value = asNumber(row[s.key]);
                            const barHeight = (value / maxValue) * chartHeight;
                            const x = groupX + seriesIndex * (barWidth + 3) + 4;
                            const y = paddingTop + chartHeight - barHeight;
                            return (
                                <rect
                                    key={s.key}
                                    x={x}
                                    y={y}
                                    width={barWidth}
                                    height={Math.max(0, barHeight)}
                                    fill={s.color}
                                    rx={1.5}
                                />
                            );
                        })}
                        <text
                            x={groupX + groupWidth / 2}
                            y={height - 6}
                            textAnchor="middle"
                            fontSize="9"
                            fill="#6b7280"
                        >
                            {row.label}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}

/* -----------------------------------------------------------------------
 * StatCard — shared KPI tile used across all three pages
 * --------------------------------------------------------------------- */
function StatCard({ label, value, tone = 'slate', hint }) {
    const tones = {
        slate: 'border-gray-200 bg-white',
        indigo: 'border-indigo-100 bg-indigo-50',
        emerald: 'border-emerald-100 bg-emerald-50',
        rose: 'border-rose-100 bg-rose-50',
        amber: 'border-amber-100 bg-amber-50',
    };
    const valueTones = {
        slate: 'text-gray-900',
        indigo: 'text-indigo-800',
        emerald: 'text-emerald-800',
        rose: 'text-rose-800',
        amber: 'text-amber-800',
    };

    return (
        <div className={`rounded-xl border p-4 print:break-inside-avoid ${tones[tone]}`}>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">{label}</p>
            <p className={`mt-1 text-xl font-bold tabular-nums ${valueTones[tone]}`}>{value}</p>
            {hint && <p className="mt-0.5 text-[10px] text-gray-400">{hint}</p>}
        </div>
    );
}

/* -----------------------------------------------------------------------
 * Main component
 * --------------------------------------------------------------------- */
export default function PrintReport({ scope = 'daily', range = {}, report, rep, filters }) {

    const { financial, customers, inventory } = rep
    /* ---- Normalize every prop up front so the JSX below never has to
       guard against null/undefined again. ---- */
    const trend = asArray(financial.trend);
    const products = asArray(inventory.products);
    const debtors = asArray(customers.debtors);
    const salesRecords = asArray(report.sales.records);
    const expenseRecords = asArray(report.expenses.records);
    const incomeRecords = asArray(report.income.records);

    const totalBilledSales = asNumber(financial.totalBilledSales);
    const totalDiscount = asNumber(financial.totalDiscount);
    const directBalanceCleared = asNumber(financial.directBalanceCleared);
    const totalExpenses = asNumber(financial.totalExpenses);
    const totalProfit = asNumber(financial.totalProfit);
    const totalPaidAmount = asNumber(financial.totalPaidAmount);
    const totalRemainingBalance = asNumber(financial.totalRemainingBalance);

    /**
     * -------------------------------------------------------------------
     * CASH ON HAND FORMULA
     * -------------------------------------------------------------------
     *   Cash on Hand = (Total Billed Sales + Direct Balance Cleared) - Total Expenses
     *
     * Read literally, that looks like it double-counts revenue, so here's
     * what each term actually represents and why it doesn't:
     *
     *  - Total Billed Sales: cash actually collected against invoices
     *    RAISED in this period. This is NOT sales.grand_total (which is
     *    an accrual figure including unpaid/credit balances) — it should
     *    be sourced from sales.paid_amount summed over invoices created
     *    in the report window. Money billed but not yet paid is credit,
     *    not cash, and must not appear here.
     *
     *  - Direct Balance Cleared: cash collected in THIS period against
     *    baqaya (previous_balance) that originated from invoices raised
     *    in EARLIER periods. Because that revenue was never counted as
     *    cash when the original invoice was billed (it was credit at the
     *    time), the cash only enters the ledger now, when it's actually
     *    collected. This is what prevents double counting: old-period
     *    credit sales were excluded from cash then, so they must be
     *    included now, when the cash physically arrives.
     *
     *  - Total Expenses: cash paid out in the period, subtracted last.
     *
     * In short: this formula is a CASH BASIS figure, not an accrual
     * figure. `totalBilledSales` must be computed on the backend from
     * `paid_amount`, and `directBalanceCleared` must be computed from
     * whatever ledger/payment table records baqaya collections — NOT
     * from `grand_total`, which would silently include unpaid credit
     * and overstate cash on hand.
     * ---------------------------------------------------------------- */
    const cashOnHand = totalBilledSales + directBalanceCleared - totalExpenses;

    const lowStockProducts = useMemo(
        () =>
            products
                .map((p) => ({ ...p, status: getStockStatus(p.stock, p.minimum_stock) }))
                .filter((p) => p.status.tone !== 'healthy')
                .sort((a, b) => asNumber(a.stock) - asNumber(b.stock)),
        [products]
    );

    const totalStockValue = useMemo(
        () => products.reduce((sum, p) => sum + asNumber(p.stock) * asNumber(p.buy_price), 0),
        [products]
    );

    const totalStockUnits = useMemo(
        () => products.reduce((sum, p) => sum + asNumber(p.stock), 0),
        [products]
    );

    const sortedDebtors = useMemo(
        () => [...debtors].sort((a, b) => asNumber(b.baqaya) - asNumber(a.baqaya)),
        [debtors]
    );

    const totalOutstanding = useMemo(
        () => debtors.reduce((sum, d) => sum + asNumber(d.baqaya), 0),
        [debtors]
    );

    const handlePrint = () => window.print();

    const setScope = (nextScope) => {
        router.get(
            route('reports.index'),
            { scope: nextScope, from: range.from, to: range.to },
            { preserveState: true, preserveScroll: true }
        );
    };

    const scopeOptions = [
        { key: 'daily', label: 'Daily' },
        { key: 'weekly', label: 'Weekly' },
        { key: 'monthly', label: 'Monthly' },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Executive Report" />

            {/* ===================================================================
                SCREEN-ONLY CONTROLS
                Hidden entirely from the printed document via Tailwind's `print:`
                variant — no separate stylesheet needed for this part.
               =================================================================== */}
            <div className="print:hidden sticky top-0 z-20 border-b border-gray-200 bg-white/95 backdrop-blur">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
                    <div className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1">
                        {scopeOptions.map((opt) => (
                            <button
                                key={opt.key}
                                type="button"
                                onClick={() => setScope(opt.key)}
                                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${scope === opt.key
                                    ? 'bg-slate-900 text-white shadow-sm'
                                    : 'text-gray-500 hover:bg-white'
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={handlePrint}
                        className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z"
                            />
                        </svg>
                        Print Report
                    </button>
                </div>
            </div>

            {/* ===================================================================
                PRINTABLE DOCUMENT
               =================================================================== */}
            <div className="report-root mx-auto max-w-6xl px-4 py-8 print:max-w-none print:px-0 print:py-0">

                {/* ================================================================
                    PAGE 1 — Financial Performance Summary & Cash Flow Analytics
                   ================================================================ */}
                <section className="report-page rounded-2xl border border-gray-200 bg-white p-6 shadow-sm print:break-inside-avoid print:rounded-none print:border-0 print:p-8 print:shadow-none">
                    <ReportHeader
                        title="Financial Performance Summary"
                        subtitle="Cash Flow Balance Analytics"
                        scope={scope}
                        range={range}
                    />

                    {/* KPI grid */}
                    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                        <StatCard label="Total Billed Sales" value={formatMoney(totalBilledSales)} tone="indigo" />
                        <StatCard label="Direct Balance Cleared" value={formatMoney(directBalanceCleared)} tone="indigo" hint="Baqaya collected this period" />
                        <StatCard label="Total Expenses" value={formatMoney(totalExpenses)} tone="rose" />
                        <StatCard
                            label="Cash on Hand"
                            value={formatMoney(cashOnHand)}
                            tone={cashOnHand >= 0 ? 'emerald' : 'rose'}
                            hint="(Billed Sales + Balance Cleared) − Expenses"
                        />
                        <StatCard label="Net Profit" value={formatMoney(totalProfit)} tone="emerald" hint="Snapshot at historical buy price" />
                        <StatCard label="Total Discount Given" value={formatMoney(totalDiscount)} tone="amber" />
                        <StatCard label="Total Paid (All Invoices)" value={formatMoney(totalPaidAmount)} tone="slate" />
                        <StatCard label="Outstanding Balance" value={formatMoney(totalRemainingBalance)} tone="rose" hint="Unpaid across all invoices" />
                    </div>

                    {/* Cash flow breakdown table — makes the formula auditable on paper */}
                    <div className="mt-6">
                        <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                            Cash Flow Breakdown
                        </h3>
                        <table className="w-full border-collapse overflow-hidden rounded-lg border border-gray-200 text-sm">
                            <tbody>
                                <tr className="border-b border-gray-100">
                                    <td className="px-4 py-2.5 text-gray-600">Total Billed Sales (cash received on new invoices)</td>
                                    <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-gray-800">
                                        {formatMoney(totalBilledSales)}
                                    </td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="px-4 py-2.5 text-gray-600">+ Direct Balance Cleared (old baqaya collected)</td>
                                    <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-gray-800">
                                        {formatMoney(directBalanceCleared)}
                                    </td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="px-4 py-2.5 text-gray-600">− Total Expenses</td>
                                    <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-rose-700">
                                        ({formatMoney(totalExpenses)})
                                    </td>
                                </tr>
                                <tr className="bg-gray-50">
                                    <td className="px-4 py-3 font-bold text-gray-900">= Cash on Hand</td>
                                    <td
                                        className={`px-4 py-3 text-right text-base font-bold tabular-nums ${cashOnHand >= 0 ? 'text-emerald-700' : 'text-rose-700'
                                            }`}
                                    >
                                        {formatMoney(cashOnHand)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Trend chart */}
                    <div className="mt-6">
                        <div className="mb-2 flex items-center justify-between">
                            <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500">
                                Sales / Expenses / Profit Trend
                            </h3>
                            <Legend
                                items={[
                                    { label: 'Sales', color: '#6366f1' },
                                    { label: 'Expenses', color: '#f43f5e' },
                                    { label: 'Profit', color: '#10b981' },
                                ]}
                            />
                        </div>
                        <MiniBarChart
                            data={trend}
                            series={[
                                { key: 'sales', color: '#6366f1' },
                                { key: 'expenses', color: '#f43f5e' },
                                { key: 'profit', color: '#10b981' },
                            ]}
                        />
                    </div>
                </section>

                {/* ================================================================
                    PAGE 2 — Warehouse Stock Inventory & Low-Stock Risk
                   ================================================================ */}
                <section className="report-page page-break rounded-2xl border border-gray-200 bg-white p-6 shadow-sm print:rounded-none print:border-0 print:p-8 print:shadow-none">
                    <ReportHeader
                        title="Warehouse Stock Inventory"
                        subtitle="Low-Stock Risk Assessment"
                        scope={scope}
                        range={range}
                    />

                    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <StatCard label="Total SKUs" value={products.length} tone="slate" />
                        <StatCard label="Total Stock Units" value={totalStockUnits.toLocaleString()} tone="indigo" />
                        <StatCard label="Stock Value (at cost)" value={formatMoney(totalStockValue)} tone="emerald" />
                        <StatCard
                            label="Low / Critical Items"
                            value={lowStockProducts.length}
                            tone={lowStockProducts.length > 0 ? 'rose' : 'emerald'}
                        />
                    </div>

                    {/* Risk table — only items needing attention, sorted worst-first */}
                    <div className="mt-6">
                        <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                            Low-Stock Risk Assessment
                        </h3>
                        {lowStockProducts.length === 0 ? (
                            <p className="rounded-lg border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-400">
                                No products are currently below their reorder threshold.
                            </p>
                        ) : (
                            <table className="w-full border-collapse overflow-hidden rounded-lg border border-gray-200 text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Product</th>
                                        <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Current Stock</th>
                                        <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Minimum Stock</th>
                                        <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Suggested Reorder</th>
                                        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {lowStockProducts.map((p) => {
                                        // Simple reorder heuristic: bring stock up to 2x minimum.
                                        // Replace with your actual reorder/lead-time logic if one exists.
                                        const suggestedReorder = Math.max(0, asNumber(p.minimum_stock) * 2 - asNumber(p.stock));
                                        return (
                                            <tr key={p.id}>
                                                <td className="px-4 py-2.5 font-medium text-gray-800">{p.name}</td>
                                                <td className="px-4 py-2.5 text-right tabular-nums text-gray-700">{asNumber(p.stock)}</td>
                                                <td className="px-4 py-2.5 text-right tabular-nums text-gray-500">{asNumber(p.minimum_stock)}</td>
                                                <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-gray-800">{suggestedReorder}</td>
                                                <td className="px-4 py-2.5">
                                                    <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${STOCK_TONE_CLASSES[p.status.tone]}`}>
                                                        {p.status.label}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Full inventory table — complete listing for the printed record */}
                    <div className="mt-6">
                        <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                            Full Inventory Listing
                        </h3>
                        <table className="w-full border-collapse overflow-hidden rounded-lg border border-gray-200 text-xs">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-3 py-2 text-left font-semibold uppercase tracking-wide text-gray-500">Product</th>
                                    <th className="px-3 py-2 text-right font-semibold uppercase tracking-wide text-gray-500">Stock</th>
                                    <th className="px-3 py-2 text-right font-semibold uppercase tracking-wide text-gray-500">Buy Price</th>
                                    <th className="px-3 py-2 text-right font-semibold uppercase tracking-wide text-gray-500">Sell Price</th>
                                    <th className="px-3 py-2 text-left font-semibold uppercase tracking-wide text-gray-500">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {products.map((p) => {
                                    const status = getStockStatus(p.stock, p.minimum_stock);
                                    return (
                                        <tr key={p.id}>
                                            <td className="px-3 py-2 text-gray-700">{p.name}</td>
                                            <td className="px-3 py-2 text-right tabular-nums text-gray-600">{asNumber(p.stock)}</td>
                                            <td className="px-3 py-2 text-right tabular-nums text-gray-500">{formatMoney(p.buy_price)}</td>
                                            <td className="px-3 py-2 text-right tabular-nums text-gray-500">{formatMoney(p.sell_price)}</td>
                                            <td className="px-3 py-2">
                                                <span className={`inline-block rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${STOCK_TONE_CLASSES[status.tone]}`}>
                                                    {status.label}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* ================================================================
                    PAGE 3 — Customer History Matrix & Credit Debtors Ledger
                   ================================================================ */}
                <section className="report-page page-break rounded-2xl border border-gray-200 bg-white p-6 shadow-sm print:rounded-none print:border-0 print:p-8 print:shadow-none">
                    <ReportHeader
                        title="Customer History Matrix"
                        subtitle="Credit Debtors Ledger (Baqaya Balance)"
                        scope={scope}
                        range={range}
                    />

                    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                        <StatCard label="Total Outstanding (Baqaya)" value={formatMoney(totalOutstanding)} tone="rose" />
                        <StatCard label="Active Debtors" value={debtors.length} tone="amber" />
                        <StatCard
                            label="Largest Single Debt"
                            value={sortedDebtors.length ? formatMoney(sortedDebtors[0].baqaya) : formatMoney(0)}
                            tone="rose"
                            hint={sortedDebtors[0]?.name}
                        />
                    </div>

                    <div className="mt-6">
                        <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                            Credit Debtors Ledger — sorted highest balance first
                        </h3>
                        {sortedDebtors.length === 0 ? (
                            <p className="rounded-lg border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-400">
                                No outstanding customer balances.
                            </p>
                        ) : (
                            <table className="w-full border-collapse overflow-hidden rounded-lg border border-gray-200 text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Customer</th>
                                        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Phone</th>
                                        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Address</th>
                                        <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Baqaya Owed</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {sortedDebtors.map((d) => (
                                        <tr key={d.id}>
                                            <td className="px-4 py-2.5 font-medium text-gray-800">{d.name}</td>
                                            <td className="px-4 py-2.5 text-gray-500">{d.phone || '—'}</td>
                                            <td className="px-4 py-2.5 text-gray-500">{d.address || '—'}</td>
                                            <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-rose-700">
                                                {formatMoney(d.baqaya)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-gray-50">
                                        <td colSpan={3} className="px-4 py-3 text-right text-sm font-bold text-gray-700">
                                            Total Outstanding
                                        </td>
                                        <td className="px-4 py-3 text-right text-base font-bold tabular-nums text-rose-700">
                                            {formatMoney(totalOutstanding)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        )}
                    </div>

                    {/* Signature footer for the physical document */}
                    <div className="mt-10 grid grid-cols-2 gap-6 text-xs text-gray-500 print:break-inside-avoid">
                        <div>
                            <div className="h-10 border-b border-dashed border-gray-300" />
                            <p className="mt-1">Prepared By</p>
                        </div>
                        <div>
                            <div className="h-10 border-b border-dashed border-gray-300" />
                            <p className="mt-1">Approved By</p>
                        </div>
                    </div>
                </section>

                {/* ================================================================
                    PAGE 4 — Detailed Transaction Ledger
                    Full underlying sales / income / expense rows for the window,
                    not just the totals summarized on Page 1. This page can run
                    long on a high-volume period — each category is capped
                    server-side (see ReportService::MAX_RECORDS) rather than
                    printing an unbounded number of pages.
                   ================================================================ */}
                <section className="report-page page-break rounded-2xl border border-gray-200 bg-white p-6 shadow-sm print:rounded-none print:border-0 print:p-8 print:shadow-none">
                    <ReportHeader
                        title="Detailed Transaction Ledger"
                        subtitle="Full Sales, Income & Expense Records"
                        scope={scope}
                        range={range}
                    />

                    {/* Sales ledger */}
                    <div className="mt-6">
                        <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                            Sales ({salesRecords.length})
                        </h3>
                        {salesRecords.length === 0 ? (
                            <p className="rounded-lg border border-dashed border-gray-200 px-4 py-4 text-center text-xs text-gray-400">
                                No sales in this window.
                            </p>
                        ) : (
                            <table className="w-full border-collapse overflow-hidden rounded-lg border border-gray-200 text-xs">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-2 text-left font-semibold uppercase tracking-wide text-gray-500">Invoice</th>
                                        <th className="px-3 py-2 text-left font-semibold uppercase tracking-wide text-gray-500">Date</th>
                                        <th className="px-3 py-2 text-left font-semibold uppercase tracking-wide text-gray-500">Customer</th>
                                        <th className="px-3 py-2 text-left font-semibold uppercase tracking-wide text-gray-500">Type</th>
                                        <th className="px-3 py-2 text-right font-semibold uppercase tracking-wide text-gray-500">Items</th>
                                        <th className="px-3 py-2 text-right font-semibold uppercase tracking-wide text-gray-500">Paid</th>
                                        <th className="px-3 py-2 text-right font-semibold uppercase tracking-wide text-gray-500">Remaining</th>
                                        <th className="px-3 py-2 text-right font-semibold uppercase tracking-wide text-gray-500">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {salesRecords.map((sale) => (
                                        <tr key={sale.id}>
                                            <td className="px-3 py-1.5 font-medium text-gray-700">{sale.invoice_number}</td>
                                            <td className="px-3 py-1.5 text-gray-500">
                                                {sale.created_at ? new Date(sale.created_at).toLocaleDateString() : '—'}
                                            </td>
                                            <td className="px-3 py-1.5 text-gray-600">
                                                {sale.customer?.name ?? sale.customer_name ?? '—'}
                                            </td>
                                            <td className="px-3 py-1.5 text-gray-500 capitalize">{sale.invoice_type}</td>
                                            <td className="px-3 py-1.5 text-right tabular-nums text-gray-500">
                                                {asArray(sale.items).length}
                                            </td>
                                            <td className="px-3 py-1.5 text-right tabular-nums text-gray-600">
                                                {formatMoney(sale.paid_amount)}
                                            </td>
                                            <td className="px-3 py-1.5 text-right tabular-nums text-rose-600">
                                                {formatMoney(sale.remaining_balance)}
                                            </td>
                                            <td className="px-3 py-1.5 text-right tabular-nums font-semibold text-gray-800">
                                                {formatMoney(sale.grand_total)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Income ledger */}
                    <div className="mt-6 print:break-inside-avoid">
                        <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                            Income ({incomeRecords.length})
                        </h3>
                        {incomeRecords.length === 0 ? (
                            <p className="rounded-lg border border-dashed border-gray-200 px-4 py-4 text-center text-xs text-gray-400">
                                No income entries in this window.
                            </p>
                        ) : (
                            <table className="w-full border-collapse overflow-hidden rounded-lg border border-gray-200 text-xs">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-2 text-left font-semibold uppercase tracking-wide text-gray-500">Date</th>
                                        <th className="px-3 py-2 text-left font-semibold uppercase tracking-wide text-gray-500">Customer</th>
                                        <th className="px-3 py-2 text-left font-semibold uppercase tracking-wide text-gray-500">Notes</th>
                                        <th className="px-3 py-2 text-right font-semibold uppercase tracking-wide text-gray-500">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {incomeRecords.map((payment) => (
                                        <tr key={payment.id}>
                                            <td className="px-3 py-1.5 text-gray-500">
                                                {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : '—'}
                                            </td>
                                            <td className="px-3 py-1.5 text-gray-600">{payment.customer?.name ?? '—'}</td>
                                            <td className="px-3 py-1.5 text-right tabular-nums font-semibold text-emerald-700">
                                                {payment.notes}
                                            </td>
                                            <td className="px-3 py-1.5 text-right tabular-nums font-semibold text-emerald-700">
                                                +{formatMoney(payment.amount)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Expense ledger */}
                    <div className="mt-6 print:break-inside-avoid">
                        <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                            Expenses ({expenseRecords.length})
                        </h3>
                        {expenseRecords.length === 0 ? (
                            <p className="rounded-lg border border-dashed border-gray-200 px-4 py-4 text-center text-xs text-gray-400">
                                No expenses in this window.
                            </p>
                        ) : (
                            <table className="w-full border-collapse overflow-hidden rounded-lg border border-gray-200 text-xs">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-2 text-left font-semibold uppercase tracking-wide text-gray-500">Date</th>
                                        <th className="px-3 py-2 text-left font-semibold uppercase tracking-wide text-gray-500">Notes</th>
                                        <th className="px-3 py-2 text-right font-semibold uppercase tracking-wide text-gray-500">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {expenseRecords.map((expense) => (
                                        <tr key={expense.id}>
                                            <td className="px-3 py-1.5 text-gray-500">
                                                {expense.date ? new Date(expense.date).toLocaleDateString() : '—'}
                                            </td>
                                            <td className="px-3 py-1.5 text-gray-600">
                                                {expense.notes ?? expense.description ?? '—'}
                                            </td>
                                            <td className="px-3 py-1.5 text-right tabular-nums font-semibold text-rose-700">
                                                -{formatMoney(expense.amount)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </section>
            </div>

            {/* ===================================================================
                PRINT STYLESHEET
                Scoped entirely to @media print — has zero effect on screen layout.
               =================================================================== */}
            <style>{`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 14mm 12mm;
                    }

                    /* Force background colors (KPI tiles, status badges, chart
                       fills) to actually render — browsers strip backgrounds
                       from print output by default to save ink unless told
                       otherwise. */
                    * {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }

                    body {
                        background: #ffffff;
                    }

                    /* Each report page starts on a fresh sheet of paper. Page 1
                       has no .page-break class (it's already first); Pages 2
                       and 3 do. */
                    .page-break {
                        page-break-before: always;
                    }

                    /* Prevents a KPI card, table row, or the signature block
                       from being sliced across a page boundary mid-element. */
                    .report-page {
                        break-inside: avoid-page;
                    }

                    /* Avoids stray blank pages from min-height/flex layouts
                       that only make sense on screen. */
                    .report-root {
                        display: block;
                    }
                }
            `}</style>
        </AuthenticatedLayout>
    );
}

/* -----------------------------------------------------------------------
 * ReportHeader — repeated at the top of every physical page so each sheet
 * is self-identifying if pages get separated after printing.
 * --------------------------------------------------------------------- */
function ReportHeader({ title, subtitle, scope, range }) {
    const scopeLabel = { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly' }[scope] ?? scope;

    return (
        <div className="flex items-start justify-between border-b border-gray-200 pb-4">
            <div>
                <h1 className="text-lg font-bold text-gray-900">{title}</h1>
                <p className="text-sm text-gray-500">{subtitle}</p>
            </div>
            <div className="text-right">
                <span className="inline-block rounded-full bg-slate-900 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                    {scopeLabel} Report
                </span>
                <p className="mt-1 text-[11px] text-gray-400">
                    {range?.from ?? '—'} to {range?.to ?? '—'}
                </p>
            </div>
        </div>
    );
}

/* -----------------------------------------------------------------------
 * Legend — small color-key strip used above the trend chart.
 * --------------------------------------------------------------------- */
function Legend({ items }) {
    return (
        <div className="flex items-center gap-3">
            {items.map((item) => (
                <span key={item.label} className="inline-flex items-center gap-1.5 text-[10px] font-medium text-gray-500">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                    {item.label}
                </span>
            ))}
        </div>
    );
}
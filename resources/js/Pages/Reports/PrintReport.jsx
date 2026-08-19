
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTrans } from '@/lib/trans';
import { Head, Link, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

/**
 * Reports/Index — interactive daily / weekly / monthly comparison of
 * sales, expenses, and income. Backed by ReportController@index +
 * ReportService::summary().
 *
 * This is the "explore the numbers" view. For a formal printable
 * document (financial + inventory + debtors across 3 pages), see
 * ReportController@print -> Reports/PrintReport.jsx, linked from the
 * header here.
 *
 * Expects props exactly as returned by ReportService::summary():
 *   report: {
 *     period: 'daily' | 'weekly' | 'monthly',
 *     from: '2026-07-14', to: '2026-08-12',
 *     sales:    [{ period_key, total, count }, ...],
 *     expenses: [{ period_key, total, count }, ...],
 *     income:   [{ period_key, total, count }, ...],
 *   }
 *   filters: { period, from, to }
 */

const PERIODS = [
    { key: 'daily', label: 'Daily' },
    { key: 'weekly', label: 'Weekly' },
    { key: 'monthly', label: 'Monthly' },
];

const toNumber = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
};

/**
 * The three series can each have different period_key sets (e.g. a day
 * with expenses but no sales). This merges them into one aligned array,
 * zero-filling gaps, so the chart and table always show a complete
 * timeline instead of silently dropping mismatched rows.
 */
function mergeSeries(report) {
    const map = new Map();

    const ingest = (rows, field) => {
        for (const row of rows ?? []) {
            const key = row.period_key;
            if (!map.has(key)) {
                map.set(key, {
                    key,
                    sales: 0,
                    expenses: 0,
                    income: 0,
                    salesCount: 0,
                    expensesCount: 0,
                    incomeCount: 0,
                });
            }
            const entry = map.get(key);
            entry[field] = toNumber(row.total);
            entry[`${field}Count`] = toNumber(row.count);
        }
    };

    ingest(report.sales, 'sales');
    ingest(report.expenses, 'expenses');
    ingest(report.income, 'income');

    return Array.from(map.values())
        .sort((a, b) => (a.key > b.key ? 1 : -1))
        .map((row) => ({ ...row, net: row.sales + row.income - row.expenses }));
}

/**
 * period_key comes back as raw DB grouping values:
 *   daily   -> "2026-08-12"
 *   weekly  -> "202632"        (YEARWEEK output)
 *   monthly -> "2026-08"
 * This turns each into a readable chart/table label.
 */
function formatPeriodKey(key, period) {
    if (period === 'daily') {
        return new Date(key).toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
    }
    if (period === 'monthly') {
        const [year, month] = key.split('-');
        return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString(undefined, {
            month: 'short',
            year: 'numeric',
        });
    }
    const str = String(key);
    const year = str.slice(0, 4);
    const week = str.slice(4);
    return `W${week} · ${year}`;
}

export default function PrintReport() {

    return (
        <div>
            Saly
        </div>
    );
}
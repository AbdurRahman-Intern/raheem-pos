import { Link } from '@inertiajs/react';
import { useTrans } from '@/lib/trans';

/**
 * Shared tab bar for the Income / Expenses pages.
 *
 * These are real page navigations (Inertia <Link>), not client-side
 * tab-switching — clicking "Income" takes you to income.index, clicking
 * "Expenses" takes you to expenses.index. `active` just controls which
 * tab is highlighted on the page you're currently rendering.
 *
 * Usage:
 *   <FinanceTabs active="income" totals={{ income: 42000, expense: 18500 }} />
 *   <FinanceTabs active="expense" totals={{ income: 42000, expense: 18500 }} />
 *
 * `totals` is optional — pass current-period sums to show a quick
 * preview badge on each tab. Omit it and the badges just don't render.
 */
export default function FinanceTabs({ active = 'income', totals = null }) {
    const t = useTrans();

    const formatMoney = (value) =>
        new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(Number(value ?? 0));

    const tabs = [
        {
            key: 'income',
            href: route('payments.index'),
            label: t('finance', 'Income'),
            amount: totals?.income,
            icon: (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0 0 6-6m-6 6-6-6" />
                </svg>
            ),
            activeClasses: 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30',
            inactiveClasses: 'text-emerald-700 hover:bg-emerald-50',
            badgeClasses: 'bg-emerald-500/15 text-emerald-100',
            badgeInactiveClasses: 'bg-emerald-50 text-emerald-700',
        },
        {
            key: 'expense',
            href: route('expenses.index'),
            label: t('finance', 'Expenses'),
            amount: totals?.expense,
            icon: (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5v-15m0 0-6 6m6-6 6 6" />
                </svg>
            ),
            activeClasses: 'bg-rose-600 text-white shadow-sm shadow-rose-600/30',
            inactiveClasses: 'text-rose-700 hover:bg-rose-50',
            badgeClasses: 'bg-rose-500/15 text-rose-100',
            badgeInactiveClasses: 'bg-rose-50 text-rose-700',
        },
    ];

    return (
        <div className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
            {tabs.map((tab) => {
                const isActive = active === tab.key;
                return (
                    <Link
                        key={tab.key}
                        href={tab.href}
                        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${isActive ? tab.activeClasses : tab.inactiveClasses
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                        {tab.amount != null && (
                            <span
                                className={`rounded-full px-2 py-0.5 text-xs font-bold tabular-nums ${isActive ? tab.badgeClasses : tab.badgeInactiveClasses
                                    }`}
                            >
                                {formatMoney(tab.amount)}
                            </span>
                        )}
                    </Link>
                );
            })}
        </div>
    );
}

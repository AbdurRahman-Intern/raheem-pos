// import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
// import { Head, Link, router } from '@inertiajs/react';

// export default function ExpenseIndex({ expenses }) {
//     const handleDelete = (expense) => {
//         if (window.confirm('Delete this expense?')) {
//             router.delete(route('expenses.destroy', expense.id));
//         }
//     };

//     return (
//         <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Expenses</h2>}>
//             <Head title="Expenses" />
//             <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
//                 <div className="mb-4 flex justify-end">
//                     <Link href={route('expenses.create')} className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
//                         New Expense
//                     </Link>
//                 </div>
//                 <div className="overflow-hidden rounded-xl bg-white shadow-sm">
//                     <table className="min-w-full divide-y divide-gray-200 text-sm">
//                         <thead className="bg-gray-50">
//                             <tr>
//                                 <th className="px-4 py-3 text-left">Date</th>
//                                 <th className="px-4 py-3 text-left">Amount</th>
//                                 <th className="px-4 py-3 text-left">Notes</th>
//                                 <th className="px-4 py-3 text-left">Actions</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {expenses.map((expense) => (
//                                 <tr key={expense.id}>
//                                     <td className="px-4 py-3">{expense.date}</td>
//                                     <td className="px-4 py-3">{expense.amount}</td>
//                                     <td className="px-4 py-3">{expense.notes}</td>
//                                     <td className="px-4 py-3">
//                                         <div className="flex gap-2">
//                                             <Link href={route('expenses.edit', expense.id)} className="rounded bg-amber-500 px-3 py-1.5 text-white">Edit</Link>
//                                             <button type="button" onClick={() => handleDelete(expense)} className="rounded bg-rose-600 px-3 py-1.5 text-white">Delete</button>
//                                         </div>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//         </AuthenticatedLayout>
//     );
// }


import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FinanceTabs from '@/Components/FinanceTabs';
import { useTrans } from '@/lib/trans';
import { Head, Link, router } from '@inertiajs/react';
import { useMemo } from 'react';

export default function ExpenseIndex({ expenses = [], totals = null }) {
    const t = useTrans();

    const formatMoney = (value) =>
        new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
            Number(value ?? 0)
        );

    const formatDate = (value) =>
        value ? new Date(value).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

    const totalExpense = useMemo(
        () => expenses.reduce((sum, e) => sum + Number(e.amount ?? 0), 0),
        [expenses]
    );

    const handleDelete = (expense) => {
        if (window.confirm(t('finance', 'Delete this expense?'))) {
            router.delete(route('expenses.destroy', expense.id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <h2 className="text-xl font-semibold text-gray-800">{t('finance', 'Finance')}</h2>
                    <FinanceTabs active="expense" totals={totals ?? { expense: totalExpense }} />
                </div>
            }
        >
            <Head title={t('finance', 'Expenses')} />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Summary strip */}
                <div className="mb-6 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-rose-100 bg-rose-50 p-5">
                        <p className="text-xs font-semibold uppercase tracking-wide text-rose-600">
                            {t('finance', 'Total Expenses')}
                        </p>
                        <p className="mt-1.5 text-2xl font-bold text-rose-800">{formatMoney(totalExpense)}</p>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white p-5">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                            {t('finance', 'Entries')}
                        </p>
                        <p className="mt-1.5 text-2xl font-bold text-gray-800">{expenses.length}</p>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 flex items-center justify-end">
                        <Link
                            href={route('expenses.create')}
                            className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            {t('finance', 'New Expense')}
                        </Link>
                    </div>
                </div>

                {/* Table card */}
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    {expenses.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50">
                                <svg className="h-6 w-6 text-rose-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5v-15m0 0-6 6m6-6 6 6" />
                                </svg>
                            </div>
                            <p className="text-sm font-semibold text-gray-700">{t('finance', 'No expenses recorded yet')}</p>
                            <p className="text-xs text-gray-400">{t('finance', 'New entries you add will show up here')}</p>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-100 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        {t('finance', 'Date')}
                                    </th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        {t('finance', 'Notes')}
                                    </th>
                                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        {t('finance', 'Amount')}
                                    </th>
                                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        {t('finance', 'Actions')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {expenses.map((expense) => (
                                    <tr key={expense.id} className="transition hover:bg-rose-50/40">
                                        <td className="px-5 py-3.5 text-gray-600">{formatDate(expense.date)}</td>
                                        <td className="px-5 py-3.5 max-w-xs truncate text-gray-600" title={expense.notes}>
                                            {expense.notes || <span className="text-gray-300">—</span>}
                                        </td>
                                        <td className="px-5 py-3.5 text-right font-semibold text-rose-700 tabular-nums">
                                            -{formatMoney(expense.amount)}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex justify-end gap-1.5">
                                                <Link
                                                    href={route('expenses.edit', expense.id)}
                                                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-amber-600 transition hover:bg-amber-50"
                                                >
                                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                                                    </svg>
                                                    {t('buttons', 'Edit')}
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(expense)}
                                                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                                                >
                                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                    </svg>
                                                    {t('buttons', 'Delete')}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

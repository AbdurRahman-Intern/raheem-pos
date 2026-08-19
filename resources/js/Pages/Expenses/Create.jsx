// import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
// import { Head, Link, useForm } from '@inertiajs/react';

// export default function ExpenseCreate() {
//     const { data, setData, post, processing, errors } = useForm({
//         date: new Date().toISOString().slice(0, 10),
//         amount: '',
//         notes: '',
//     });

//     const submit = (e) => {
//         e.preventDefault();
//         post(route('expenses.store'));
//     };

//     return (
//         <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Create Expense</h2>}>
//             <Head title="Create Expense" />
//             <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
//                 <div className="rounded-xl bg-white p-6 shadow-sm">
//                     <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
//                         <div>
//                             <label className="mb-1 block text-sm font-medium">Date</label>
//                             <input type="date" value={data.date} onChange={(e) => setData('date', e.target.value)} className="w-full rounded border px-3 py-2" />
//                             {errors.date && <div className="mt-1 text-sm text-rose-600">{errors.date}</div>}
//                         </div>
//                         <div>
//                             <label className="mb-1 block text-sm font-medium">Amount</label>
//                             <input type="number" step="0.01" value={data.amount} onChange={(e) => setData('amount', e.target.value)} className="w-full rounded border px-3 py-2" />
//                             {errors.amount && <div className="mt-1 text-sm text-rose-600">{errors.amount}</div>}
//                         </div>
//                         <div className="md:col-span-2">
//                             <label className="mb-1 block text-sm font-medium">Notes</label>
//                             <textarea value={data.notes} onChange={(e) => setData('notes', e.target.value)} className="w-full rounded border px-3 py-2" rows="4" />
//                         </div>
//                         <div className="md:col-span-2 flex gap-3">
//                             <button type="submit" disabled={processing} className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Save Expense</button>
//                             <Link href={route('expenses.index')} className="rounded border px-4 py-2 text-sm font-semibold">Cancel</Link>
//                         </div>
//                     </form>
//                 </div>
//             </div>
//         </AuthenticatedLayout>
//     );
// }


import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTrans } from '@/lib/trans';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ExpenseCreate() {
    const t = useTrans();

    const { data, setData, post, processing, errors } = useForm({
        date: new Date().toISOString().slice(0, 10),
        amount: '',
        notes: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('expenses.store'));
    };

    const previewAmount = data.amount
        ? new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
            Number(data.amount)
        )
        : '0.00';

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <nav className="mb-1 flex items-center gap-1.5 text-xs text-gray-400">
                        <Link href={route('expenses.index')} className="hover:text-gray-600">
                            {t('finance', 'Expenses')}
                        </Link>
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                        </svg>
                        <span className="text-gray-500">{t('finance', 'New Expense')}</span>
                    </nav>
                    <h2 className="text-xl font-semibold text-gray-800">{t('finance', 'New Expense')}</h2>
                </div>
            }
        >
            <Head title={t('finance', 'New Expense')} />

            <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                <form onSubmit={submit}>
                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                        {/* Rose accent header — mirrors the Expenses tab color */}
                        <div className="flex items-center gap-3 border-b border-rose-100 bg-rose-50 px-6 py-5">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100">
                                <svg className="h-5 w-5 text-rose-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5v-15m0 0-6 6m6-6 6 6" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-rose-800">{t('finance', 'New Expense')}</p>
                                <p className="text-xs text-rose-500">
                                    {t('finance', 'Record money going out — bills, supplies, or other costs')}
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-6 p-6 sm:grid-cols-2">
                            {/* Date */}
                            <div>
                                <label htmlFor="date" className="mb-1.5 block text-sm font-medium text-gray-700">
                                    {t('finance', 'Date')}
                                </label>
                                <div className="relative">
                                    <svg
                                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                                        />
                                    </svg>
                                    <input
                                        id="date"
                                        type="date"
                                        value={data.date}
                                        onChange={(e) => setData('date', e.target.value)}
                                        className={`w-full rounded-lg border py-2.5 pl-10 pr-3 text-sm shadow-sm transition focus:ring-2 focus:ring-offset-0 ${errors.date
                                                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                                                : 'border-gray-300 focus:border-rose-500 focus:ring-rose-100'
                                            }`}
                                    />
                                </div>
                                {errors.date && <p className="mt-1.5 text-xs text-rose-600">{errors.date}</p>}
                            </div>

                            {/* Amount */}
                            <div>
                                <label htmlFor="amount" className="mb-1.5 block text-sm font-medium text-gray-700">
                                    {t('finance', 'Amount')}
                                </label>
                                <div className="relative">
                                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">
                                        ؋
                                    </span>
                                    <input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        inputMode="decimal"
                                        placeholder="0.00"
                                        value={data.amount}
                                        onChange={(e) => setData('amount', e.target.value)}
                                        className={`w-full rounded-lg border py-2.5 pl-8 pr-3 text-sm font-semibold shadow-sm transition focus:ring-2 focus:ring-offset-0 ${errors.amount
                                                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                                                : 'border-gray-300 focus:border-rose-500 focus:ring-rose-100'
                                            }`}
                                    />
                                </div>
                                {errors.amount ? (
                                    <p className="mt-1.5 text-xs text-rose-600">{errors.amount}</p>
                                ) : (
                                    <p className="mt-1.5 text-xs text-gray-400">
                                        {t('finance', 'Preview')}: <span className="font-semibold text-rose-600">-{previewAmount}</span>
                                    </p>
                                )}
                            </div>

                            {/* Notes */}
                            <div className="sm:col-span-2">
                                <div className="mb-1.5 flex items-center justify-between">
                                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                                        {t('finance', 'Notes')}
                                    </label>
                                    <span className="text-xs text-gray-400">
                                        {data.notes.length}/500
                                    </span>
                                </div>
                                <textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value.slice(0, 500))}
                                    rows="4"
                                    placeholder={t('finance', 'What was this expense for? (optional)')}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm transition focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
                                />
                                {errors.notes && <p className="mt-1.5 text-xs text-rose-600">{errors.notes}</p>}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
                            <Link
                                href={route('expenses.index')}
                                className="rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-100"
                            >
                                {t('buttons', 'Cancel')}
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {processing && (
                                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
                                    </svg>
                                )}
                                {t('finance', 'Save Expense')}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
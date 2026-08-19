// import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
// import { Head, Link } from '@inertiajs/react';

// export default function SaleIndex({ sales }) {
//     return (
//         <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Sales</h2>}>
//             <Head title="Sales" />
//             <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
//                 <div className="mb-4 flex justify-end">
//                     <Link href={route('sales.create')} className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
//                         New Sale
//                     </Link>
//                 </div>
//                 <div className="overflow-hidden rounded-xl bg-white shadow-sm">
//                     <table className="min-w-full divide-y divide-gray-200 text-sm">
//                         <thead className="bg-gray-50">
//                             <tr>
//                                 <th className="px-4 py-3 text-left">Invoice</th>
//                                 <th className="px-4 py-3 text-left">Customer</th>
//                                 <th className="px-4 py-3 text-left">Total</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {sales.map((sale) => (
//                                 <tr key={sale.id}>
//                                     <td className="px-4 py-3">{sale.invoice_number}</td>
//                                     <td className="px-4 py-3">{sale.customer?.name || 'Walk-in'}</td>
//                                     <td className="px-4 py-3">{sale.total}</td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//         </AuthenticatedLayout>
//     );
// }


import { useState, useEffect, useMemo, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTrans } from '@/lib/trans';
import { usePage } from '@inertiajs/react';

export default function Index({ sales, filters }) {
    const t = useTrans();

    const { flash } = usePage().props

    useEffect(() => {
        if (flash?.print) {
            const timer = setTimeout(() => window.print(), 300); // let content paint first
            return () => clearTimeout(timer);
        }
    }, [flash?.print])

    // console.log(sales)

    const [search, setSearch] = useState(filters?.search ?? '');
    const [invoiceType, setInvoiceType] = useState(filters?.invoice_type ?? '');
    const [confirmingId, setConfirmingId] = useState(null);
    const isFirstRun = useRef(true);

    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }

        const timeout = setTimeout(() => {
            router.get(
                route('sales.index'),
                { search: search || undefined, invoice_type: invoiceType || undefined },
                { preserveState: true, preserveScroll: true, replace: true }
            );
        }, 350);

        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, invoiceType]);

    const rows = sales?.data ?? [];
    const links = sales?.links ?? [];
    const hasFilters = search !== '' || invoiceType !== '';

    const formatMoney = (value) =>
        new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
            Number(value ?? 0)
        );

    const invoiceTypeBadge = useMemo(
        () => ({
            wholesale: 'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/20',
            retail: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20',
        }),
        []
    );

    const balanceTone = (remaining) => {
        const value = Number(remaining ?? 0);
        if (value <= 0) return 'text-emerald-600';
        return 'text-rose-600';
    };

    const clearFilters = () => {
        setSearch('');
        setInvoiceType('');
    };

    const handleDelete = (id) => {
        router.delete(route('sales.destroy', id), {
            preserveScroll: true,
            onSuccess: () => setConfirmingId(null),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold leading-tight text-gray-800">
                            {t('sales', 'Sales Invoices')}
                        </h2>
                        <p className="mt-0.5 text-sm text-gray-500">
                            {t('sales', 'Manage wholesale and retail invoices')}
                        </p>
                    </div>
                    <Link
                        href={route('sales.create')}
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        {t('buttons', 'Create Invoice')}
                    </Link>
                </div>
            }
        >
            <Head title={t('sales', 'Sales Invoices')} />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        {/* Toolbar */}
                        <div className="flex flex-col gap-3 border-b border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="relative w-full sm:max-w-xs">
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
                                        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                                    />
                                </svg>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder={t('sales', 'Search invoice, customer, phone...')}
                                    className="w-full rounded-lg border-gray-300 py-2 pl-9 pr-3 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                {[
                                    { value: '', label: t('sales', 'All Types') },
                                    { value: 'wholesale', label: t('sales', 'Wholesale') },
                                    { value: 'retail', label: t('sales', 'Retail') },
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setInvoiceType(option.value)}
                                        className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${invoiceType === option.value
                                            ? 'bg-gray-900 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}

                                {hasFilters && (
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-500"
                                    >
                                        {t('buttons', 'Clear')}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Table */}
                        {rows.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                {t('sales', 'Invoice #')}
                                            </th>
                                            <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                {t('sales', 'Type')}
                                            </th>
                                            <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                {t('sales', 'Customer')}
                                            </th>
                                            <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                {t('sales', 'Grand Total')}
                                            </th>
                                            <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                {t('sales', 'Paid')}
                                            </th>
                                            <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                {t('sales', 'Remaining')}
                                            </th>
                                            <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                {t('sales', 'Date')}
                                            </th>
                                            <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                {t('sales', 'Actions')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {rows.map((sale) => (
                                            <tr key={sale.id} className="transition hover:bg-gray-50">
                                                <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900">
                                                    {sale.invoice_number}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-3">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ${invoiceTypeBadge[sale.invoice_type] ??
                                                            'bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-500/20'
                                                            }`}
                                                    >
                                                        {sale.invoice_type === 'wholesale'
                                                            ? t('sales', 'Wholesale')
                                                            : t('sales', 'Retail')}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                                                    <div className="font-medium text-gray-900">
                                                        {sale.customer?.name ?? sale.customer_name ?? t('sales', 'Walk-in Customer')}
                                                    </div>
                                                    {(sale.customer?.phone ?? sale.customer_phone) && (
                                                        <div className="text-xs text-gray-400">
                                                            {sale.customer?.phone ?? sale.customer_phone}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-semibold text-gray-900">
                                                    {formatMoney(sale.grand_total)}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-700">
                                                    {formatMoney(sale.paid_amount)}
                                                </td>
                                                <td
                                                    className={`whitespace-nowrap px-4 py-3 text-right text-sm font-semibold ${balanceTone(
                                                        sale.remaining_balance
                                                    )}`}
                                                >
                                                    {formatMoney(sale.remaining_balance)}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                                                    {sale.created_at
                                                        ? new Date(sale.created_at).toLocaleDateString()
                                                        : '—'}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Link
                                                            href={route('sales.show', sale.id)}
                                                            className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                                                            title={t('buttons', 'View')}
                                                        >
                                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                            </svg>
                                                        </Link>
                                                        <Link
                                                            // href={route('sales.edit', sale.id)}
                                                            className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-indigo-600"
                                                            title={t('buttons', 'Edit')}
                                                        >
                                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                                                            </svg>
                                                        </Link>

                                                        {confirmingId === sale.id ? (
                                                            <div className="flex items-center gap-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDelete(sale.id)}
                                                                    className="rounded-md bg-rose-600 px-2 py-1 text-xs font-semibold text-white hover:bg-rose-500"
                                                                >
                                                                    {t('buttons', 'Confirm')}
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setConfirmingId(null)}
                                                                    className="rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-200"
                                                                >
                                                                    {t('buttons', 'Cancel')}
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() => setConfirmingId(sale.id)}
                                                                className="rounded-md p-1.5 text-gray-400 transition hover:bg-rose-50 hover:text-rose-600"
                                                                title={t('buttons', 'Delete')}
                                                            >
                                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                                </svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                                    <svg className="h-7 w-7 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.096 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
                                    </svg>
                                </div>
                                <h3 className="mt-4 text-sm font-semibold text-gray-900">
                                    {hasFilters ? t('sales', 'No invoices match your filters') : t('sales', 'No invoices yet')}
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {hasFilters
                                        ? t('sales', 'Try adjusting your search or filter criteria')
                                        : t('sales', 'Get started by creating your first invoice')}
                                </p>
                                {hasFilters ? (
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-500"
                                    >
                                        {t('buttons', 'Clear Filters')}
                                    </button>
                                ) : (
                                    <Link
                                        href={route('sales.create')}
                                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                                    >
                                        {t('buttons', 'Create Invoice')}
                                    </Link>
                                )}
                            </div>
                        )}

                        {/* Pagination */}
                        {rows.length > 0 && links.length > 3 && (
                            <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-200 px-4 py-3 sm:flex-row">
                                <p className="text-sm text-gray-500">
                                    {t('sales', 'Showing')}{' '}
                                    <span className="font-medium text-gray-700">{sales.from ?? 0}</span>{' '}
                                    {t('sales', 'to')}{' '}
                                    <span className="font-medium text-gray-700">{sales.to ?? 0}</span>{' '}
                                    {t('sales', 'of')}{' '}
                                    <span className="font-medium text-gray-700">{sales.total ?? 0}</span>{' '}
                                    {t('sales', 'results')}
                                </p>
                                <div className="flex flex-wrap items-center gap-1">
                                    {links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url ?? '#'}
                                            preserveScroll
                                            preserveState
                                            className={`min-w-[2rem] rounded-md px-3 py-1.5 text-center text-sm font-medium transition ${link.active
                                                ? 'bg-indigo-600 text-white'
                                                : link.url
                                                    ? 'text-gray-600 hover:bg-gray-100'
                                                    : 'cursor-not-allowed text-gray-300'
                                                }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

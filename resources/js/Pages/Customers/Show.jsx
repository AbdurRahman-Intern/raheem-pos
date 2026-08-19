import { useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTrans } from '@/lib/trans';
import { Head, Link } from '@inertiajs/react';

const initials = (name = '') =>
    name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('');

export default function CustomerShow({ customer, sales = [] }) {
    const t = useTrans();

    const formatMoney = (value) =>
        new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
            Number(value ?? 0)
        );

    const balance = Number(customer.baqaya ?? 0);
    const isActive = customer.is_active ?? true;

    const stats = useMemo(() => {
        const totalInvoices = sales.length;
        const totalBilled = sales.reduce((sum, sale) => sum + Number(sale.grand_total ?? 0), 0);
        const totalOutstanding = sales.reduce((sum, sale) => sum + Number(sale.remaining_balance ?? 0), 0);
        return { totalInvoices, totalBilled, totalOutstanding };
    }, [sales]);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <nav className="mb-1 flex items-center gap-1.5 text-xs text-gray-400">
                            <Link href={route('customers.index')} className="hover:text-gray-600">
                                {t('customers', 'customers')}
                            </Link>
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                            </svg>
                            <span className="text-gray-500">{customer.name}</span>
                        </nav>
                        <h2 className="text-lg font-semibold leading-tight text-gray-800">{customer.name}</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href={route('customers.edit', customer.id)}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                            </svg>
                            {t('buttons', 'edit')}
                        </Link>
                        <Link
                            href={route('sales.create')}
                            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            {t('sales', 'Create Invoice')}
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={customer.name} />

            <div className="py-8">
                <div className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">
                    {/* Profile + stats */}
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Profile card */}
                        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-1">
                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-indigo-50 text-lg font-semibold text-indigo-600">
                                    {initials(customer.name) || '—'}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="truncate text-base font-semibold text-gray-900">
                                        {customer.name}
                                    </h3>
                                    <span
                                        className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                            isActive
                                                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
                                                : 'bg-gray-100 text-gray-500 ring-1 ring-inset ring-gray-500/20'
                                        }`}
                                    >
                                        {isActive ? t('customers', 'active') : t('customers', 'inactive')}
                                    </span>
                                </div>
                            </div>

                            <dl className="mt-6 space-y-4 border-t border-gray-100 pt-5">
                                <div className="flex items-start gap-3">
                                    <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                                    </svg>
                                    <div>
                                        <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                            {t('customers', 'phone')}
                                        </dt>
                                        <dd className="text-sm text-gray-700">
                                            {customer.phone || <span className="text-gray-300">—</span>}
                                        </dd>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                                    </svg>
                                    <div>
                                        <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                            {t('customers', 'address')}
                                        </dt>
                                        <dd className="text-sm text-gray-700">
                                            {customer.address || <span className="text-gray-300">—</span>}
                                        </dd>
                                    </div>
                                </div>

                                {customer.notes && (
                                    <div className="flex items-start gap-3">
                                        <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487 18.549 2.8a2.25 2.25 0 1 1 3.182 3.182L13.5 14.212l-4.5 1.5 1.5-4.5 8.362-8.225Z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12.75v6.375a2.25 2.25 0 0 1-2.25 2.25H5.25a2.25 2.25 0 0 1-2.25-2.25V6.75a2.25 2.25 0 0 1 2.25-2.25h6.375" />
                                        </svg>
                                        <div>
                                            <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                                {t('customers', 'notes')}
                                            </dt>
                                            <dd className="text-sm text-gray-700">{customer.notes}</dd>
                                        </div>
                                    </div>
                                )}
                            </dl>

                            <div
                                className={`mt-6 rounded-lg px-4 py-3 ${
                                    balance === 0
                                        ? 'bg-gray-50'
                                        : balance > 0
                                        ? 'bg-rose-50'
                                        : 'bg-emerald-50'
                                }`}
                            >
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                    {t('customers', 'current_balance')}
                                </p>
                                <p
                                    className={`mt-1 text-xl font-bold ${
                                        balance === 0
                                            ? 'text-gray-700'
                                            : balance > 0
                                            ? 'text-rose-600'
                                            : 'text-emerald-600'
                                    }`}
                                >
                                    {formatMoney(Math.abs(balance))}
                                </p>
                                {balance !== 0 && (
                                    <p className="mt-0.5 text-xs text-gray-500">
                                        {balance > 0 ? t('customers', 'owes_us') : t('customers', 'we_owe')}
                                    </p>
                                )}
                            </div>
                        </section>

                        {/* Stats */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-2 lg:grid-rows-[auto_1fr]">
                            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                    {t('customers', 'total_invoices')}
                                </p>
                                <p className="mt-2 text-2xl font-bold text-gray-900">{stats.totalInvoices}</p>
                            </div>
                            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                    {t('customers', 'total_billed')}
                                </p>
                                <p className="mt-2 text-2xl font-bold text-gray-900">
                                    {formatMoney(stats.totalBilled)}
                                </p>
                            </div>
                            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                    {t('customers', 'outstanding')}
                                </p>
                                <p
                                    className={`mt-2 text-2xl font-bold ${
                                        stats.totalOutstanding > 0 ? 'text-rose-600' : 'text-emerald-600'
                                    }`}
                                >
                                    {formatMoney(stats.totalOutstanding)}
                                </p>
                            </div>

                            {/* Sales history */}
                            <section className="rounded-xl border border-gray-200 bg-white shadow-sm sm:col-span-3">
                                <div className="border-b border-gray-100 px-5 py-4">
                                    <h3 className="text-sm font-semibold text-gray-900">
                                        {t('customers', 'sales_history')}
                                    </h3>
                                </div>

                                {sales.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="whitespace-nowrap px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                        {t('sales', 'Invoice #')}
                                                    </th>
                                                    <th className="whitespace-nowrap px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                        {t('sales', 'Date')}
                                                    </th>
                                                    <th className="whitespace-nowrap px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                        {t('sales', 'Grand Total')}
                                                    </th>
                                                    <th className="whitespace-nowrap px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                        {t('sales', 'Remaining')}
                                                    </th>
                                                    <th className="whitespace-nowrap px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                        {t('sales', 'Actions')}
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {sales.map((sale) => (
                                                    <tr key={sale.id} className="transition hover:bg-gray-50">
                                                        <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900">
                                                            {sale.invoice_number}
                                                        </td>
                                                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                                                            {sale.created_at
                                                                ? new Date(sale.created_at).toLocaleDateString()
                                                                : '—'}
                                                        </td>
                                                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-gray-900">
                                                            {formatMoney(sale.grand_total)}
                                                        </td>
                                                        <td
                                                            className={`whitespace-nowrap px-4 py-3 text-right text-sm font-semibold ${
                                                                Number(sale.remaining_balance) > 0
                                                                    ? 'text-rose-600'
                                                                    : 'text-emerald-600'
                                                            }`}
                                                        >
                                                            {formatMoney(sale.remaining_balance)}
                                                        </td>
                                                        <td className="whitespace-nowrap px-4 py-3 text-right">
                                                            <Link
                                                                href={route('sales.show', sale.id)}
                                                                className="text-sm font-semibold text-indigo-600 hover:text-indigo-500"
                                                            >
                                                                {t('buttons', 'view')}
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
                                        <p className="text-sm text-gray-500">
                                            {t('customers', 'no_sales_for_customer')}
                                        </p>
                                    </div>
                                )}
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
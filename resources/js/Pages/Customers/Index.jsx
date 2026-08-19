// import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
// import { Head, Link, router } from '@inertiajs/react';

// export default function CustomerIndex({ customers }) {
//     const handleDelete = (customer) => {
//         if (window.confirm('Delete this customer?')) {
//             router.delete(route('customers.destroy', customer.id));
//         }
//     };

//     return (
//         <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Customers</h2>}>
//             <Head title="Customers" />
//             <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
//                 <div className="mb-4 flex justify-end">
//                     <Link href={route('customers.create')} className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
//                         New Customer
//                     </Link>
//                 </div>
//                 <div className="overflow-hidden rounded-xl bg-white shadow-sm">
//                     <table className="min-w-full divide-y divide-gray-200 text-sm">
//                         <thead className="bg-gray-50">
//                             <tr>
//                                 <th className="px-4 py-3 text-left">Name</th>
//                                 <th className="px-4 py-3 text-left">Phone</th>
//                                 <th className="px-4 py-3 text-left">Address</th>
//                                 <th className="px-4 py-3 text-left">Actions</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {customers.map((customer) => (
//                                 <tr key={customer.id}>
//                                     <td className="px-4 py-3">{customer.name}</td>
//                                     <td className="px-4 py-3">{customer.phone}</td>
//                                     <td className="px-4 py-3">{customer.address}</td>
//                                     <td className="px-4 py-3">
//                                         <div className="flex gap-2">
//                                             <Link href={route('customers.edit', customer.id)} className="rounded bg-amber-500 px-3 py-1.5 text-white">Edit</Link>
//                                             <button type="button" onClick={() => handleDelete(customer)} className="rounded bg-rose-600 px-3 py-1.5 text-white">Delete</button>
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


import { useMemo, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTrans } from '@/lib/trans';
import { Head, Link, router } from '@inertiajs/react';

const initials = (name = '') =>
    name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('');

export default function CustomerIndex({ customers }) {
    const t = useTrans();

    console.log(customers)

    const [search, setSearch] = useState('');
    const [confirmingId, setConfirmingId] = useState(null);

    const formatMoney = (value) =>
        new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
            Number(value ?? 0)
        );

    const filteredCustomers = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return customers;

        return customers.filter((customer) =>
            [customer.name, customer.phone, customer.address]
                .filter(Boolean)
                .some((field) => field.toLowerCase().includes(query))
        );
    }, [customers, search]);

    const handleDelete = (customer) => {
        router.delete(route('customers.destroy', customer.id), {
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
                            {t('customers', 'customers')}
                        </h2>
                        <p className="mt-0.5 text-sm text-gray-500">
                            {t('customers', 'manage_your_customers')}
                        </p>
                    </div>
                    <Link
                        href={route('customers.create')}
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        {t('buttons', 'new_customer')}
                    </Link>
                </div>
            }
        >
            <Head title={t('customers', 'customers')} />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
                                    placeholder={t('customers', 'search_customers')}
                                    className="w-full rounded-lg border-gray-300 py-2 pl-9 pr-3 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                            <p className="text-sm text-gray-500">
                                {filteredCustomers.length} {t('customers', 'customers').toLowerCase()}
                            </p>
                        </div>

                        {/* Table */}
                        {filteredCustomers.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                {t('customers', 'name')}
                                            </th>
                                            <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                {t('customers', 'phone')}
                                            </th>
                                            <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                {t('customers', 'address')}
                                            </th>
                                            <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                {t('customers', 'balance_type')}
                                            </th>
                                            <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                {t('customers', 'balance')}
                                            </th>
                                            <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                {t('customers', 'status')}
                                            </th>
                                            <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                {t('customers', 'actions')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {filteredCustomers.map((customer) => {
                                            const balance = Number(customer.baqaya ?? 0);
                                            const isActive = customer.is_active ?? true;

                                            return (
                                                <tr key={customer.id} className="transition hover:bg-gray-50">
                                                    <td className="whitespace-nowrap px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-600">
                                                                {initials(customer.name) || '—'}
                                                            </div>
                                                            <span className="text-sm font-semibold text-gray-900">
                                                                {customer.name}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                                                        {customer.phone || (
                                                            <span className="text-gray-300">—</span>
                                                        )}
                                                    </td>
                                                    <td className="max-w-xs truncate px-4 py-3 text-sm text-gray-600">
                                                        {customer.address || (
                                                            <span className="text-gray-300">—</span>
                                                        )}
                                                    </td>
                                                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                                                        {
                                                            customer?.balance_type === 'debit' ?
                                                                <span className='text-rose-600'>{t('customers', 'customer_owes_us')}</span> :
                                                                <span className='text-green-600'>
                                                                    {t('customers', 'we_owe_customer')}
                                                                </span>
                                                        }
                                                    </td>
                                                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                                                        {balance === 0 ? (
                                                            <span className="text-gray-400">{formatMoney(0)}</span>
                                                        ) : (
                                                            <span
                                                                className={`font-semibold ${customer?.balance_type === 'debit' ? 'text-rose-600' : 'text-green-600'} text-emerald-600`}
                                                            >
                                                                {formatMoney(Math.abs(balance))}

                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="whitespace-nowrap px-4 py-3">
                                                        <span
                                                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${isActive
                                                                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
                                                                : 'bg-gray-100 text-gray-500 ring-1 ring-inset ring-gray-500/20'
                                                                }`}
                                                        >
                                                            {isActive ? t('customers', 'active') : t('customers', 'inactive')}
                                                        </span>
                                                    </td>
                                                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Link
                                                                href={route('customers.edit', customer.id)}
                                                                className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-indigo-600"
                                                                title={t('buttons', 'edit')}
                                                            >
                                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                                                                </svg>
                                                            </Link>

                                                            {confirmingId === customer.id ? (
                                                                <div className="flex items-center gap-1">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleDelete(customer)}
                                                                        className="rounded-md bg-rose-600 px-2 py-1 text-xs font-semibold text-white hover:bg-rose-500"
                                                                    >
                                                                        {t('buttons', 'confirm')}
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setConfirmingId(null)}
                                                                        className="rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-200"
                                                                    >
                                                                        {t('buttons', 'cancel')}
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setConfirmingId(customer.id)}
                                                                    className="rounded-md p-1.5 text-gray-400 transition hover:bg-rose-50 hover:text-rose-600"
                                                                    title={t('buttons', 'delete')}
                                                                >
                                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                                    </svg>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                                    <svg className="h-7 w-7 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                    </svg>
                                </div>
                                <h3 className="mt-4 text-sm font-semibold text-gray-900">
                                    {search
                                        ? t('customers', 'no_customers_match_search')
                                        : t('customers', 'no_customers_yet')}
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {search
                                        ? t('customers', 'try_a_different_search')
                                        : t('customers', 'get_started_by_adding_customer')}
                                </p>
                                {search ? (
                                    <button
                                        type="button"
                                        onClick={() => setSearch('')}
                                        className="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-500"
                                    >
                                        {t('buttons', 'clear_search')}
                                    </button>
                                ) : (
                                    <Link
                                        href={route('customers.create')}
                                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                                    >
                                        {t('buttons', 'new_customer')}
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

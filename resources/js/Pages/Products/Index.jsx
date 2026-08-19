// import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
// import { useTrans } from '@/lib/trans';
// import { Head, Link, router, usePage } from '@inertiajs/react';

// export default function ProductIndex({ products, filters, lowStockProducts }) {
//     const handleDelete = (product) => {
//         if (window.confirm('Delete this product?')) {
//             router.delete(route('products.destroy', product.id));
//         }
//     };

//     const t = useTrans()
//     const { translation } = usePage().props;

// console.log(translation);

//     return (
//         <AuthenticatedLayout
//             header={<h2 className="text-xl font-semibold text-gray-800">{t('pages', 'products')}</h2>}
//         >
//             <Head title="Products" />

//             <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
//                 <div className="rounded-xl bg-white p-6 shadow-sm">
//                     <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
//                         <div>
//                             <h3 className="text-lg font-semibold">Inventory Overview</h3>
//                             <p className="text-sm text-gray-500">Search, manage, and monitor stock levels.</p>
//                         </div>
//                         <Link
//                             href={route('products.create')}
//                             className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
//                         >
//                             New Product
//                         </Link>
//                     </div>

//                     <div className="grid gap-3 md:grid-cols-3">
//                         <div className="rounded-lg border border-gray-200 p-4">
//                             <p className="text-sm text-gray-500">Total Products</p>
//                             <p className="text-2xl font-bold">{products.length}</p>
//                         </div>
//                         <div className="rounded-lg border border-gray-200 p-4">
//                             <p className="text-sm text-gray-500">Low Stock Alerts</p>
//                             <p className="text-2xl font-bold">{lowStockProducts.length}</p>
//                         </div>
//                         <div className="rounded-lg border border-gray-200 p-4">
//                             <p className="text-sm text-gray-500">Search</p>
//                             <p className="text-sm font-medium">{filters.search || 'All products'}</p>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="overflow-hidden rounded-xl bg-white shadow-sm">
//                     <div className="overflow-x-auto">
//                         <table className="min-w-full divide-y divide-gray-200 text-sm">
//                             <thead className="bg-gray-50">
//                                 <tr>
//                                     <th className="px-4 py-3 text-left font-semibold">Name</th>
//                                     <th className="px-4 py-3 text-left font-semibold">SKU</th>
//                                     <th className="px-4 py-3 text-left font-semibold">Stock</th>
//                                     <th className="px-4 py-3 text-left font-semibold">Sell Price</th>
//                                     <th className="px-4 py-3 text-left font-semibold">Status</th>
//                                     <th className="px-4 py-3 text-left font-semibold">Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="divide-y divide-gray-100">
//                                 {products.map((product) => (
//                                     <tr key={product.id}>
//                                         <td className="px-4 py-3">{product.name}</td>
//                                         <td className="px-4 py-3">{product.sku}</td>
//                                         <td className="px-4 py-3">{product.stock}</td>
//                                         <td className="px-4 py-3">{product.sell_price}</td>
//                                         <td className="px-4 py-3">{product.status}</td>
//                                         <td className="px-4 py-3">
//                                             <div className="flex gap-2">
//                                                 <Link
//                                                     href={route('products.edit', product.id)}
//                                                     className="rounded bg-amber-500 px-3 py-1.5 text-white"
//                                                 >
//                                                     Edit
//                                                 </Link>
//                                                 <button
//                                                     type="button"
//                                                     onClick={() => handleDelete(product)}
//                                                     className="rounded bg-rose-600 px-3 py-1.5 text-white"
//                                                 >
//                                                     Delete
//                                                 </button>
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>
//             </div>
//         </AuthenticatedLayout>
//     );
// }


import { useEffect, useRef, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTrans } from '@/lib/trans';
import { Head, Link, router } from '@inertiajs/react';

export default function ProductIndex({ products, filters, lowStockProducts }) {
    const t = useTrans();

    const [search, setSearch] = useState(filters?.search ?? '');
    const [confirmingId, setConfirmingId] = useState(null);
    const isFirstRun = useRef(true);

    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }

        const timeout = setTimeout(() => {
            router.get(
                route('products.index'),
                { search: search || undefined },
                { preserveState: true, preserveScroll: true, replace: true }
            );
        }, 350);

        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const lowStockIds = new Set((lowStockProducts ?? []).map((p) => p.id));

    const formatMoney = (value) =>
        new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
            Number(value ?? 0)
        );

    const handleDelete = (product) => {
        router.delete(route('products.destroy', product.id), {
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
                            {t('products', 'products')}
                        </h2>
                        <p className="mt-0.5 text-sm text-gray-500">
                            {t('products', 'search_manage_monitor_stock')}
                        </p>
                    </div>
                    <Link
                        href={route('products.create')}
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        {t('buttons', 'new_product')}
                    </Link>
                </div>
            }
        >
            <Head title={t('products', 'products')} />

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    {/* KPI cards */}
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-8.25 4.5L3.75 7.5M20.25 7.5l-8.25-4.5L3.75 7.5M20.25 7.5v9l-8.25 4.5m-8.25-4.5v-9m8.25 13.5v-9" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                        {t('products', 'total_products')}
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                        {t('products', 'low_stock_alerts')}
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {(lowStockProducts ?? []).length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                    </svg>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                        {t('products', 'active_filter')}
                                    </p>
                                    <p className="truncate text-sm font-semibold text-gray-700">
                                        {filters?.search || t('products', 'all_products')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-200 p-4">
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
                                    placeholder={t('products', 'search_products')}
                                    className="w-full rounded-lg border-gray-300 py-2 pl-9 pr-3 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        {products.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                {t('products', 'name')}
                                            </th>
                                            <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                {t('products', 'sku')}
                                            </th>
                                            <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                {t('products', 'stock')}
                                            </th>
                                            <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                {t('products', 'sell_price')}
                                            </th>
                                            <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                {t('products', 'status')}
                                            </th>
                                            <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                {t('products', 'actions')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {products.map((product) => {
                                            const isLowStock = lowStockIds.has(product.id);
                                            const isActive = product.status === 'active';

                                            return (
                                                <tr key={product.id} className="transition hover:bg-gray-50">
                                                    <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900">
                                                        {product.name}
                                                    </td>
                                                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                                                        {product.sku || <span className="text-gray-300">—</span>}
                                                    </td>
                                                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                                                        <span
                                                            className={`font-semibold ${isLowStock ? 'text-rose-600' : 'text-gray-700'
                                                                }`}
                                                        >
                                                            {product.stock}
                                                        </span>
                                                        {isLowStock && (
                                                            <span className="ml-1.5 inline-flex items-center rounded-full bg-rose-50 px-1.5 py-0.5 text-[10px] font-semibold text-rose-600">
                                                                {t('products', 'low')}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-gray-900">
                                                        {formatMoney(product.sell_price)}
                                                    </td>
                                                    <td className="whitespace-nowrap px-4 py-3">
                                                        <span
                                                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ${isActive
                                                                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
                                                                    : 'bg-gray-100 text-gray-500 ring-1 ring-inset ring-gray-500/20'
                                                                }`}
                                                        >
                                                            {isActive
                                                                ? t('products', 'active')
                                                                : t('products', 'inactive')}
                                                        </span>
                                                    </td>
                                                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Link
                                                                href={route('products.edit', product.id)}
                                                                className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-indigo-600"
                                                                title={t('buttons', 'edit')}
                                                            >
                                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                                                                </svg>
                                                            </Link>

                                                            {confirmingId === product.id ? (
                                                                <div className="flex items-center gap-1">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleDelete(product)}
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
                                                                    onClick={() => setConfirmingId(product.id)}
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
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-8.25 4.5L3.75 7.5M20.25 7.5l-8.25-4.5L3.75 7.5M20.25 7.5v9l-8.25 4.5m-8.25-4.5v-9m8.25 13.5v-9" />
                                    </svg>
                                </div>
                                <h3 className="mt-4 text-sm font-semibold text-gray-900">
                                    {search
                                        ? t('products', 'no_products_match_search')
                                        : t('products', 'no_products_yet')}
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {search
                                        ? t('products', 'try_a_different_search')
                                        : t('products', 'get_started_by_adding_product')}
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
                                        href={route('products.create')}
                                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                                    >
                                        {t('buttons', 'new_product')}
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
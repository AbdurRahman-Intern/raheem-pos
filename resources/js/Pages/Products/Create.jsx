import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTrans } from '@/lib/trans';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect } from 'react';

export default function ProductCreate() {
    const t = useTrans();

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        buy_price: '',
        sell_price: '',
        stock: 0,
        minimum_stock: 0,
        status: 'active',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('products.store'));
    };

    const handleCartonChange = (e) => {
        const items_per_carton = Number(e.target.value) || 0

        setData({
            ...data,
            items_per_carton,
            total_individual_items: Number(data?.stock) * items_per_carton
        })

    }

    const buyPrice = Number(data.buy_price) || 0;
    const sellPrice = Number(data.sell_price) || 0;
    const margin = sellPrice - buyPrice;
    const marginPercent = buyPrice > 0 ? (margin / buyPrice) * 100 : null;

    const stock = Number(data.stock) || 0;
    // const items_per_carton = Number(data?.items_per_carton) || 1
    const minimumStock = Number(data.minimum_stock) || 0;
    const isBelowMinimum = minimumStock > 0 && stock < minimumStock;

    const formatMoney = (value) =>
        new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

    useEffect(() => {
        console.log(data)
    }, [data])

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <nav className="mb-1 flex items-center gap-1.5 text-xs text-gray-400">
                        <Link href={route('products.index')} className="hover:text-gray-600">
                            {t('products', 'products')}
                        </Link>
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                        </svg>
                        <span className="text-gray-500">{t('products', 'create_product')}</span>
                    </nav>
                    <h2 className="text-lg font-semibold leading-tight text-gray-800">
                        {t('products', 'create_product')}
                    </h2>
                </div>
            }
        >
            <Head title={t('products', 'create_product')} />

            <div className="py-8">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <form onSubmit={submit} className="space-y-6">
                        {/* Product Information */}
                        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-8.25 4.5L3.75 7.5M20.25 7.5l-8.25-4.5L3.75 7.5M20.25 7.5v9l-8.25 4.5m-8.25-4.5v-9m8.25 13.5v-9" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900">
                                        {t('products', 'product_information')}
                                    </h3>
                                    <p className="text-xs text-gray-400">
                                        {t('products', 'basic_product_details')}
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-5 p-6">
                                <div className="sm:max-w-md">
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                        {t('products', 'name')}
                                        <span className="ml-0.5 text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder={t('products', 'enter_product_name')}
                                        className={`w-full rounded-lg text-sm shadow-sm focus:ring-indigo-500 ${errors.name
                                            ? 'border-rose-300 focus:border-rose-500'
                                            : 'border-gray-300 focus:border-indigo-500'
                                            }`}
                                    />
                                    {errors.name && (
                                        <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-600">
                                            <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                                            </svg>
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                        {t('products', 'description')}
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder={t('products', 'enter_product_description')}
                                        className="w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                    {errors.description && (
                                        <p className="mt-1.5 text-xs text-rose-600">{errors.description}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                        {t('products', 'status')}
                                    </label>
                                    <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
                                        <button
                                            type="button"
                                            onClick={() => setData('status', 'active')}
                                            className={`rounded-md px-4 py-2 text-sm font-semibold transition ${data.status === 'active'
                                                ? 'bg-white text-emerald-600 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            {t('products', 'active')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setData('status', 'inactive')}
                                            className={`rounded-md px-4 py-2 text-sm font-semibold transition ${data.status === 'inactive'
                                                ? 'bg-white text-gray-600 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            {t('products', 'inactive')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Pricing & Margin */}
                        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 8.25v10.5A2.25 2.25 0 0 0 4.5 21h15a2.25 2.25 0 0 0 2.25-2.25V8.25M2.25 8.25l1.5-3h16.5l1.5 3M12 15.75a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900">
                                        {t('products', 'pricing_and_margin')}
                                    </h3>
                                    <p className="text-xs text-gray-400">
                                        {t('products', 'set_buy_and_sell_price')}
                                    </p>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                            {t('products', 'buy_price')}
                                            <span className="ml-0.5 text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.buy_price}
                                            onChange={(e) => setData('buy_price', e.target.value)}
                                            placeholder="0.00"
                                            className={`w-full rounded-lg text-sm shadow-sm focus:ring-indigo-500 ${errors.buy_price
                                                ? 'border-rose-300 focus:border-rose-500'
                                                : 'border-gray-300 focus:border-indigo-500'
                                                }`}
                                        />
                                        {errors.buy_price && (
                                            <p className="mt-1.5 text-xs text-rose-600">{errors.buy_price}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                            {t('products', 'sell_price')}
                                            <span className="ml-0.5 text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.sell_price}
                                            onChange={(e) => setData('sell_price', e.target.value)}
                                            placeholder="0.00"
                                            className={`w-full rounded-lg text-sm shadow-sm focus:ring-indigo-500 ${errors.sell_price
                                                ? 'border-rose-300 focus:border-rose-500'
                                                : 'border-gray-300 focus:border-indigo-500'
                                                }`}
                                        />
                                        {errors.sell_price && (
                                            <p className="mt-1.5 text-xs text-rose-600">{errors.sell_price}</p>
                                        )}
                                    </div>
                                </div>

                                {(buyPrice > 0 || sellPrice > 0) && (
                                    <div
                                        className={`mt-5 flex items-center justify-between rounded-lg px-4 py-3 ${margin > 0 ? 'bg-emerald-50' : margin < 0 ? 'bg-rose-50' : 'bg-gray-50'
                                            }`}
                                    >
                                        <div>
                                            <p
                                                className={`text-sm font-semibold ${margin > 0
                                                    ? 'text-emerald-700'
                                                    : margin < 0
                                                        ? 'text-rose-700'
                                                        : 'text-gray-600'
                                                    }`}
                                            >
                                                {t('products', 'profit_margin')}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {t('products', 'profit_per_unit_sold')}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p
                                                className={`text-lg font-bold ${margin > 0
                                                    ? 'text-emerald-700'
                                                    : margin < 0
                                                        ? 'text-rose-700'
                                                        : 'text-gray-700'
                                                    }`}
                                            >
                                                {formatMoney(margin)}
                                            </p>
                                            {marginPercent !== null && (
                                                <p className="text-xs text-gray-500">
                                                    {marginPercent >= 0 ? '+' : ''}
                                                    {marginPercent.toFixed(1)}%
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Inventory */}
                        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5v11.25A2.25 2.25 0 0 1 18 21H6a2.25 2.25 0 0 1-2.25-2.25V7.5M3.75 4.5h16.5v3H3.75v-3ZM10.5 12h3" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900">
                                        {t('products', 'inventory')}
                                    </h3>
                                    <p className="text-xs text-gray-400">
                                        {t('products', 'track_stock_levels')}
                                    </p>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                            {t('products', 'stock')}
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={data.stock}
                                            onChange={(e) => setData('stock', parseInt(e.target.value || 0, 10))}
                                            className={`w-full rounded-lg text-sm shadow-sm focus:ring-indigo-500 ${errors.stock
                                                ? 'border-rose-300 focus:border-rose-500'
                                                : 'border-gray-300 focus:border-indigo-500'
                                                }`}
                                        />
                                        {errors.stock && (
                                            <p className="mt-1.5 text-xs text-rose-600">{errors.stock}</p>
                                        )}
                                    </div>




                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                            {t('products', 'minimum_stock')}
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={data.minimum_stock}
                                            onChange={(e) =>
                                                setData('minimum_stock', parseInt(e.target.value || 0, 10))
                                            }
                                            className={`w-full rounded-lg text-sm shadow-sm focus:ring-indigo-500 ${errors.minimum_stock
                                                ? 'border-rose-300 focus:border-rose-500'
                                                : 'border-gray-300 focus:border-indigo-500'
                                                }`}
                                        />
                                        {errors.minimum_stock && (
                                            <p className="mt-1.5 text-xs text-rose-600">{errors.minimum_stock}</p>
                                        )}
                                    </div>
                                </div>

                                {isBelowMinimum && (
                                    <div className="mt-5 flex items-center gap-2 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
                                        <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                                        </svg>
                                        {t('products', 'stock_below_minimum_warning')}
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-5">
                            <Link
                                href={route('products.index')}
                                className="rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-100"
                            >
                                {t('buttons', 'cancel')}
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {processing && (
                                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
                                    </svg>
                                )}
                                {processing ? t('buttons', 'saving') : t('buttons', 'save_product')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
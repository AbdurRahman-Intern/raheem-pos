import { useMemo, useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTrans } from '@/lib/trans';

let uid = 0;
const nextId = () => `row-${Date.now()}-${uid++}`;

const emptyItem = () => ({
    key: nextId(),
    product_id: '',
    product_name: '',
    unit: '',
    stock: 0,
    total_items: 0,
    quantity: 1,
    unit_price: 0,
    discount: 0,

});


const toNumber = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
};

const rowTotal = (item) => {
    const gross = toNumber(item.quantity) * toNumber(item.unit_price);
    const discountPercentage = toNumber(item.discount);

    const discountAmount = gross * (discountPercentage / 100);

    const total = gross - discountAmount;

    return total > 0 ? total : 0;
};

/**
 * Shared invoice form. Used directly by the Create page and re-used by the
 * Edit page (which pre-fills `initialData` from the existing sale).
 */
export function SaleForm({ mode = 'create', sale = null, customers = [], products = [] }) {
    const t = useTrans();

    // console.log(products)
    const { user } = usePage().props.auth;

    const initialItems =
        sale?.items?.length > 0
            ? sale.items.map((item) => {
                const product = products.find((p) => p.id === item.product_id);
                return {
                    key: nextId(),
                    product_id: item.product_id ?? '',
                    product_name: product?.name ?? item.product_name ?? '',
                    unit: product?.unit ?? '',
                    stock: product?.stock ?? 0,
                    total_items: product?.total_individual_items,
                    quantity: item.quantity ?? 1,
                    unit_price: item.unit_price ?? 0,
                    discount: item.discount ?? 0,
                };
            })
            : [emptyItem()];

    const { data, setData, post, put, processing, errors, transform } = useForm({
        user_id: user?.id,
        invoice_type: sale?.invoice_type ?? 'wholesale',
        customer_id: sale?.customer_id ?? '',
        customer_name: sale?.customer_name ?? '',
        customer_phone: sale?.customer_phone ?? '',
        customer_address: sale?.customer_address ?? '',
        previous_balance: sale?.previous_balance ?? 0,
        discount: sale?.discount ?? 0,
        paid_amount: sale?.paid_amount ?? 0,
        items: initialItems,
    });

    // console.log(sale)

    const [productPicker, setProductPicker] = useState('');

    // Which button was clicked — controls what happens after a successful save.
    // 'save'       -> normal redirect (e.g. back to the invoice list)
    // 'save_print' -> redirect straight to the printable invoice view
    const [pendingAction, setPendingAction] = useState('save');

    const isWholesale = data.invoice_type === 'wholesale';

    const subtotal = useMemo(
        () => data.items.reduce((sum, item) => sum + rowTotal(item), 0),
        [data.items]
    );

    const grandTotal = useMemo(() => {
        const afterDiscount = subtotal - toNumber(data.discount);
        const withPreviousBalance = isWholesale ? afterDiscount + toNumber(data.previous_balance) : afterDiscount;
        return withPreviousBalance > 0 ? withPreviousBalance : 0;
    }, [subtotal, data.discount, data.previous_balance, isWholesale]);

    const remainingBalance = useMemo(
        () => grandTotal - toNumber(data.paid_amount),
        [grandTotal, data.paid_amount]
    );

    const formatMoney = (value) =>
        new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
            toNumber(value)
        );

    const handleInvoiceTypeChange = (type) => {
        setData((current) => ({
            ...current,
            invoice_type: type,
            customer_id: '',
            customer_name: '',
            customer_phone: '',
            customer_address: '',
            previous_balance: 0,
        }));
    };

    const handleCustomerChange = (customerId) => {
        const customer = customers.find((c) => String(c.id) === String(customerId));
        setData((current) => ({
            ...current,
            customer_id: customerId,
            customer_name: customer?.name ?? '',
            customer_phone: customer?.phone ?? '',
            customer_address: customer?.address ?? '',
            previous_balance: customer?.baqaya ?? customer?.baqaya ?? 0,
        }));
    };

    const addItemRow = (productId) => {
        const product = products.find((p) => String(p.id) === String(productId));
        setData((current) => ({
            ...current,
            items: [
                ...current.items,
                {
                    key: nextId(),
                    product_id: product?.id ?? '',
                    product_name: product?.name ?? '',
                    unit: product?.unit ?? '',
                    stock: product?.stock ?? 0,
                    total_items: product?.total_individual_items,
                    quantity: 1,
                    unit_price: product?.selling_price ?? 0,
                    discount: 0,
                },
            ],
        }));
        setProductPicker('');
    };

    const removeItemRow = (key) => {
        setData((current) => ({
            ...current,
            items: current.items.length > 1 ? current.items.filter((item) => item.key !== key) : current.items,
        }));
    };

    const updateItemField = (key, field, value) => {
        setData((current) => ({
            ...current,
            items: current.items.map((item) => (item.key === key ? { ...item, [field]: value } : item)),
        }));
    };

    const updateItemProduct = (key, productId) => {
        const product = products.find((p) => String(p.id) === String(productId));
        setData((current) => ({
            ...current,
            items: current.items.map((item) =>
                item.key === key
                    ? {
                        ...item,
                        product_id: product?.id ?? '',
                        product_name: product?.name ?? '',
                        unit: product?.unit ?? '',
                        stock: product?.stock ?? 0,
                        total_items: product?.total_individual_items,
                        unit_price: product?.selling_price ?? 0,
                    }
                    : item
            ),
        }));
    };

    const availableProducts = useMemo(
        () => products.filter((p) => !data.items.some((item) => String(item.product_id) === String(p.id))),
        [products, data.items]
    );

    /**
     * `action` is either 'save' or 'save_print' — set by whichever button
     * was clicked. We attach it to the outgoing request as `print_after_save`
     * so the backend knows to redirect to the printable view instead of the
     * normal destination.
     */
    const submit = (e, action = 'save') => {
        e.preventDefault();
        setPendingAction(action);

        transform((current) => ({
            ...current,
            subtotal,
            grand_total: grandTotal,
            remaining_balance: remainingBalance,
            print_after_save: action === 'save_print',
            items: current.items.map(({ key, product_name, unit, stock, ...item }) => ({
                ...item,
                total: rowTotal(item),
            })),
        }));

        const target = mode === 'edit' && sale?.id
            ? () => put(route('sales.update', sale.id))
            : () => post(route('sales.store'));

        target();

        // console.log(data)
    };

    return (
        <form onSubmit={(e) => submit(e, 'save')} className="space-y-6">
            {/* Invoice Information */}
            <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-5 py-4">
                    <h3 className="text-sm font-semibold text-gray-900">{t('sales', 'Invoice Information')}</h3>
                </div>
                <div className="p-5">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        {t('sales', 'Invoice Type')}
                    </label>
                    <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
                        <button
                            type="button"
                            onClick={() => handleInvoiceTypeChange('wholesale')}
                            className={`rounded-md px-4 py-2 text-sm font-semibold transition ${isWholesale ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {t('sales', 'Wholesale')}
                        </button>
                        <button
                            type="button"
                            onClick={() => handleInvoiceTypeChange('retail')}
                            className={`rounded-md px-4 py-2 text-sm font-semibold transition ${!isWholesale ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {t('sales', 'Retail')}
                        </button>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                        {isWholesale
                            ? t('sales', 'Registered customer with balance tracking and partial payments')
                            : t('sales', 'Walk-in customer, no registration required')}
                    </p>
                </div>
            </section>

            {/* Customer Information */}
            <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-5 py-4">
                    <h3 className="text-sm font-semibold text-gray-900">{t('sales', 'Customer Information')}</h3>
                </div>
                <div className="grid gap-4 p-5 sm:grid-cols-2">
                    {isWholesale ? (
                        <>
                            <div className="sm:col-span-2">
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    {t('sales', 'Customer')}
                                </label>
                                <select
                                    value={data.customer_id}
                                    onChange={(e) => handleCustomerChange(e.target.value)}
                                    className="w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="">{t('sales', 'Select a customer')}</option>
                                    {customers.map((customer) => (
                                        <option key={customer.id} value={customer.id}>
                                            {customer.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.customer_id && (
                                    <p className="mt-1 text-xs text-rose-600">{errors.customer_id}</p>
                                )}
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    {t('sales', 'Phone')}
                                </label>
                                <input
                                    type="text"
                                    value={data.customer_phone}
                                    readOnly
                                    className="w-full rounded-lg border-gray-200 bg-gray-50 text-sm text-gray-500 shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    {t('sales', 'Previous Balance')}
                                </label>
                                <input
                                    type="text"
                                    value={formatMoney(data.previous_balance)}
                                    readOnly
                                    className="w-full rounded-lg border-gray-200 bg-gray-50 text-sm font-semibold text-gray-700 shadow-sm"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    {t('sales', 'Address')}
                                </label>
                                <input
                                    type="text"
                                    value={data.customer_address}
                                    readOnly
                                    className="w-full rounded-lg border-gray-200 bg-gray-50 text-sm text-gray-500 shadow-sm"
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="sm:col-span-2">
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    {t('sales', 'Customer Name')}
                                </label>
                                <input
                                    type="text"
                                    value={data.customer_name}
                                    onChange={(e) => setData('customer_name', e.target.value)}
                                    placeholder={t('sales', 'Enter customer name')}
                                    className="w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                                {errors.customer_name && (
                                    <p className="mt-1 text-xs text-rose-600">{errors.customer_name}</p>
                                )}
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    {t('sales', 'Phone')}
                                </label>
                                <input
                                    type="text"
                                    value={data.customer_phone}
                                    onChange={(e) => setData('customer_phone', e.target.value)}
                                    placeholder={t('sales', 'Enter phone number')}
                                    className="w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    {t('sales', 'Address')}
                                </label>
                                <input
                                    type="text"
                                    value={data.customer_address}
                                    onChange={(e) => setData('customer_address', e.target.value)}
                                    placeholder={t('sales', 'Enter address')}
                                    className="w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* Products */}
            <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">{t('sales', 'Products')}</h3>
                    <div className="flex items-center gap-2">
                        <select
                            value={productPicker}
                            onChange={(e) => {
                                setProductPicker(e.target.value);
                                if (e.target.value) addItemRow(e.target.value);
                            }}
                            className="rounded-lg border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            <option value="">{t('sales', 'Select a product to add')}</option>
                            {availableProducts.map((product) => (
                                <option key={product.id} value={product.id}>
                                    {product.name} ({product.stock} {product.unit})
                                </option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={() => setData('items', [...data.items, emptyItem()])}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            {t('buttons', 'Add Product')}
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="w-10 px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    #
                                </th>
                                <th className="min-w-[210px] px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    {t('sales', 'Product')}
                                </th>
                                <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    {t('sales', 'Stock')}
                                </th>
                                <th className="px-3 py-2.5 w-28 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    {t('sales', 'Per Cutton')}
                                </th>
                                <th className="w-28 px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    {t('sales', 'Quantity')}
                                </th>
                                <th className="w-32 px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    {t('sales', 'Unit Price')}
                                </th>
                                <th className="w-28 px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    {t('sales', 'Discount')}
                                </th>
                                <th className="w-32 px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    {t('sales', 'Total')}
                                </th>
                                <th className="w-10 px-3 py-2.5"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data.items.map((item, index) => {
                                const overStock = item.product_id && toNumber(item.quantity) > toNumber(item.stock);
                                return (
                                    <tr key={item.key}>
                                        <td className="px-3 py-2 text-sm text-gray-500">{index + 1}</td>
                                        <td className="px-3 py-2">
                                            <select
                                                value={item.product_id}
                                                onChange={(e) => updateItemProduct(item.key, e.target.value)}
                                                className="w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            >
                                                <option value="">{t('sales', 'Select product')}</option>
                                                {item.product_id &&
                                                    !products.some((p) => String(p.id) === String(item.product_id)) && (
                                                        <option value={item.product_id}>{item.product_name}</option>
                                                    )}
                                                {products
                                                    .filter(
                                                        (p) =>
                                                            String(p.id) === String(item.product_id) ||
                                                            !data.items.some(
                                                                (row) => String(row.product_id) === String(p.id)
                                                            )
                                                    )
                                                    .map((product) => (
                                                        <option key={product.id} value={product.id}>
                                                            {product.name}
                                                        </option>
                                                    ))}
                                            </select>
                                            {errors[`items.${index}.product_id`] && (
                                                <p className="mt-1 text-xs text-rose-600">
                                                    {errors[`items.${index}.product_id`]}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <span
                                                className={`text-sm font-medium ${overStock ? 'text-rose-600' : 'text-gray-600'
                                                    }`}
                                            >
                                                {item.stock} {item.unit}
                                            </span>
                                        </td>

                                        <td className="px-3 py-2 text-center">
                                            <span
                                                className={`text-sm font-medium ${overStock ? 'text-rose-600' : 'text-gray-600'
                                                    }`}
                                            >

                                                {item.total_items}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2">
                                            <input
                                                type="number"
                                                min="0"
                                                step="1"
                                                value={item.quantity}
                                                onChange={(e) => updateItemField(item.key, 'quantity', e.target.value)}
                                                className={`w-full rounded-lg text-center text-sm shadow-sm focus:ring-indigo-500 ${overStock
                                                    ? 'border-rose-300 focus:border-rose-500'
                                                    : 'border-gray-300 focus:border-indigo-500'
                                                    }`}
                                            />
                                        </td>
                                        <td className="px-3 py-2">
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={item.unit_price}
                                                onChange={(e) => updateItemField(item.key, 'unit_price', e.target.value)}
                                                className="w-full rounded-lg border-gray-300 text-center text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            />
                                        </td>
                                        <td className="px-3 py-2">
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={item.discount}
                                                onChange={(e) => updateItemField(item.key, 'discount', e.target.value)}
                                                className="w-full rounded-lg border-gray-300 text-center text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            />
                                        </td>
                                        <td className="px-3 py-2 text-right text-sm font-semibold text-gray-900">
                                            {formatMoney(rowTotal(item))}
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <button
                                                type="button"
                                                onClick={() => removeItemRow(item.key)}
                                                disabled={data.items.length === 1}
                                                className="rounded-md p-1.5 text-gray-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-30"
                                                title={t('buttons', 'Remove')}
                                            >
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Payment Summary */}
                <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-100 px-5 py-4">
                        <h3 className="text-sm font-semibold text-gray-900">{t('sales', 'Payment Summary')}</h3>
                    </div>
                    <div className="space-y-3 p-5">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">{t('sales', 'Subtotal')}</span>
                            <span className="font-medium text-gray-900">{formatMoney(subtotal)}</span>
                        </div>

                        <div className="flex items-center justify-between gap-3 text-sm">
                            <label htmlFor="invoice-discount" className="text-gray-500">
                                {t('sales', 'Invoice Discount')}
                            </label>
                            <input
                                id="invoice-discount"
                                type="number"
                                min="0"
                                step="0.01"
                                value={data.discount}
                                onChange={(e) => setData('discount', e.target.value)}
                                className="w-28 rounded-lg border-gray-300 text-right text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>

                        {isWholesale && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">{t('sales', 'Previous Balance')}</span>
                                <span className="font-medium text-gray-900">
                                    {formatMoney(data.previous_balance)}
                                </span>
                            </div>
                        )}

                        <div className="border-t border-dashed border-gray-200 pt-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-gray-900">
                                    {t('sales', 'Grand Total')}
                                </span>
                                <span className="text-lg font-bold text-gray-900">{formatMoney(grandTotal)}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 text-sm">
                            <label htmlFor="paid-amount" className="text-gray-500">
                                {t('sales', 'Paid Amount')}
                            </label>
                            <input
                                id="paid-amount"
                                type="number"
                                min="0"
                                step="0.01"
                                value={data.paid_amount}
                                onChange={(e) => setData('paid_amount', e.target.value)}
                                className="w-28 rounded-lg border-gray-300 text-right text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>

                        <div
                            className={`flex items-center justify-between rounded-lg px-3 py-2.5 ${remainingBalance > 0 ? 'bg-rose-50' : 'bg-emerald-50'
                                }`}
                        >
                            <span
                                className={`text-sm font-semibold ${remainingBalance > 0 ? 'text-rose-700' : 'text-emerald-700'
                                    }`}
                            >
                                {t('sales', 'Remaining Balance')}
                            </span>
                            <span
                                className={`text-base font-bold ${remainingBalance > 0 ? 'text-rose-700' : 'text-emerald-700'
                                    }`}
                            >
                                {formatMoney(remainingBalance)}
                            </span>
                        </div>
                    </div>
                </section>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-5">
                <Link
                    href={route('sales.index')}
                    className="rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-100"
                >
                    {t('buttons', 'Cancel')}
                </Link>

                {/* Save & Print — same submit, just flags print_after_save so the
                    backend redirects to the printable invoice view instead. */}
                <button
                    type="button"
                    onClick={(e) => submit(e, 'save_print')}
                    disabled={processing}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {processing && pendingAction === 'save_print' ? (
                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
                        </svg>
                    ) : (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
                        </svg>
                    )}
                    {t('buttons', 'Save & Print')}
                </button>

                <button
                    type="submit"
                    disabled={processing}
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {processing && pendingAction === 'save' && (
                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
                        </svg>
                    )}
                    {mode === 'edit' ? t('buttons', 'Update Invoice') : t('buttons', 'Save Invoice')}
                </button>
            </div>
        </form>
    );
}

export default function Create({ customers = [], products = [] }) {
    const t = useTrans();

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-lg font-semibold leading-tight text-gray-800">
                        {t('sales', 'Create Invoice')}
                    </h2>
                    <p className="mt-0.5 text-sm text-gray-500">
                        {t('sales', 'Fill in the details below to create a new sales invoice')}
                    </p>
                </div>
            }
        >
            <Head title={t('sales', 'Create Invoice')} />

            <div className="py-8">
                <div className="mx-auto max-w-5xl sm:px-6 lg:px-8">
                    <SaleForm mode="create" customers={customers} products={products} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
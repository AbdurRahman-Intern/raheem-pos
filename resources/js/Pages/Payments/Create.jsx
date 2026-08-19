import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTrans } from '@/lib/trans';
import { Head, Link, useForm } from '@inertiajs/react';

export default function CustomerCreate({ customers = [] }) {
    const t = useTrans();

    const { data, setData, post, processing, errors } = useForm({
        customer_id: '',
        amount: 0,
        baqaya: 0,
        notes: ''
    });

    const handleCustomerChange = (customerId) => {
        const customer = customers.find((c) => String(c.id) === String(customerId));
        setData((current) => ({
            ...current,
            customer_id: customerId,
            customer_name: customer?.name ?? '',
            customer_phone: customer?.phone ?? '',
            customer_address: customer?.address ?? '',
            baqaya: customer?.baqaya ?? 0,
        }));
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('payments.store'));
    };



    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <nav className="mb-1 flex items-center gap-1.5 text-xs text-gray-400">
                            <Link href={route('payments.index')} className="hover:text-gray-600">
                                {t('payments', 'payments')}
                            </Link>
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                            </svg>
                            <span className="text-gray-500">{t('payments', 'create_payments')}</span>
                        </nav>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            {t('payments', 'create_payments')}
                        </h2>
                    </div>
                </div>
            }
        >
            <Head title={t('payments', 'create_payments')} />

            <div className="py-8">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <form onSubmit={submit} className="space-y-6">
                        {/* Customer Information */}
                        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900">
                                        {t('customers', 'customer_information')}
                                    </h3>
                                    <p className="text-xs text-gray-400">
                                        {t('customers', 'basic_contact_details')}
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-5 p-6 sm:grid-cols-2">
                                <div className="sm:col-span-2 sm:max-w-sm">
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                        {t('customers', 'name')}
                                        <span className="ml-0.5 text-rose-500">*</span>
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
                                    {errors.name && (
                                        <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-600">
                                            <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                                            </svg>
                                            {errors.name}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Financial Information */}
                        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182.553-.44 1.278-.659 2.003-.659.725 0 1.45.22 2.003.659l.879.659M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900">
                                        {t('customers', 'financial_information')}
                                    </h3>
                                    <p className="text-xs text-gray-400">
                                        {t('customers', 'starting_balance_details')}
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-5 p-6 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                        {t('customers', 'baqaya')}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.baqaya}
                                            onChange={(e) => setData('baqaya', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        />
                                    </div>
                                    {errors.baqaya && (
                                        <p className="mt-1.5 text-xs text-rose-600">{errors.baqaya}</p>
                                    )}
                                </div>



                            </div>
                        </section>

                        {/* Fixed version — see notes below for what was wrong and why */}
                        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                            {/* Header band — separated from the form body, not wrapping it */}
                            <div className="flex items-center gap-3 border-b border-gray-100 bg-indigo-50 px-6 py-4">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100">
                                    <svg className="h-4.5 w-4.5 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-indigo-800">{t('customers', 'Balance Adjustment')}</p>
                                    <p className="text-xs text-indigo-500">
                                        {t('customers', 'Update this customer’s outstanding balance (baqaya)')}
                                    </p>
                                </div>
                            </div>

                            {/* Body — a real grid, so the Notes field's sm:col-span-2 actually does something */}
                            <div className="grid gap-6 p-6 sm:grid-cols-2">
                                {/* Baqaya amount */}
                                <div>
                                    <label htmlFor="amount" className="mb-1.5 block text-sm font-medium text-gray-700">
                                        {t('customers', 'Baqaya')}
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
                                            value={data.amount}
                                            onChange={(e) => setData('amount', e.target.value === '' ? '' : Number(e.target.value))}
                                            className={`w-full rounded-lg border py-2.5 pl-8 pr-3 text-sm font-semibold shadow-sm transition focus:ring-2 focus:ring-offset-0 ${errors.amount
                                                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                                                    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-100'
                                                }`}
                                        />
                                    </div>
                                    {errors.amount && <p className="mt-1.5 text-xs text-rose-600">{errors.amount}</p>}
                                </div>

                                {/* Notes — now genuinely spans both grid columns */}
                                <div className="sm:col-span-2">
                                    <div className="mb-1.5 flex items-center justify-between">
                                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                                            {t('customers', 'Notes')}
                                        </label>
                                        <span className="text-xs text-gray-400">{data.notes.length}/500</span>
                                    </div>
                                    <textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value.slice(0, 500))}
                                        rows="4"
                                        placeholder={t('customers', 'Reason for this balance adjustment (optional)')}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                    />
                                    {errors.notes && <p className="mt-1.5 text-xs text-rose-600">{errors.notes}</p>}
                                </div>
                            </div>
                        </section>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-5">
                            <Link
                                href={route('payments.index')}
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
                                {processing ? t('buttons', 'saving') : t('buttons', 'save')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
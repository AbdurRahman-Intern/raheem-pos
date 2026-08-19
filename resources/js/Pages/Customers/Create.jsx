import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTrans } from '@/lib/trans';
import { Head, Link, useForm } from '@inertiajs/react';

export default function CustomerCreate() {
    const t = useTrans();

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        phone: '',
        address: '',
        baqaya: 0,
        balance_type: 'debit',
        notes: '',
        is_active: true,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('customers.store'));
    };

    const openingBalance = Number(data.baqaya) || 0;

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
                            <span className="text-gray-500">{t('customers', 'create_customer')}</span>
                        </nav>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            {t('customers', 'create_customer')}
                        </h2>
                    </div>
                </div>
            }
        >
            <Head title={t('customers', 'create_customer')} />

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
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder={t('customers', 'enter_customer_name')}
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
                                        {t('customers', 'phone')}
                                    </label>
                                    <input
                                        type="text"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder={t('customers', 'enter_phone_number')}
                                        className="w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                    {errors.phone && (
                                        <p className="mt-1.5 text-xs text-rose-600">{errors.phone}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                        {t('customers', 'address')}
                                    </label>
                                    <input
                                        type="text"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        placeholder={t('customers', 'enter_address')}
                                        className="w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                    {errors.address && (
                                        <p className="mt-1.5 text-xs text-rose-600">{errors.address}</p>
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

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                        {t('customers', 'balance_type')}
                                    </label>
                                    <div className="inline-flex w-full rounded-lg border border-gray-200 bg-gray-50 p-1">
                                        <button
                                            type="button"
                                            onClick={() => setData('balance_type', 'debit')}
                                            className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold transition ${data.balance_type === 'debit'
                                                ? 'bg-white text-rose-600 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            {t('customers', 'customer_owes_us')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setData('balance_type', 'credit')}
                                            className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold transition ${data.balance_type === 'credit'
                                                ? 'bg-white text-emerald-600 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            {t('customers', 'we_owe_customer')}
                                        </button>
                                    </div>
                                </div>

                                {openingBalance > 0 && (
                                    <div className="sm:col-span-2">
                                        <div
                                            className={`flex items-center justify-between rounded-lg px-4 py-2.5 text-sm ${data.balance_type === 'debit'
                                                ? 'bg-rose-50 text-rose-700'
                                                : 'bg-emerald-50 text-emerald-700'
                                                }`}
                                        >
                                            <span>
                                                {data.balance_type === 'debit'
                                                    ? t('customers', 'this_customer_will_start_owing')
                                                    : t('customers', 'you_will_start_owing_this_customer')}
                                            </span>
                                            <span className="font-semibold">
                                                {new Intl.NumberFormat(undefined, {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                }).format(openingBalance)}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Additional Information */}
                        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487 18.549 2.8a2.25 2.25 0 1 1 3.182 3.182L13.5 14.212l-4.5 1.5 1.5-4.5 8.362-8.225ZM16.862 4.487 19.5 7.125" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12.75v6.375a2.25 2.25 0 0 1-2.25 2.25H5.25a2.25 2.25 0 0 1-2.25-2.25V6.75a2.25 2.25 0 0 1 2.25-2.25h6.375" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900">
                                        {t('customers', 'additional_information')}
                                    </h3>
                                    <p className="text-xs text-gray-400">
                                        {t('customers', 'optional_notes_and_status')}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-5 p-6">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                        {t('customers', 'notes')}
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        placeholder={t('customers', 'add_notes_about_customer')}
                                        className="w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>

                                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50">
                                    <input
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span>
                                        <span className="block text-sm font-medium text-gray-800">
                                            {t('customers', 'active_customer')}
                                        </span>
                                        <span className="block text-xs text-gray-400">
                                            {t('customers', 'active_customer_hint')}
                                        </span>
                                    </span>
                                </label>
                            </div>
                        </section>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-5">
                            <Link
                                href={route('customers.index')}
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
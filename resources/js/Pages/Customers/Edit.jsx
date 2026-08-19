import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTrans } from '@/lib/trans';
import { Head, Link, useForm } from '@inertiajs/react';

export default function CustomerEdit({ customer }) {

    const t = useTrans();
    const { data, setData, put, processing, errors } = useForm({
        name: customer.name,
        phone: customer.phone || '',
        address: customer.address || '',
        baqaya: customer.baqaya || 0,
        balance_type: customer.balance_type || ''

    });

    console.log(customer)

    const submit = (e) => {
        e.preventDefault();
        put(route('customers.update', customer.id));
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">{t('customers', 'edit_customer')}</h2>}>
            <Head title={t('customers', 'edit_customer')} />
            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="rounded-xl bg-white p-6 shadow-sm">
                    <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <label className="mb-1 block text-sm font-medium">{t('customers', 'name')} *</label>
                            <input value={data.name} onChange={(e) => setData('name', e.target.value)} className="w-full rounded border px-3 py-2" />
                            {errors.name && <div className="mt-1 text-sm text-rose-600">{errors.name}</div>}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">{t('customers', 'phone')} </label>
                            <input value={data.phone} onChange={(e) => setData('phone', e.target.value)} className="w-full rounded border px-3 py-2" />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">{t('customers', 'address')} *</label>
                            <input value={data.address} onChange={(e) => setData('address', e.target.value)} className="w-full rounded border px-3 py-2" />
                        </div>

                        {/* Financial Information */}

                        <div className="border-b p-6">

                            <h3 className="mb-6 text-lg font-semibold">
                                {t('customers', 'financial_information')}
                            </h3>

                            <div className="grid gap-6 md:grid-cols-2">

                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        {t('customers', 'baqaya')}
                                    </label>

                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.baqaya}
                                        onChange={(e) =>
                                            setData('baqaya', e.target.value)
                                        }
                                        className="w-full rounded-lg border px-3 py-2"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        {t('customers', 'balance_type')}
                                    </label>

                                    <select
                                        value={data.balance_type}
                                        onChange={(e) =>
                                            setData('balance_type', e.target.value)
                                        }
                                        className="w-full rounded-lg border px-3 py-2"
                                    >
                                        <option value="debit">
                                            {t('customers', 'customer_owes_us')}
                                        </option>

                                        <option value="credit">
                                            {t('customers', 'we_owe_customer')}
                                        </option>
                                    </select>
                                </div>

                            </div>
                        </div>

                        <div className="md:col-span-2 flex gap-3">
                            <button type="submit" disabled={processing} className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white">{t('buttons', 'update')} </button>
                            <Link href={route('customers.index')} className="rounded border px-4 py-2 text-sm font-semibold">{t('buttons', 'cancel')} </Link>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

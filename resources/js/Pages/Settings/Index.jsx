import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function SettingsIndex({ settings }) {
    const { data, setData, put, processing } = useForm({
        company_name: settings.company_name || '',
        phone: settings.phone || '',
        address: settings.address || '',
        logo: settings.logo || '',
        receipt_width: settings.receipt_width || 48,
        currency: settings.currency || 'USD',
        language: settings.language || 'en',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('settings.update'));
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Settings</h2>}>
            <Head title="Settings" />
            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="rounded-xl bg-white p-6 shadow-sm">
                    <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium">Company Name</label>
                            <input value={data.company_name} onChange={(e) => setData('company_name', e.target.value)} className="w-full rounded border px-3 py-2" />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">Phone</label>
                            <input value={data.phone} onChange={(e) => setData('phone', e.target.value)} className="w-full rounded border px-3 py-2" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="mb-1 block text-sm font-medium">Address</label>
                            <textarea value={data.address} onChange={(e) => setData('address', e.target.value)} className="w-full rounded border px-3 py-2" rows="3" />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">Currency</label>
                            <input value={data.currency} onChange={(e) => setData('currency', e.target.value)} className="w-full rounded border px-3 py-2" />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">Language</label>
                            <select value={data.language} onChange={(e) => setData('language', e.target.value)} className="w-full rounded border px-3 py-2">
                                <option value="en">English</option>
                                <option value="ps">Pashto</option>
                                <option value="fa">Dari</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <button type="submit" disabled={processing} className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Update Settings</button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

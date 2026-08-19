import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function PurchaseCreate() {
    const { data, setData, post, processing, errors } = useForm({
        reference: '',
        notes: '',
        subtotal: 0,
        total: 0,
        items: [
            { product_id: '', quantity: 1, unit_cost: 0 },
        ],
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('purchases.store'));
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Create Purchase</h2>}>
            <Head title="Create Purchase" />
            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="rounded-xl bg-white p-6 shadow-sm">
                    <form onSubmit={submit} className="grid gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium">Reference</label>
                            <input value={data.reference} onChange={(e) => setData('reference', e.target.value)} className="w-full rounded border px-3 py-2" />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">Notes</label>
                            <textarea value={data.notes} onChange={(e) => setData('notes', e.target.value)} className="w-full rounded border px-3 py-2" rows="4" />
                        </div>
                        <div className="flex gap-3">
                            <button type="submit" disabled={processing} className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Save Purchase</button>
                            <Link href={route('purchases.index')} className="rounded border px-4 py-2 text-sm font-semibold">Cancel</Link>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

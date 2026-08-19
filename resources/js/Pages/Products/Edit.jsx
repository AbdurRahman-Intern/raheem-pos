import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ProductEdit({ product }) {
    const { data, setData, put, processing, errors } = useForm({
        name: product.name,
        buy_price: product.buy_price,
        sell_price: product.sell_price,
        stock: product.stock,
        minimum_stock: product.minimum_stock,
        status: product.status,
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('products.update', product.id));
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Edit Product</h2>}>
            <Head title="Edit Product" />

            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="rounded-xl bg-white p-6 shadow-sm">
                    <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <label className="mb-1 block text-sm font-medium">Name</label>
                            <input value={data.name} onChange={(e) => setData('name', e.target.value)} className="w-full rounded border px-3 py-2" />
                            {errors.name && <div className="mt-1 text-sm text-rose-600">{errors.name}</div>}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">Buy Price</label>
                            <input type="number" step="0.01" value={data.buy_price} onChange={(e) => setData('buy_price', e.target.value)} className="w-full rounded border px-3 py-2" />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">Sell Price</label>
                            <input type="number" step="0.01" value={data.sell_price} onChange={(e) => setData('sell_price', e.target.value)} className="w-full rounded border px-3 py-2" />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">Stock</label>
                            <input type="number" value={data.stock} onChange={(e) => setData('stock', parseInt(e.target.value || 0, 10))} className="w-full rounded border px-3 py-2" />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">Minimum Stock</label>
                            <input type="number" value={data.minimum_stock} onChange={(e) => setData('minimum_stock', parseInt(e.target.value || 0, 10))} className="w-full rounded border px-3 py-2" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="mb-1 block text-sm font-medium">Description</label>
                            <textarea value={data.description} onChange={(e) => setData('description', e.target.value)} className="w-full rounded border px-3 py-2" rows="4" />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">Status</label>
                            <select value={data.status} onChange={(e) => setData('status', e.target.value)} className="w-full rounded border px-3 py-2">
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        <div className="md:col-span-2 flex items-center gap-3">
                            <button type="submit" disabled={processing} className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                                Update Product
                            </button>
                            <Link href={route('products.index')} className="rounded border px-4 py-2 text-sm font-semibold">
                                Cancel
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

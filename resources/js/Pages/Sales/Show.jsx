// import React, { useEffect } from 'react';
// import { usePage, Link } from '@inertiajs/react';

// export default function Show({ sale }) {
//     const { flash } = usePage().props;

//     // Trigger print automatically if redirected from "Save & Print"
//     useEffect(() => {
//         if (flash?.print) {
//             window.print();
//         }
//     }, [flash]);

//     return (
//         <div className="mx-auto max-w-4xl p-6 bg-white shadow-sm rounded-lg my-6 print:m-0 print:p-0 print:shadow-none print:rounded-none">

//             {/* Screen-Only Action Banner (Invisible during printing) */}
//             <div className="mb-6 flex justify-between items-center print:hidden border-b pb-4">
//                 <Link
//                     href={route('sales.index')}
//                     className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1"
//                 >
//                     &larr; Back to Sales List
//                 </Link>
//                 <button
//                     onClick={() => window.print()}
//                     className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
//                 >
//                     Print Invoice
//                 </button>
//             </div>

//             {/* Invoice Print Layout Structure */}
//             <div className="print-area font-sans text-gray-900">
//                 {/* Invoice Header */}
//                 <div className="flex justify-between items-start border-b pb-6">
//                     <div>
//                         <h1 className="text-3xl font-bold uppercase tracking-tight text-gray-800">Invoice</h1>
//                         {/* <p className="text-sm text-gray-500 mt-1"># {sale.invoice_number || sale.id}</p> */}
//                     </div>
//                     <div className="text-right text-sm text-gray-600">
//                         <p className="font-bold text-gray-800">Your Company Name</p>
//                         <p>123 Business Street</p>
//                         <p>Contact: info@company.com</p>
//                     </div>
//                 </div>

//                 {/* Metadata & Customer Info */}
//                 <div className="grid grid-cols-2 gap-4 my-8 text-sm">
//                     <div>
//                         <h3 className="font-semibold text-gray-500 uppercase tracking-wider text-xs mb-1">Billed To</h3>
//                         <p className="font-bold text-gray-800">{sale.customer?.name || 'Walk-in Customer'}</p>
//                         <p>{sale.customer?.phone}</p>
//                     </div>
//                     <div className="text-right">
//                         <h3 className="font-semibold text-gray-500 uppercase tracking-wider text-xs mb-1">Invoice Details</h3>
//                         <p><span className="text-gray-500">Date:</span> {sale.created_at_formatted || sale.date || sale.created_at}</p>
//                         <p><span className="text-gray-500">Payment Type:</span> <span className="capitalize">{sale.payment_type || sale.type}</span></p>
//                     </div>
//                 </div>

//                 {/* Items Table */}
//                 <table className="w-full text-left border-collapse my-6">
//                     <thead>
//                         <tr className="border-b-2 border-gray-300 text-xs font-semibold uppercase text-gray-600 tracking-wider">
//                             <th className="py-2">Item Description</th>
//                             <th className="py-2 text-right">Qty</th>
//                             <th className="py-2 text-right">Price</th>
//                             <th className="py-2 text-right">Total</th>
//                         </tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-200 text-sm">
//                         {sale.items?.map((item, index) => (
//                             <tr key={index}>
//                                 <td className="py-3 font-medium text-gray-800">{item.product_name || item.name}</td>
//                                 <td className="py-3 text-right">{item.quantity}</td>
//                                 <td className="py-3 text-right">${Number(item.price).toFixed(2)}</td>
//                                 <td className="py-3 text-right font-medium">${(item.quantity * item.price).toFixed(2)}</td>
//                             </tr>
//                         )) || (
//                                 <tr>
//                                     <td className="py-3 font-medium text-gray-800">Standard Sales Package</td>
//                                     <td className="py-3 text-right">1</td>
//                                     <td className="py-3 text-right">${Number(sale.grand_total).toFixed(2)}</td>
//                                     <td className="py-3 text-right font-medium">${Number(sale.grand_total).toFixed(2)}</td>
//                                 </tr>
//                             )}
//                     </tbody>
//                 </table>

//                 {/* Financial Summary Breakdown */}
//                 <div className="mt-8 border-t pt-4 flex justify-end">
//                     <div className="w-64 text-sm space-y-2">
//                         <div className="flex justify-between text-gray-600">
//                             <span>Grand Total:</span>
//                             <span className="font-semibold text-gray-900">${Number(sale.grand_total).toFixed(2)}</span>
//                         </div>
//                         <div className="flex justify-between text-green-600">
//                             <span>Amount Paid:</span>
//                             <span className="font-semibold">${Number(sale.paid_amount || sale.paid).toFixed(2)}</span>
//                         </div>
//                         <div className="flex justify-between border-t pt-2 text-base font-bold text-gray-900">
//                             <span>Remaining Balance:</span>
//                             <span className={Number(sale.remaining_balance || sale.remaining) > 0 ? "text-red-600" : "text-gray-900"}>
//                                 ${Number(sale.remaining_balance || sale.remaining).toFixed(2)}
//                             </span>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }


// import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
// import { useTrans } from '@/lib/trans';
// import { Head, Link, usePage } from '@inertiajs/react';
// import { useEffect } from 'react';

// export default function Show({ sale, company = {} }) {
//     const { flash } = usePage().props;

//     // Trigger print automatically if redirected from "Save & Print"
//     useEffect(() => {
//         if (flash?.print) {
//             window.print();
//         }
//     }, [flash]);
//     const t = useTrans();

//     const formatMoney = (value) =>
//         new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
//             Number(value ?? 0)
//         );

//     console.log(sale)

//     const customerName = sale.customer?.name ?? sale.customer_name ?? t('sales', 'Walk-in Customer');
//     const customerPhone = sale.customer?.phone ?? sale.customer_phone;
//     const customerAddress = sale.customer?.address ?? sale.customer_address;
//     const isWholesale = sale.invoice_type === 'wholesale';

//     const openPrint = () => {
//         window.open(route('sales.print', sale.id), '_blank');
//     };

//     return (
//         <AuthenticatedLayout
//             header={
//                 <div className="flex items-center justify-between">
//                     <div>
//                         <nav className="mb-1 flex items-center gap-1.5 text-xs text-gray-400">
//                             <Link href={route('sales.index')} className="hover:text-gray-600">
//                                 {t('sales', 'Sales Invoices')}
//                             </Link>
//                             <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
//                                 <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
//                             </svg>
//                             <span className="text-gray-500">{sale.invoice_number}</span>
//                         </nav>
//                         <h2 className="text-lg font-semibold leading-tight text-gray-800">
//                             {sale.invoice_number}
//                         </h2>
//                     </div>
//                     <div className="flex items-center gap-2">
//                         <button
//                             type="button"
//                             onClick={() => window.print()}
//                             className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
//                         >
//                             <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
//                                 <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
//                             </svg>
//                             {t('buttons', 'Print')}
//                         </button>
//                         <Link
//                             // href={route('sales.edit', sale.id)}
//                             className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
//                         >
//                             <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
//                                 <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
//                             </svg>
//                             {t('buttons', 'Edit')}
//                         </Link>
//                     </div>
//                 </div>
//             }
//         >
//             <Head title={sale.invoice_number} />

//             <div className="py-8">
//                 <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
//                     {/* The "paper ledger" card */}
//                     <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
//                         {/* Header band — business identity, mirrors the printed letterhead */}
//                         <div className="relative overflow-hidden bg-gradient-to-r from-indigo-700 to-indigo-500 px-6 py-6 text-white sm:px-8">
//                             <div className="relative flex items-start justify-between gap-4">
//                                 <div>
//                                     <h1 className="text-lg font-bold sm:text-xl">
//                                         {company.name || t('sales', 'Your Business Name')}
//                                     </h1>
//                                     {company.tagline && (
//                                         <p className="mt-0.5 text-sm text-indigo-100">{company.tagline}</p>
//                                     )}
//                                     <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-indigo-100">
//                                         {company.phone && (
//                                             <span className="flex items-center gap-1">
//                                                 <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
//                                                     <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
//                                                 </svg>
//                                                 {company.phone}
//                                             </span>
//                                         )}
//                                         {company.address && (
//                                             <span className="flex items-center gap-1">
//                                                 <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
//                                                     <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
//                                                     <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
//                                                 </svg>
//                                                 {company.address}
//                                             </span>
//                                         )}
//                                     </div>
//                                 </div>

//                                 {/* Serial number badge — echoes the boxed "١١٧" on the paper form */}
//                                 <div className="flex-shrink-0 rounded-xl bg-white/15 px-4 py-3 text-center backdrop-blur-sm">
//                                     <p className="text-[10px] font-medium uppercase tracking-wide text-indigo-100">
//                                         {t('sales', 'Invoice #')}
//                                     </p>
//                                     <p className="mt-0.5 text-2xl font-bold tabular-nums">{sale.invoice_number}</p>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Meta strip — invoice type, date, customer, matching the "نوم / تاریخ" fields */}
//                         <div className="grid grid-cols-2 gap-4 border-b border-gray-200 bg-gray-50 px-6 py-4 sm:grid-cols-4 sm:px-8">
//                             <div>
//                                 <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
//                                     {t('sales', 'Customer')}
//                                 </p>
//                                 <p className="mt-0.5 truncate text-sm font-semibold text-gray-900">{customerName}</p>
//                             </div>
//                             <div>
//                                 <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
//                                     {t('sales', 'Phone')}
//                                 </p>
//                                 <p className="mt-0.5 text-sm text-gray-700">
//                                     {customerPhone || <span className="text-gray-300">—</span>}
//                                 </p>
//                             </div>
//                             <div>
//                                 <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
//                                     {t('sales', 'Date')}
//                                 </p>
//                                 <p className="mt-0.5 text-sm text-gray-700">
//                                     {sale.created_at ? new Date(sale.created_at).toLocaleDateString() : '—'}
//                                 </p>
//                             </div>
//                             <div>
//                                 <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
//                                     {t('sales', 'Invoice Type')}
//                                 </p>
//                                 <span
//                                     className={`mt-0.5 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${isWholesale
//                                         ? 'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/20'
//                                         : 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
//                                         }`}
//                                 >
//                                     {isWholesale ? t('sales', 'Wholesale') : t('sales', 'Retail')}
//                                 </span>
//                             </div>
//                             {customerAddress && (
//                                 <div className="col-span-2 sm:col-span-4">
//                                     <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
//                                         {t('sales', 'Address')}
//                                     </p>
//                                     <p className="mt-0.5 text-sm text-gray-700">{customerAddress}</p>
//                                 </div>
//                             )}
//                         </div>

//                         {/* Ledger table — boxed rows like the ruled paper columns */}
//                         <div className="overflow-x-auto px-6 pt-6 sm:px-8">
//                             <table className="w-full border-collapse overflow-hidden rounded-lg border border-gray-200 text-sm">
//                                 <thead>
//                                     <tr className="bg-gray-50">
//                                         <th className="w-10 border border-gray-200 px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
//                                             #
//                                         </th>
//                                         <th className="border border-gray-200 px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
//                                             {t('sales', 'Product')}
//                                         </th>
//                                         <th className="border border-gray-200 px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
//                                             {t('sales', 'Quantity')}
//                                         </th>
//                                         <th className="border border-gray-200 px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
//                                             {t('sales', 'Unit Price')}
//                                         </th>
//                                         <th className="border border-gray-200 px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
//                                             {t('sales', 'Discount')}
//                                         </th>
//                                         <th className="border border-gray-200 px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
//                                             {t('sales', 'Total')}
//                                         </th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {sale.items.map((item, index) => (
//                                         <tr key={item.id ?? index} className="transition hover:bg-gray-50">
//                                             <td className="border border-gray-200 px-3 py-2.5 text-center text-gray-500">
//                                                 {index + 1}
//                                             </td>
//                                             <td className="border border-gray-200 px-3 py-2.5 font-medium text-gray-900">
//                                                 {item.product?.name ?? item.product_name}
//                                             </td>
//                                             <td className="border border-gray-200 px-3 py-2.5 text-center text-gray-700">
//                                                 {item.quantity} {item.product?.unit}
//                                             </td>
//                                             <td className="border border-gray-200 px-3 py-2.5 text-right text-gray-700">
//                                                 {formatMoney(item.unit_price)}
//                                             </td>
//                                             <td className="border border-gray-200 px-3 py-2.5 text-right text-gray-700">
//                                                 {formatMoney(item.discount)}
//                                             </td>
//                                             <td className="border border-gray-200 px-3 py-2.5 text-right font-semibold text-gray-900">
//                                                 {formatMoney(item.total)}
//                                             </td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>

//                         {/* Balance breakdown — mirrors the four boxes at the bottom of the
//                             paper form (previous balance / received / new balance / total) */}
//                         <div className="grid gap-4 px-6 py-6 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
//                             {isWholesale && (
//                                 <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
//                                     <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
//                                         {t('sales', 'Previous Balance')}
//                                     </p>
//                                     <p className="mt-1 text-lg font-bold text-gray-800">
//                                         {formatMoney(sale.previous_balance)}
//                                     </p>
//                                 </div>
//                             )}
//                             <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
//                                 <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
//                                     {t('sales', 'Subtotal')}
//                                 </p>
//                                 <p className="mt-1 text-lg font-bold text-gray-800">{formatMoney(sale.subtotal)}</p>
//                             </div>
//                             <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
//                                 <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600">
//                                     {t('sales', 'Paid Amount')}
//                                 </p>
//                                 <p className="mt-1 text-lg font-bold text-emerald-700">
//                                     {formatMoney(sale.paid_amount)}
//                                 </p>
//                             </div>
//                             <div
//                                 className={`rounded-xl border p-4 ${Number(sale.remaining_balance) > 0
//                                     ? 'border-rose-200 bg-rose-50'
//                                     : 'border-emerald-200 bg-emerald-50'
//                                     }`}
//                             >
//                                 <p
//                                     className={`text-[10px] font-semibold uppercase tracking-wide ${Number(sale.remaining_balance) > 0 ? 'text-rose-600' : 'text-emerald-600'
//                                         }`}
//                                 >
//                                     {t('sales', 'Remaining Balance')}
//                                 </p>
//                                 <p
//                                     className={`mt-1 text-lg font-bold ${Number(sale.remaining_balance) > 0 ? 'text-rose-700' : 'text-emerald-700'
//                                         }`}
//                                 >
//                                     {formatMoney(sale.remaining_balance)}
//                                 </p>
//                             </div>
//                         </div>

//                         {/* Grand total strip */}
//                         <div className="mx-6 mb-6 flex items-center justify-between rounded-xl bg-gray-900 px-5 py-4 sm:mx-8">
//                             <span className="text-sm font-medium text-gray-300">{t('sales', 'Grand Total')}</span>
//                             <span className="text-xl font-bold text-white">{formatMoney(sale.grand_total)}</span>
//                         </div>

//                         {sale.notes && (
//                             <div className="mx-6 mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4 sm:mx-8">
//                                 <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
//                                     {t('sales', 'Notes')}
//                                 </p>
//                                 <p className="mt-1 text-sm text-gray-600">{sale.notes}</p>
//                             </div>
//                         )}

//                         {/* Signature line — echoes "لاسلیک" at the bottom of the paper form */}
//                         <div className="grid grid-cols-2 gap-6 border-t border-gray-200 px-6 py-6 sm:px-8">
//                             <div>
//                                 <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
//                                     {t('sales', 'Prepared By')}
//                                 </p>
//                                 <p className="mt-1 text-sm text-gray-700">
//                                     {sale.created_by_name ?? sale.creator?.name ?? '—'}
//                                 </p>
//                             </div>
//                             <div className="text-right">
//                                 <div className="ml-auto h-10 w-40 border-b border-dashed border-gray-300" />
//                                 <p className="mt-1 text-xs text-gray-400">{t('sales', 'Signature')}</p>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </AuthenticatedLayout>
//     );
// }



import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTrans } from '@/lib/trans';

const defaultCompany = {
    titleLine: 'ډاکتر راحت د چرګانو عمده در ملو پلورنځی',
    servicesLabel: 'د چرګانو در ملو خدمات',
    contacts: [
        { label: 'ډاکتر راحت الله', phones: ['0785541769', '0797331009'] },
        { label: 'مسؤل ډاکتر انعام الله', phones: ['0787669185', '0711757872'] },
    ],
    address:
        'آدرس: کلي زیده هډه، حج اوقافو ریاست ته مخامخ، حاجي طره باز خان تجارتي مارکیت، اول منزل، ۲۰ نمبر دوکان',
};

const ROW_COUNT = 8;

// Map the real sale.items shape -> the paper-form row shape
function mapItemsToRows(items = []) {
    console.log(items)
    const rows = items.map((item) => ({
        detail: item.product?.name ?? item.product_name ?? '',
        qty: item.quantity,
        price: item.unit_price,
        total: item.total,
    }));
    while (rows.length < ROW_COUNT) rows.push({});
    return rows.slice(0, ROW_COUNT);
}

export default function Show({ sale, company = defaultCompany }) {
    const { flash } = usePage().props;
    const t = useTrans();
    const hasPrinted = useRef(false);

    // Auto-print exactly once when redirected here from "Save & Print"
    useEffect(() => {
        if (flash?.print && !hasPrinted.current) {
            hasPrinted.current = true;
            const timer = setTimeout(() => window.print(), 300); // let fonts/layout settle
            return () => clearTimeout(timer);
        }
    }, [flash]);
    // console.log(sale)
    const rows = mapItemsToRows(sale?.items)
    const isWholesale = sale.invoice_type === 'wholesale';
    const customerName =
        sale.customer?.name ?? sale.customer_name ?? t('sales', 'Walk-in Customer');

    const handlePrint = () => window.print();

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between print:hidden">
                    <div>
                        <nav className="mb-1 flex items-center gap-1.5 text-xs text-gray-400">
                            <Link href={route('sales.index')} className="hover:text-gray-600">
                                {t('sales', 'Sales Invoices')}
                            </Link>
                            <span className="text-gray-500">{sale.invoice_number ?? sale.id}</span>
                        </nav>
                        <h2 className="text-lg font-semibold leading-tight text-gray-800">
                            {sale.invoice_number ?? `#${sale.id}`}
                        </h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="rounded-lg bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-800"
                        >
                            {t('buttons', 'Print')}
                        </button>
                        <Link
                            // href={route('sales.edit', sale.id)}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
                        >
                            {t('buttons', 'Edit')}
                        </Link>
                    </div>
                </div>
            }
        >
            <Head>
                <title>{sale.invoice_number ?? `Invoice #${sale.id}`}</title>
                <link
                    href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <div className="print:p-0 py-6 bg-neutral-100 print:bg-white min-h-screen flex justify-center">
                <div
                    dir="rtl"
                    lang="ps"
                    style={{ fontFamily: "'Noto Nastaliq Urdu', 'Noto Naskh Arabic', serif" }}
                    className="invoice-page bg-white w-[560px] max-w-full border-[6px] border-emerald-500 shadow-lg print:shadow-none"
                >
                    {/* ===== Header banner ===== */}
                    <div className="bg-gradient-to-b from-sky-600 to-sky-500 px-3 pt-3 pb-2 relative overflow-hidden">
                        <div className="flex items-center justify-between gap-2">
                            <img src="/images/rooster.png" alt="" className="w-16 h-16 object-contain shrink-0" />
                            <h1 className="text-red-600 font-bold text-[20px] leading-tight text-center flex-1 drop-shadow-[0_1px_0_rgba(255,255,255,0.4)]">
                                {company.titleLine}
                            </h1>
                            <img src="/images/hen.png" alt="" className="w-16 h-16 object-contain shrink-0" />
                        </div>
                        <p className="text-white text-center text-sm font-semibold mt-1">
                            {company.servicesLabel}
                        </p>
                        <div className="mt-2 space-y-1">
                            {company.contacts.map((c, i) => (
                                <div
                                    key={i}
                                    className="bg-sky-800/90 text-white text-xs rounded-sm px-2 py-1 flex items-center justify-center gap-2 flex-wrap"
                                >
                                    <span className="font-semibold">{c.label}</span>
                                    <span dir="ltr" className="font-mono tracking-wide">
                                        {c.phones.join('  -  ')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ===== Serial + customer strip ===== */}
                    <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-300 text-xs">
                        <span className="font-semibold text-neutral-700">سلسل نمبر</span>
                        <span className="text-lg font-bold text-neutral-900 border border-neutral-400 rounded px-3">
                            {sale.invoice_number ?? sale.id}
                        </span>
                        <span className="font-semibold text-neutral-700 truncate max-w-[180px]">{customerName}</span>
                    </div>

                    {/* ===== Table ===== */}
                    <div className="relative">
                        <div
                            className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.08]"
                            aria-hidden="true"
                        >
                            <svg viewBox="0 0 100 100" className="w-56 h-56">
                                <circle cx="50" cy="50" r="46" fill="none" stroke="#b8860b" strokeWidth="4" />
                                <text x="50" y="58" textAnchor="middle" fontSize="34">🐔</text>
                            </svg>
                        </div>

                        <table className="w-full border-collapse text-xs relative">
                            <thead>
                                <tr className="bg-neutral-50">
                                    <th className="border border-neutral-400 w-8 py-1">شماره</th>
                                    <th className="border border-neutral-400">تفصیل</th>
                                    <th className="border border-neutral-400 w-12">تعداد</th>
                                    <th className="border border-neutral-400 w-16">قیمت</th>
                                    <th className="border border-neutral-400 w-16">جمله</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, idx) => (
                                    <tr key={idx} className="h-9">
                                        <td className="border border-neutral-400 text-center font-semibold">{idx + 1}</td>
                                        <td className="border border-neutral-400 px-1">{row.detail || ''}</td>
                                        <td className="border border-neutral-400 text-center">{row.qty ?? ''}</td>
                                        <td className="border border-neutral-400 text-center">
                                            {row.price != null ? Number(row.price).toFixed(2) : ''}
                                        </td>
                                        <td className="border border-neutral-400 text-center">
                                            {row.total != null ? Number(row.total).toFixed(2) : ''}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* ===== Balance footer — wired to real sale totals ===== */}
                    <div className="grid grid-cols-2 border-t border-neutral-400 text-xs">
                        <div className="border-l border-neutral-400 p-2 space-y-2">
                            <p className="flex justify-between">
                                <span>پخواني بقایا</span>
                                <span className="font-semibold">
                                    {isWholesale ? Number(sale.previous_balance ?? 0).toFixed(2) : '0.00'}
                                </span>
                            </p>
                            <p className="flex justify-between">
                                <span>وصول</span>
                                <span className="font-semibold">{Number(sale.paid_amount ?? 0).toFixed(2)}</span>
                            </p>
                            <p className="flex justify-between font-semibold">
                                <span>حمله بقایا</span>
                                <span>{Number(sale.remaining_balance ?? 0).toFixed(2)}</span>
                            </p>
                        </div>
                        <div className="p-2 flex flex-col justify-between">
                            <div>
                                <p className="text-neutral-700">جمله (Grand Total)</p>
                                <p className="border-b border-neutral-400 h-5 font-bold">
                                    {Number(sale.grand_total ?? 0).toFixed(2)}
                                </p>
                            </div>
                            <div className="mt-2">
                                <p className="text-neutral-700">لاسلیک</p>
                                <p className="border-b border-neutral-400 h-5" />
                            </div>
                        </div>
                    </div>

                    {/* ===== Address footer ===== */}
                    <div className="bg-neutral-50 text-center text-[10px] leading-relaxed px-2 py-2 border-t border-neutral-300">
                        {company.address}
                    </div>
                </div>
            </div>

            <style>{`
        @media print {
          @page { size: A5 portrait; margin: 8mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .invoice-page { width: 100% !important; }
        }
      `}</style>
        </AuthenticatedLayout>
    );
}

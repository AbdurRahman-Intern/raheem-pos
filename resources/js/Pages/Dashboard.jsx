import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useTrans } from '@/lib/trans';
import BackupManager from '@/Components/Backup';



export default function Dashboard() {
    const t = useTrans();
    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between">
                    <div>
                        <h2 className="text-lg font-semibold leading-tight text-gray-800">
                            {t('dashboard', 'executive_dashboard')}
                        </h2>
                        <p className="mt-0.5 text-sm text-gray-500">{t('dashboard', 'daily_snapshot')}</p>
                    </div>

                    <div>
                        <Link
                            href={route('reports.index')}
                            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                            </svg>
                            Reports
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={t('dashboard', 'dashboard')} />



            <div>
                <BackupManager />
            </div>

        </AuthenticatedLayout>
    );
}




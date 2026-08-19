import ApplicationLogo from '@/Components/ApplicationLogo';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    FaBagShopping,
    FaBoxesPacking,
    FaCashRegister,
    FaChartSimple,
    FaGear,
    FaHouse,
    FaRightFromBracket,
    FaUsers,
    FaWallet,
    FaBars,
    FaXmark,
} from 'react-icons/fa6';

const localeLabels = {
    en: 'English',
    ps: 'پښتو',
    fa: 'دری',
};

function menuIcon(routeName) {
    if (routeName.includes('dashboard')) {
        return <FaHouse className="h-4 w-4" />;
    }

    if (routeName.includes('products')) {
        return <FaBoxesPacking className="h-4 w-4" />;
    }

    if (routeName.includes('customers')) {
        return <FaUsers className="h-4 w-4" />;
    }

    if (routeName.includes('sales')) {
        return <FaCashRegister className="h-4 w-4" />;
    }

    if (routeName.includes('purchases')) {
        return <FaBagShopping className="h-4 w-4" />;
    }

    if (routeName.includes('expenses')) {
        return <FaWallet className="h-4 w-4" />;
    }

    if (routeName.includes('settings')) {
        return <FaGear className="h-4 w-4" />;
    }

    return <FaChartSimple className="h-4 w-4" />;
}

export default function AuthenticatedLayout({ header, children }) {
    const { auth, menuItems } = usePage().props;
    const user = auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    const changeLanguage = (event) => {
        router.post(
            route('language.change'),
            { language: event.target.value },
            { preserveScroll: true },
        );
    };

    return (
        <div className="min-h-screen bg-slate-100">
            <div className="flex min-h-screen">
                <aside className="hidden w-80 flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-5 py-6 text-slate-50 lg:flex">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-2xl shadow-slate-950/40 backdrop-blur">
                        <Link href={route('dashboard')} className="flex items-center gap-3">
                            <div className="rounded-xl bg-emerald-400/15 p-2 text-emerald-300">
                                <ApplicationLogo className="h-8 w-8 fill-current" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300">Raheem</p>
                                <p className="text-lg font-bold text-white">Business Hub</p>
                            </div>
                        </Link>
                    </div>

                    <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200">Operations</p>
                        <p className="mt-2 text-sm text-slate-200">Inventory, sales, purchasing, and customer activity in one control center.</p>
                    </div>

                    <nav className="mt-6 space-y-2">
                        {menuItems.map((item) => {
                            const active = route().current(item.routeName);

                            return (
                                <Link
                                    key={item.routeName}
                                    href={item.href}
                                    className={[
                                        'group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200',
                                        active
                                            ? 'bg-white text-slate-900 shadow-lg shadow-slate-950/20'
                                            : 'text-slate-300 hover:bg-white/10 hover:text-white',
                                    ].join(' ')}
                                >
                                    <span
                                        className={[
                                            'rounded-xl p-2',
                                            active ? 'bg-slate-100 text-slate-700' : 'bg-white/10 text-emerald-300',
                                        ].join(' ')}
                                    >
                                        {menuIcon(item.routeName)}
                                    </span>
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-emerald-300 to-cyan-300 text-sm font-bold text-slate-900">
                                {user.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div>
                                <div className="font-semibold text-white">{user.name}</div>
                                <div className="text-xs text-slate-300">{user.email}</div>
                            </div>
                        </div>

                        <div className="mt-4 space-y-2">
                            <label className="block text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-300">
                                Language
                            </label>
                            <select
                                onChange={changeLanguage}
                                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-emerald-300"
                            >
                                {Object.entries(localeLabels).map(([code, label]) => (
                                    <option key={code} value={code}>
                                        {label}
                                    </option>
                                ))}
                            </select>

                            <Link
                                href={route('profile.edit')}
                                className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/15"
                            >
                                <span>Profile</span>
                            </Link>

                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="flex w-full items-center justify-between rounded-xl bg-rose-500/15 px-3 py-2 text-sm font-medium text-rose-100 transition hover:bg-rose-500/25"
                            >
                                <span>Log Out</span>
                                <FaRightFromBracket className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </aside>

                <div className="flex min-w-0 flex-1 flex-col">
                    <header className="border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
                        <div className="flex items-center justify-between">
                            <Link href={route('dashboard')} className="flex items-center gap-3">
                                <ApplicationLogo className="h-8 w-8 fill-current text-slate-900" />
                                <span className="text-sm font-bold uppercase tracking-[0.24em] text-slate-700">Business Hub</span>
                            </Link>

                            <button
                                type="button"
                                onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                                className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-700 transition hover:bg-slate-100"
                            >
                                {showingNavigationDropdown ? <FaXmark className="h-5 w-5" /> : <FaBars className="h-5 w-5" />}
                            </button>
                        </div>
                    </header>

                    {showingNavigationDropdown && (
                        <div className="border-b border-slate-200 bg-white p-4 lg:hidden">
                            <div className="space-y-2">
                                {menuItems.map((item) => (
                                    <ResponsiveNavLink key={item.routeName} href={item.href} active={route().current(item.routeName)}>
                                        {item.name}
                                    </ResponsiveNavLink>
                                ))}
                            </div>

                            <div className="mt-4 border-t border-slate-200 pt-4">
                                <div className="mb-3 text-sm font-semibold text-slate-900">{user.name}</div>
                                <div className="mb-3 text-sm text-slate-500">{user.email}</div>
                                <select
                                    onChange={changeLanguage}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                                >
                                    {Object.entries(localeLabels).map(([code, label]) => (
                                        <option key={code} value={code}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                                <div className="mt-3 space-y-2">
                                    <ResponsiveNavLink href={route('profile.edit')}>Profile</ResponsiveNavLink>
                                    <ResponsiveNavLink method="post" href={route('logout')} as="button">Log Out</ResponsiveNavLink>
                                </div>
                            </div>
                        </div>
                    )}

                    {header && (
                        <div className="border-b border-slate-200 bg-white/80 backdrop-blur">
                            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{header}</div>
                        </div>
                    )}

                    <main className="flex-1">{children}</main>
                </div>
            </div>
        </div>
    );
}

import { Head, Link } from '@inertiajs/react';

/**
 * Welcome — the desktop app's landing screen.
 *
 * Design direction: this app is built entirely around ledgers and printed
 * receipts (Sales, Expenses, Income, the 4-page executive report). Rather
 * than a generic hero + icon-grid template, this page is grounded in that
 * material directly — ruled ledger-paper background, a tilted printed
 * receipt as the hero's signature element (a literal preview of what the
 * Reports page produces), and features laid out as ruled ledger rows
 * instead of cards. Accent colors match what's already used throughout
 * the app: indigo for Sales, emerald for Income, rose for Expenses, amber
 * for Inventory — so this page feels like the front door of one coherent
 * system, not a marketing site bolted on top of it.
 */
export default function Welcome({ auth, laravelVersion, phpVersion }) {
    return (
        <>
            <Head title="Welcome">
                <link
                    href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,680&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <div
                className="min-h-screen text-[#1B2430]"
                style={{
                    backgroundColor: '#F3F5F3',
                    backgroundImage:
                        'repeating-linear-gradient(to bottom, transparent, transparent 35px, #DDE3DE 36px)',
                    fontFamily: "'IBM Plex Sans', sans-serif",
                }}
            >
                <div className="mx-auto max-w-6xl px-6">
                    {/* ============================= NAV ============================= */}
                    <header className="flex items-center justify-between py-8">
                        <div className="flex items-center gap-2.5">
                            <div
                                className="flex h-9 w-9 items-center justify-center rounded-sm border-2 text-sm font-semibold"
                                style={{ borderColor: '#1B2430', fontFamily: "'Fraunces', serif" }}
                            >
                                R
                            </div>
                            <span className="text-[15px] font-medium tracking-tight">
                                Raheemullah <span className="text-[#5B6672]">POS &amp; Inventory</span>
                            </span>
                        </div>

                        <nav>
                            {auth?.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="rounded-sm border-2 border-[#1B2430] px-4 py-2 text-sm font-medium transition hover:bg-[#1B2430] hover:text-[#F3F5F3] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0E6E5C]"
                                >
                                    Open Dashboard
                                </Link>
                            ) : (
                                <Link
                                    href={route('login')}
                                    className="rounded-sm border-2 border-[#1B2430] px-4 py-2 text-sm font-medium transition hover:bg-[#1B2430] hover:text-[#F3F5F3] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0E6E5C]"
                                >
                                    Sign In
                                </Link>
                            )}
                        </nav>
                    </header>

                    {/* ============================= HERO ============================= */}
                    <section className="grid gap-14 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-16">
                        <div>
                            <p
                                className="mb-4 text-xs font-medium uppercase tracking-[0.18em]"
                                style={{ color: '#0E6E5C' }}
                            >
                                Point of Sale · Inventory · Reports
                            </p>
                            <h1
                                className="text-[2.75rem] leading-[1.08] tracking-tight sm:text-[3.4rem]"
                                style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
                            >
                                Every sale, tracked.
                                <br />
                                Every afghani, accounted for.
                            </h1>
                            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-[#5B6672]">
                                Write invoices, watch stock before it runs out, and know exactly
                                what's owed and what's been paid — one shop ledger, kept straight
                                automatically.
                            </p>

                            <div className="mt-8 flex items-center gap-4">
                                {auth?.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="rounded-sm px-6 py-3 text-sm font-medium text-[#F3F5F3] transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0E6E5C]"
                                        style={{ backgroundColor: '#1B2430' }}
                                    >
                                        Open Dashboard →
                                    </Link>
                                ) : (
                                    <Link
                                        href={route('login')}
                                        className="rounded-sm px-6 py-3 text-sm font-medium text-[#F3F5F3] transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0E6E5C]"
                                        style={{ backgroundColor: '#1B2430' }}
                                    >
                                        Sign In →
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Signature element: a tilted printed receipt, previewing the
                            actual executive report the app generates. */}
                        <div className="flex justify-center lg:justify-end">
                            <ReceiptPreview />
                        </div>
                    </section>

                    {/* ============================= FEATURE LEDGER ============================= */}
                    <section className="py-10 lg:py-14">
                        <p className="mb-1 text-xs font-medium uppercase tracking-[0.18em] text-[#5B6672]">
                            What's in the ledger
                        </p>
                        <div
                            className="mt-6 divide-y"
                            style={{ borderTop: '2px solid #1B2430', borderBottom: '2px solid #1B2430' }}
                        >
                            <LedgerRow
                                accent="#38416B"
                                title="Sales & Invoicing"
                                description="Wholesale and retail invoices, customer balances, and printable receipts — in Pashto and Dari or English."
                            />
                            <LedgerRow
                                accent="#0E6E5C"
                                title="Income & Expenses"
                                description="Every afghani in and out of the till, logged the day it happens — no end-of-month reconstruction."
                            />
                            <LedgerRow
                                accent="#B8860B"
                                title="Inventory & Stock Alerts"
                                description="See what's low before a customer asks for it, with a reorder suggestion already worked out."
                            />
                            <LedgerRow
                                accent="#9B3242"
                                title="Reports & Printable Ledgers"
                                description="A full 4-page executive report — cash flow, stock risk, and the credit ledger — one click to print."
                            />
                        </div>
                    </section>

                    {/* ============================= FOOTER ============================= */}
                    <footer
                        className="flex items-center justify-between py-10 text-xs"
                        style={{
                            fontFamily: "'IBM Plex Mono', monospace",
                            color: '#8A9490',
                            borderTop: '1px dashed #B7C0BB',
                        }}
                    >
                        <span>RAHEEMULLAH-POS · DESKTOP EDITION</span>
                        <span>
                            LARAVEL v{laravelVersion} · PHP v{phpVersion}
                        </span>
                    </footer>
                </div>
            </div>
        </>
    );
}

/**
 * A single ledger-row feature entry — a colored left tab (matching each
 * feature's accent color elsewhere in the app), a title, and a description.
 * Deliberately not a card grid: this app's entire UI is built from ruled
 * tables, so the landing page's feature list is one too.
 */
function LedgerRow({ accent, title, description }) {
    return (
        <div
            className="group flex items-start gap-5 py-6 transition-colors hover:bg-white/60"
            style={{ borderColor: '#DDE3DE' }}
        >
            <span
                className="mt-1.5 h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: accent }}
                aria-hidden="true"
            />
            <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-8">
                <h3
                    className="w-full shrink-0 text-lg sm:w-64"
                    style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
                >
                    {title}
                </h3>
                <p className="text-sm leading-relaxed text-[#5B6672]">{description}</p>
            </div>
        </div>
    );
}

/**
 * ReceiptPreview — the hero's signature element. A stylized printed
 * receipt with a perforated bottom edge (the classic ticket-stub CSS
 * trick: repeating radial-gradient notches matching the page background),
 * showing sample figures in the same shape as the real executive report.
 */
function ReceiptPreview() {
    return (
        <div
            className="w-72 -rotate-3 select-none rounded-sm bg-white p-6 shadow-[0_20px_45px_-15px_rgba(27,36,48,0.35)] transition-transform duration-500 hover:rotate-0 motion-reduce:transform-none"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
            <p className="text-center text-[11px] font-medium uppercase tracking-[0.18em] text-[#1B2430]">
                Raheemullah POS
            </p>
            <p className="mt-0.5 text-center text-[10px] text-[#8A9490]">Daily Report · Today</p>

            <div className="mt-4 border-t border-dashed border-[#B7C0BB] pt-4 text-[11px]">
                <ReceiptLine label="SALES" value="12,450.00" />
                <ReceiptLine label="INCOME" value="3,200.00" accent="#0E6E5C" />
                <ReceiptLine label="EXPENSES" value="-450.00" accent="#9B3242" />
            </div>

            <div className="mt-3 flex items-baseline justify-between border-t-2 border-[#1B2430] pt-3">
                <span className="text-[11px] font-semibold uppercase tracking-wide">Net</span>
                <span className="text-base font-semibold">15,200.00 ؋</span>
            </div>

            {/* Perforated tear edge — semicircle notches matching the page's
                background color, creating a torn-ticket illusion. */}
            <div
                aria-hidden="true"
                className="-mx-6 -mb-6 mt-6 h-3"
                style={{
                    backgroundImage:
                        'radial-gradient(circle at 8px 0, transparent 8px, #F3F5F3 9px)',
                    backgroundSize: '16px 16px',
                    backgroundRepeat: 'repeat-x',
                }}
            />
        </div>
    );
}

function ReceiptLine({ label, value, accent = '#1B2430' }) {
    return (
        <div className="flex items-baseline justify-between py-1">
            <span className="text-[#5B6672]">{label}</span>
            <span style={{ color: accent }}>{value} ؋</span>
        </div>
    );
}
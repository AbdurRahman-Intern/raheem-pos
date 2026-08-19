<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSaleRequest;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Sale;
use App\Services\SaleService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SaleController extends Controller
{
    public function __construct(protected SaleService $saleService) {}

    public function index(Request $request): Response
    {
        // return Inertia::render('Sales/Index', [
        //     'sales' => Sale::query()->with('items.product', 'customer')->latest()->get(),
        //     'filters' => $request->only(['search']),
        // ]);

        return Inertia::render('Sales/Index', [
            'sales' => Sale::query()
                ->with('customer:id,name,phone')
                ->when($request->search, function ($query, $search) {
                    $query->where('invoice_number', 'like', "%{$search}%")
                        ->orWhere('customer_name', 'like', "%{$search}%")
                        ->orWhere('customer_phone', 'like', "%{$search}%");
                })
                ->when($request->invoice_type, fn ($query, $type) => $query->where('invoice_type', $type))
                ->latest()
                ->paginate(15)
                ->withQueryString(),
            'filters' => $request->only(['search', 'invoice_type']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Sales/Create', [
            'customers' => Customer::all(),
            'products' => Product::all(),
        ]);
    }

    public function store(StoreSaleRequest $request): RedirectResponse
    {
        // dd($request->validated());
        $sale = $this->saleService->create($request->validated());

        if ($request->boolean('print_after_save')) {
            return redirect()->route('sales.show', $sale)->with('print', true);
        }

        // return redirect()->route('sales.index')->with('success', 'Invoice created.');

        return redirect()->route('sales.index')->with('success', 'Sale created successfully.');
    }

    public function show(Sale $sale)
    {
        $sale->load('items.product', 'customer');

        return Inertia::render('Sales/Show', [
            'invoice' => [
                'serial' => 117,
                'date' => '1404/05/18',
                'rows' => [
                    ['detail' => 'د ورج خواړه ۵۰ کیلو', 'qty' => 2, 'price' => 1200, 'total' => 2400],
                    ['detail' => 'واکسین پیکج',          'qty' => 1, 'price' => 800,  'total' => 800],
                    // up to 8 — remaining rows render blank automatically
                ],
                'received' => '',   // "درملو اخیستونکي شمیره" field
                'signature' => '',   // "لاسلیک" field
            ],
            'sale' => $sale,
        ]);
    }
}

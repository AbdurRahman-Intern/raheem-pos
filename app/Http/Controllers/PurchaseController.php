<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePurchaseRequest;
use App\Models\Purchase;
use App\Services\PurchaseService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PurchaseController extends Controller
{
    public function __construct(protected PurchaseService $purchaseService) {}

    public function index(Request $request): Response
    {
        return Inertia::render('Purchases/Index', [
            'purchases' => Purchase::query()->with('items.product')->latest()->get(),
            'filters' => $request->only(['search']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Purchases/Create');
    }

    public function store(StorePurchaseRequest $request): RedirectResponse
    {
        $this->purchaseService->create($request->validated());

        return redirect()->route('purchases.index')->with('success', 'Purchase created successfully.');
    }
}

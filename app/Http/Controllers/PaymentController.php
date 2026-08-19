<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function index()
    {

        return Inertia::render('Payments/Index', [
            'payments' => Payment::with('customer:id,name')->get(),
        ]);
    }

    public function create(Request $request)
    {
        return Inertia::render('Payments/Create', [
            'customers' => Customer::all(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'amount' => ['integer', 'required'],
            'baqaya' => ['integer', 'required'],
            'notes' => ['string'],
            'customer_id' => ['required'],
        ]);

        if ($data['amount'] > $data['baqaya']) {
            throw ValidationException::withMessages([
                'amount' => 'Wrong Number. ',
            ]);
        }

        $remaining_balance = $data['baqaya'] - $data['amount'];

        $customer = Customer::findOrFail($data['customer_id']);

        if (! $customer) {
            throw ValidationException::withMessages([
                'customer_id' => 'Customer Not Found. ',
            ]);
        }

        $customer->update([
            'baqaya' => $remaining_balance,
        ]);

        Payment::create([
            ...$data,
            'payment_date' => now(),
        ]);

        return redirect()->route('payments.index');

    }
}

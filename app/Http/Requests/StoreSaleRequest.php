<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSaleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['required'],
            'invoice_type' => [
                'required',
                Rule::in(['wholesale', 'retail']),
            ],

            'customer_id' => [
                'nullable',
                'required_if:invoice_type,wholesale',
                'exists:customers,id',
            ],

            'customer_name' => [
                'nullable',
                'required_if:invoice_type,retail',
                'string',
                'max:255',
            ],

            'customer_phone' => [
                'nullable',
                'string',
                'max:30',
            ],

            'customer_address' => [
                'nullable',
                'string',
                'max:255',
            ],

            'discount' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'paid_amount' => [
                'required',
                'numeric',
                'min:0',
            ],

            'items' => [
                'required',
                'array',
                'min:1',
            ],

            'subtotal' => ['required', 'numeric', 'min:0'],
            'previous_balance' => ['nullable', 'numeric'],
            'grand_total' => ['required', 'numeric', 'min:0'],
            'remaining_balance' => ['required', 'numeric'],

            'items.*.product_id' => [
                'required',
                'exists:products,id',
            ],

            'items.*.quantity' => [
                'required',
                'numeric',
                'gt:0',
            ],

            'items.*.unit_price' => [
                'required',
                'numeric',
                'min:0',
            ],

            'items.*.discount' => [
                'nullable',
                'numeric',
                'min:0',
            ],
        ];
    }
}

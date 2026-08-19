<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string'],
            'logo' => ['nullable', 'string'],
            'receipt_width' => ['required', 'integer', 'min:1'],
            'currency' => ['required', 'string', 'max:10'],
            'language' => ['required', 'string', 'in:en,ps,fa'],
        ];
    }
}

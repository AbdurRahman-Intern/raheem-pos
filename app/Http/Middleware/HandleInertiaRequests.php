<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'settings' => Setting::query()->firstOrCreate([], [
                'company_name' => 'Raheem Inventory',
                'phone' => '',
                'address' => '',
                'currency' => 'USD',
                'language' => 'en',
                'receipt_width' => 48,
            ]),
            'menuItems' => collect(config('menu'))->map(function ($item) {
                return [
                    'name' => __('menu.'.$item['name']),
                    'routeName' => $item['route'],
                    'href' => Route::has($item['route']) ? route($item['route']) : '#',
                ];
            })->values(),
            'translation' => [
                'pages' => trans('pages'),
                'buttons' => trans('buttons'),
                'customers' => trans('customers'),
                'sales' => trans('sales'),
                'products' => trans('products'),
                'dashboard' => trans('dashboard'),
                'finance' => trans('finance'),
                'reports' => trans('reports'),
            ],
            'flash' => [
                'print' => $request->session()->get('print'),
                'success' => $request->session()->get('success'),
            ],
        ];
    }
}

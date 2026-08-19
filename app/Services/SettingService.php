<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\DB;

class SettingService
{
    public function get(): Setting
    {
        return Setting::query()->firstOrCreate([], [
            'company_name' => 'Raheem Inventory',
            'phone' => '',
            'address' => '',
            'currency' => 'USD',
            'language' => 'en',
            'receipt_width' => 48,
        ]);
    }

    public function update(array $payload): Setting
    {
        return DB::transaction(function () use ($payload) {
            $setting = $this->get();
            $setting->update($payload);

            return $setting->fresh();
        });
    }

    public function updateLanguage(string $language): Setting
    {
        return DB::transaction(function () use ($language) {
            $setting = $this->get();
            $setting->update(['language' => $language]);

            session(['locale' => $language]);

            return $setting->fresh();
        });
    }
}

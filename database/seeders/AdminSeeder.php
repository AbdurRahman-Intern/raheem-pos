<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        User::query()->firstOrCreate(
            ['email' => 'admin@inventory.local'],
            [
                'name' => 'Administrator',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
            ],
        );

        \App\Models\Setting::query()->firstOrCreate([], [
            'company_name' => 'Raheem Inventory',
            'phone' => '+123456789',
            'address' => 'Main Office',
            'currency' => 'USD',
            'language' => 'en',
        ]);
    }
}
